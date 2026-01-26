import React, { useState, useEffect } from 'react';
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
import { Calendar } from '@/app/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { Search, Plus, Phone, Mail, CalendarIcon, Filter, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Customer = {
  id: number;
  name: string;
  phone_no: string;
  email?: string;
  address?: string;
  loyalty_number?: string;
  created_at: string;
  last_booking_date?: string | null;
  total_bookings?: number;
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Date filter states
  const [dateFilterType, setDateFilterType] = useState<'all' | 'range' | 'before' | 'after'>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);

  // Fetch customers with their last booking date
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      // Fetch all customers
      const customersRes = await apiFetch('/api/users/customers');

      if (!customersRes.ok) throw new Error('Failed to fetch customers');

      const customersData = await customersRes.json();
      console.log('👥 Customers data:', customersData);
      const customersList: Customer[] = Array.isArray(customersData)
        ? customersData
        : (customersData.users || []);

      // Fetch all bookings to calculate last booking date for each customer
      const bookingsRes = await apiFetch('/api/bookings?page=1');

      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');

      const bookingsData = await bookingsRes.json();
      console.log('📅 Bookings data:', bookingsData);
      const allBookings = bookingsData.bookings || [];

      // Calculate last booking date and total bookings for each customer
      const customersWithBookingInfo = customersList.map((customer) => {
        const customerBookings = allBookings.filter(
          (b: any) => b.customer_id === customer.id
        );

        let lastBookingDate = null;
        if (customerBookings.length > 0) {
          // Sort by booking_date DESC and get the most recent
          const sortedBookings = customerBookings.sort(
            (a: any, b: any) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
          );
          lastBookingDate = sortedBookings[0].booking_date;
        }

        return {
          ...customer,
          last_booking_date: lastBookingDate,
          total_bookings: customerBookings.length,
        };
      });

      setCustomers(customersWithBookingInfo);
      setFilteredCustomers(customersWithBookingInfo);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error(error.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term) ||
          customer.phone_no.includes(term) ||
          customer.email?.toLowerCase().includes(term) ||
          customer.loyalty_number?.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (dateFilterType !== 'all' && filtered.length > 0) {
      filtered = filtered.filter((customer) => {
        if (!customer.last_booking_date) return false; // Exclude customers with no bookings

        const lastBooking = new Date(customer.last_booking_date);

        switch (dateFilterType) {
          case 'range':
            if (startDate && endDate) {
              return lastBooking >= startDate && lastBooking <= endDate;
            }
            return true;

          case 'after':
            if (singleDate) {
              return lastBooking >= singleDate;
            }
            return true;

          case 'before':
            if (singleDate) {
              return lastBooking <= singleDate;
            }
            return true;

          default:
            return true;
        }
      });
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, customers, dateFilterType, startDate, endDate, singleDate]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return format(date, 'MMM dd, yyyy');
  };

  const clearDateFilter = () => {
    setDateFilterType('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setSingleDate(undefined);
  };

  const hasActiveFilters = searchTerm || dateFilterType !== 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 mx-auto p-2 md:p-2 lg:p-2 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            Manage your customer database
          </p>
        </div>
        <Link to="/customers/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Filter className="w-4 h-4 md:w-5 md:h-5" />
            Filters
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  clearDateFilter();
                }}
                className="ml-auto"
              >
                <X className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search - Full Width on Mobile */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, phone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Filter Type - Full Width on Mobile */}
            <div className="w-full">
              <Select value={dateFilterType} onValueChange={(value: any) => setDateFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Last booking date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="range">Date Range</SelectItem>
                  <SelectItem value="after">After Date</SelectItem>
                  <SelectItem value="before">Before Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            {dateFilterType === 'range' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'MMM dd, yyyy') : 'Start Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'MMM dd, yyyy') : 'End Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Single Date Picker */}
            {(dateFilterType === 'after' || dateFilterType === 'before') && (
              <div className="w-full">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {singleDate ? format(singleDate, 'MMM dd, yyyy') : 'Select Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={singleDate}
                      onSelect={setSingleDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </CardContent>
      </Card>

      {/* Customers Table/Cards */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Loyalty #</TableHead>
                  <TableHead className="text-center">Total Bookings</TableHead>
                  <TableHead>Last Booking</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {hasActiveFilters ? 'No customers match your filters' : 'No customers found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <TableCell>
                        <Link
                          to={`/customers/${customer.id}`}
                          className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <a
                              href={`tel:${customer.phone_no}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {customer.phone_no}
                            </a>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="w-3 h-3" />
                              <a
                                href={`mailto:${customer.email}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {customer.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.loyalty_number ? (
                          <Badge variant="outline">{customer.loyalty_number}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{customer.total_bookings || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        {customer.last_booking_date ? (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formatDate(customer.last_booking_date)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/customers/${customer.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {hasActiveFilters ? 'No customers match your filters' : 'No customers found'}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  {/* Header with name and loyalty */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="font-semibold text-lg hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {customer.name}
                      </Link>
                      {customer.loyalty_number && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {customer.loyalty_number}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {customer.total_bookings || 0} bookings
                    </Badge>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${customer.phone_no}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {customer.phone_no}
                      </a>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <a
                          href={`mailto:${customer.email}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                        >
                          {customer.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Last Booking Date */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Last booking:</span>
                      <span className="font-medium">
                        {customer.last_booking_date ? formatDate(customer.last_booking_date) : 'Never'}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/customers/${customer.id}`}>View</Link>
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}