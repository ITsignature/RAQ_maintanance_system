import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Plus, Search, Eye, Edit2, Trash2, Calendar, Clock, DollarSign, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



type Booking = {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  customer_id: number;
  service_name: string;
  service_amount: string;
  note: string | null;
  status: string;
  payment_status: string;
  is_active: number;
  created_at: string;
};

type Customer = {
  id: number;
  name: string;
  phone_no: string;
  email?: string;
};

type Staff = {
  id: number;
  name: string;
  phone_no: string;
};

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Pagination from API
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
 

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = `/api/bookings?page=${page}`;
      if (fromDate && toDate) {
        url += `&from=${fromDate}&to=${toDate}`;
      }

      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      
      const data = await res.json();
      console.log('📦 Bookings data:', data);
      
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error('❌ Error fetching bookings:', error);
      toast.error(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all customers at once after bookings are loaded
  const fetchCustomers = async () => {
    try {
      // Get unique customer IDs from bookings
      const customerIds = [...new Set(bookings.map(b => b.customer_id))];
      
      if (customerIds.length === 0) return;

      // Fetch each customer
      const customerPromises = customerIds.map(async (id) => {
        try {
          const res = await apiFetch(`/api/users/${id}`);
          if (res.ok) {
            return await res.json();
          }
        } catch (error) {
          console.error(`Failed to fetch customer ${id}:`, error);
        }
        return null;
      });

      const fetchedCustomers = await Promise.all(customerPromises);
      const validCustomers = fetchedCustomers.filter(c => c !== null) as Customer[];
      console.log('👥 Customers data:', validCustomers);
      setCustomers(validCustomers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  // Fetch staff
  const fetchStaff = async () => {
    try {
      const res = await apiFetch('/api/users/staff');
      if (res.ok) {
        const data = await res.json();
        console.log('👥 Staff data:', data);
        setStaffList(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  // Load bookings on mount and when page/date changes
  useEffect(() => {
  fetchBookings();
  }, [page, fromDate, toDate]);

  // Load customers after bookings are fetched
  useEffect(() => {
    if (bookings.length > 0) {
      fetchCustomers();
    }
  }, [bookings]);

  useEffect(() => {
    fetchStaff();
  }, []);

  // Client-side filtering (search and status)
  const filteredBookings = bookings.filter((booking) => {
    const customer = customers.find((c) => c.id === booking.customer_id);
    
    const matchesSearch =
      !searchTerm ||
      booking.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.name && customer?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer?.phone_no && customer?.phone_no.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (bookingId: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const res = await apiFetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete booking');

      toast.success('Booking deleted successfully');
      fetchBookings(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete booking');
    }
  };

  // Synchronous lookup function for use in render
  const getCustomerById = (customerId: number): Customer | undefined => {
    return customers.find(c => c.id === customerId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: string) => {
    return `LKR ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const clearDateFilter = () => {
    setDateFilter('');
    setPage(1);
  };

  const exportToPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Bookings Report', 14, 15);

  doc.setFontSize(10);
  doc.text(`From: ${fromDate}  To: ${toDate}`, 14, 22);

  const tableData = filteredBookings.map((b) => {
    const customer = getCustomerById(b.customer_id);
    return [
      formatDate(b.booking_date),
      customer?.name || '',
      customer?.phone_no || '',
      b.service_name,
      b.status,
      b.payment_status,
      formatCurrency(b.service_amount),
    ];
  });

  autoTable(doc, {
    startY: 28,
    head: [[
      'Date',
      'Customer',
      'Phone',
      'Service',
      'Status',
      'Payment',
      'Amount'
    ]],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`bookings_${fromDate}_to_${toDate}.pdf`);
};

  return (
    <motion.div
      className="flex-1 mx-auto p-2 md:p-2 lg:p-2 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            Manage all maintenance bookings ({total} total)
          </p>
        </div>
        
        
        <Link to="/bookings/new" className="w-full sm:w-auto">
        
          <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </Link>
        
      </motion.div>

      {/* Filters */}
<Card>
  <CardHeader>
    <CardTitle className="text-base md:text-lg">Filters</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by customer, phone, or service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Export */}
      <Button
        variant="outline"
        onClick={exportToPDF}
        className="w-full"
      >
        Export PDF
      </Button>

    </div>
  </CardContent>
</Card>


      {/* Bookings Table/Cards */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading bookings...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => {
                        const customer = getCustomerById(booking.customer_id);

                        return (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{formatDate(booking.booking_date)}</p>
                                <p className="text-sm text-gray-600">
                                  {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{customer?.name || 'Loading...'}</TableCell>
                            <TableCell>{customer?.phone_no || 'N/A'}</TableCell>
                            <TableCell>{booking.service_name}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.payment_status)}>{booking.payment_status}</Badge>
                            </TableCell>
                            
                          <TableCell className="text-right">
                          {booking.service_amount === "0.00"
                            ? "Not assigned"
                            : formatCurrency(booking.service_amount)}
                        </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/bookings/${booking.id}`}>
                                  <Button size="sm" variant="ghost">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Link to={`/bookings/${booking.id}/edit`}>
                                  <Button size="sm" variant="ghost">
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No bookings found
                  </div>
                ) : (
                  filteredBookings.map((booking) => {
                    const customer = getCustomerById(booking.customer_id);

                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        {/* Header with Date and Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm md:text-base truncate">
                                {formatDate(booking.booking_date)}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} text-xs flex-shrink-0`}>
                            {booking.status}
                          </Badge>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{customer?.name || 'Loading...'}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{customer?.phone_no || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Service and Amount */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="min-w-0 flex-1 mr-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Service</p>
                            <p className="font-medium text-sm truncate">{booking.service_name}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Amount</p>
                            <p className="font-bold text-sm">{formatCurrency(booking.service_amount)}</p>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <Badge className={`${getStatusColor(booking.payment_status)} text-xs`}>
                              {booking.payment_status}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link to={`/bookings/${booking.id}`}>
                              <Button size="sm" variant="outline" className="h-8">
                                <Eye className="w-3 h-3 mr-1" />
                                <span className="text-xs">View</span>
                              </Button>
                            </Link>
                            <Link to={`/bookings/${booking.id}/edit`}>
                              <Button size="sm" variant="outline" className="h-8">
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <span className="text-sm text-gray-400">
                  ({filteredBookings.length} of {total} bookings)
                </span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === totalPages}
                className="w-full sm:w-auto"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

