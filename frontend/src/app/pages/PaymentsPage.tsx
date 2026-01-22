import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Eye,
  DollarSign,
  Loader2,
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { toast } from 'sonner';
import { motion } from 'motion/react';

type Payment = {
  id: number;
  booking_id: number;
  amount: string;
  method: string | null;
  reference_no: string | null;
  paid_at: string;
  note: string | null;
  is_active: boolean;
  created_by: number;
  service_name: string;
  service_amount: string;
  payment_status: string;
  customer_name?: string;
  customer_phone?: string;
  booking_date?: string;
};

type PaginationData = {
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
};

type Statistics = {
  totalPayments: number;
  totalAmount: number;
  todayPayments: number;
  todayAmount: number;
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 1,
    perPage: 50,
  });

  const [statistics, setStatistics] = useState<Statistics>({
    totalPayments: 0,
    totalAmount: 0,
    todayPayments: 0,
    todayAmount: 0,
  });

  // Filters
  const [dateFilter, setDateFilter] = useState(() => {
    // Default to today's date
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch payments with filters
  const fetchPayments = async (page: number = 1) => {
    setLoading(true);
    try {
      let url = `/api/payments/overview?page=${page}`;
      
      // Add date filter
      if (dateFilter) {
        url += `&date=${dateFilter}`;
      }

      // Add payment method filter
      if (paymentMethodFilter !== 'all') {
        url += `&method=${encodeURIComponent(paymentMethodFilter)}`;
      }

      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to fetch payments');

      const data = await res.json();
      
      setPayments(data.payments);
      setPagination(data.pagination);
      setStatistics(data.statistics);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [dateFilter, paymentMethodFilter]);

  // Apply search filter
  const filteredPayments = payments.filter((payment) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        payment.customer_name?.toLowerCase().includes(search) ||
        payment.customer_phone?.includes(search) ||
        payment.service_name.toLowerCase().includes(search) ||
        payment.reference_no?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `LKR ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodColor = (method: string | null) => {
    const colors: Record<string, string> = {
      'Cash': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      'Card': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
      'Online Transfer': 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400',
    };
    return colors[method || 'Other'] || 'bg-gray-100 text-gray-800';
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPayments(newPage);
    }
  };

  const clearFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateFilter(today);
    setPaymentMethodFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all payment transactions
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.totalPayments}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(statistics.totalAmount)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Payments</CardTitle>
              <DollarSign className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.todayPayments}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(statistics.todayAmount)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  statistics.totalPayments > 0
                    ? statistics.totalAmount / statistics.totalPayments
                    : 0
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(statistics.totalAmount)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-filter" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label htmlFor="method-filter">Payment Method</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger id="method-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Label>
              <Input
                id="search"
                placeholder="Customer, service, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment Transactions
            {dateFilter && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({formatDate(dateFilter)})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-sm">
                            #{payment.id}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDateTime(payment.paid_at)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{payment.customer_name}</div>
                              <div className="text-xs text-gray-500">
                                {payment.customer_phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{payment.service_name}</div>
                              <div className="text-xs text-gray-500">
                                Booking #{payment.booking_id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getMethodColor(payment.method)}>
                              {payment.method || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {payment.reference_no || '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                            {payment.note || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/bookings/${payment.booking_id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t dark:border-gray-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total payments)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}