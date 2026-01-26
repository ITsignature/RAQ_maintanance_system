import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Download,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { motion } from 'motion/react';
import { toast } from 'sonner';

type Booking = {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  customer_id: number;
  service_name: string;
  service_amount: string;
  status: string;
  payment_status: string;
};

type Customer = {
  id: number;
  name: string;
  phone_no: string;
  email?: string;
};

type Payment = {
  id: number;
  booking_id: number;
  amount: string;
  method: string;
  paid_at: string;
};

type Staff = {
  id: number;
  name: string;
  role: string;
};

type ReportData = {
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  collectedPayments: number;
  pendingPayments: number;
  bookingsWithPending: Booking[];
  paymentMethodStats: Record<string, number>;
  staffPerformance: any[];
  totalCustomers: number;
  activeCustomers: number;
  avgBookingValue: number;
};

export function ReportsPage() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  const [reportData, setReportData] = useState<ReportData>({
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    collectedPayments: 0,
    pendingPayments: 0,
    bookingsWithPending: [],
    paymentMethodStats: {},
    staffPerformance: [],
    totalCustomers: 0,
    activeCustomers: 0,
    avgBookingValue: 0,
  });
  const [customers, setCustomers] = useState<Map<number, Customer>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch all bookings
      const bookingsRes = await apiFetch('/api/bookings?page=1');
      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');

      const bookingsData = await bookingsRes.json();
      const allBookings: Booking[] = bookingsData.bookings || [];

      // Filter bookings by date range
      const filteredBookings = allBookings.filter((booking) => {
        const bookingDate = booking.booking_date;
        return bookingDate >= startDate && bookingDate <= endDate;
      });

      // Calculate basic stats
      const totalBookings = filteredBookings.length;
      const completedBookings = filteredBookings.filter(
        (b) => b.status.toLowerCase() === 'completed'
      ).length;

      const totalRevenue = filteredBookings.reduce(
        (sum, b) => sum + parseFloat(b.service_amount),
        0
      );

      // Fetch payments for all bookings in range
      let collectedPayments = 0;
      let pendingPayments = 0;
      const bookingsWithPending: Booking[] = [];
      const paymentsByMethod: Record<string, number> = {};

      for (const booking of filteredBookings) {
        const paymentsRes = await apiFetch(`/api/payments?booking_id=${booking.id}`);
        if (paymentsRes.ok) {
          const payments: Payment[] = await paymentsRes.json();
          const bookingPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
          
          collectedPayments += bookingPaid;

          // Track payment methods
          payments.forEach((payment) => {
            const method = payment.method || 'Unknown';
            paymentsByMethod[method] = (paymentsByMethod[method] || 0) + parseFloat(payment.amount);
          });

          // Check for pending payments
          const serviceAmount = parseFloat(booking.service_amount);
          if (bookingPaid < serviceAmount) {
            pendingPayments += serviceAmount - bookingPaid;
            bookingsWithPending.push(booking);
          }
        }
      }

      // Fetch customers
      const customersRes = await apiFetch('/api/users?role=customer&page=1');
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        const customerMap = new Map<number, Customer>();
        (customersData.users || []).forEach((customer: Customer) => {
          customerMap.set(customer.id, customer);
        });
        setCustomers(customerMap);
      }

      // Fetch unique customer IDs for active customers count
      const uniqueCustomerIds = new Set(filteredBookings.map((b) => b.customer_id));
      const activeCustomers = uniqueCustomerIds.size;

      // Fetch total customers count
      const totalCustomersRes = await apiFetch('/api/users?role=customer&page=1');
      const totalCustomersData = totalCustomersRes.ok ? await totalCustomersRes.json() : { total: 0 };

      // Fetch staff for performance report
      const staffRes = await apiFetch('/api/users?role=staff&page=1');
      let staffPerformance: any[] = [];
      
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        const staffList: Staff[] = staffData.users || [];

        // Calculate performance for each staff member
        staffPerformance = await Promise.all(
          staffList.map(async (staff) => {
            // Fetch bookings for this staff
            const staffBookingsRes = await apiFetch(`/api/bookings/${staff.id}/staff`);
            let staffBookings: Booking[] = [];
            
            if (staffBookingsRes.ok) {
              const allStaffBookings = await staffBookingsRes.json();
              // Filter by date range
              staffBookings = allStaffBookings.filter((b: Booking) => {
                return b.booking_date >= startDate && b.booking_date <= endDate;
              });
            }

            const completed = staffBookings.filter(
              (b) => b.status.toLowerCase() === 'completed'
            ).length;
            
            const revenue = staffBookings.reduce(
              (sum, b) => sum + parseFloat(b.service_amount),
              0
            );

            return {
              staff,
              bookings: staffBookings.length,
              completed,
              revenue,
            };
          })
        );
      }

      // Calculate average booking value
      const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      setReportData({
        totalBookings,
        completedBookings,
        totalRevenue,
        collectedPayments,
        pendingPayments,
        bookingsWithPending: bookingsWithPending.slice(0, 10), // Limit to 10 for display
        paymentMethodStats: paymentsByMethod,
        staffPerformance,
        totalCustomers: totalCustomersData.total || 0,
        activeCustomers,
        avgBookingValue,
      });
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      toast.error(error.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when date range changes
  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  // Helper functions
  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getCustomerById = (customerId: number): Customer | undefined => {
    return customers.get(customerId);
  };

  const exportReport = (reportType: string) => {
    // Create CSV content based on report type
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'Pending Payments':
        filename = `pending-payments-${startDate}-to-${endDate}.csv`;
        csvContent = 'Customer,Date,Total Amount,Paid Amount,Balance,Status\n';
        reportData.bookingsWithPending.forEach((booking) => {
          const customer = getCustomerById(booking.customer_id);
          // Calculate paid amount (we'd need to fetch this in real implementation)
          const balance = parseFloat(booking.service_amount);
          csvContent += `"${customer?.name || 'Unknown'}","${booking.booking_date}","${booking.service_amount}","0","${balance}","${booking.payment_status}"\n`;
        });
        break;

      case 'Payment Collection':
        filename = `payment-collection-${startDate}-to-${endDate}.csv`;
        csvContent = 'Payment Method,Amount,Percentage\n';
        const total = Object.values(reportData.paymentMethodStats).reduce((a, b) => a + b, 0);
        Object.entries(reportData.paymentMethodStats).forEach(([method, amount]) => {
          const percentage = total > 0 ? ((amount / total) * 100).toFixed(2) : '0';
          csvContent += `"${method}","${amount}","${percentage}%"\n`;
        });
        break;

      case 'Staff Performance':
        filename = `staff-performance-${startDate}-to-${endDate}.csv`;
        csvContent = 'Staff Member,Total Bookings,Completed,Completion Rate,Total Revenue\n';
        reportData.staffPerformance.forEach(({ staff, bookings, completed, revenue }) => {
          const rate = bookings > 0 ? ((completed / bookings) * 100).toFixed(2) : '0';
          csvContent += `"${staff.name}","${bookings}","${completed}","${rate}%","${revenue}"\n`;
        });
        break;

      case 'All Reports':
        filename = `summary-report-${startDate}-to-${endDate}.csv`;
        csvContent = 'Report Summary\n';
        csvContent += `Period,"${startDate} to ${endDate}"\n\n`;
        csvContent += 'Metric,Value\n';
        csvContent += `Total Bookings,${reportData.totalBookings}\n`;
        csvContent += `Completed Bookings,${reportData.completedBookings}\n`;
        csvContent += `Total Revenue,${reportData.totalRevenue}\n`;
        csvContent += `Collected Payments,${reportData.collectedPayments}\n`;
        csvContent += `Pending Payments,${reportData.pendingPayments}\n`;
        csvContent += `Total Customers,${reportData.totalCustomers}\n`;
        csvContent += `Active Customers,${reportData.activeCustomers}\n`;
        csvContent += `Average Booking Value,${reportData.avgBookingValue.toFixed(2)}\n`;
        break;

      default:
        toast.error('Unknown report type');
        return;
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${reportType} report exported successfully`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate business reports and analytics
        </p>
      </motion.div>

      {/* Date Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => exportReport('All Reports')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalBookings}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {reportData.completedBookings} completed (
              {reportData.totalBookings > 0
                ? Math.round((reportData.completedBookings / reportData.totalBookings) * 100)
                : 0}
              %)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected Payments</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              {formatCurrency(reportData.collectedPayments)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {reportData.totalRevenue > 0
                ? Math.round((reportData.collectedPayments / reportData.totalRevenue) * 100)
                : 0}
              % collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">
              {formatCurrency(reportData.pendingPayments)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Outstanding amount</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments Report */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Payments Report</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportReport('Pending Payments')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.bookingsWithPending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No pending payments
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData.bookingsWithPending.slice(0, 5).map((booking) => {
                      const customer = getCustomerById(booking.customer_id);

                      return (
                        <TableRow key={booking.id}>
                          <TableCell>{customer?.name || 'Unknown'}</TableCell>
                          <TableCell>{formatDate(booking.booking_date)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(parseFloat(booking.service_amount))}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.payment_status)}>
                              {booking.payment_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment Collection Report</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportReport('Payment Collection')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {Object.keys(reportData.paymentMethodStats).length === 0 ? (
              <p className="text-center py-8 text-gray-500">No payments recorded</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(reportData.paymentMethodStats).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{method}</Badge>
                    </div>
                    <span className="font-semibold">{formatCurrency(amount)}</span>
                  </div>
                ))}
                <div className="pt-4 border-t dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Collected</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-500">
                      {formatCurrency(reportData.collectedPayments)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff Performance Report</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportReport('Staff Performance')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead className="text-right">Total Bookings</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Completion Rate</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.staffPerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No staff data available
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData.staffPerformance.map(({ staff, bookings, completed, revenue }) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell className="text-right">{bookings}</TableCell>
                      <TableCell className="text-right">{completed}</TableCell>
                      <TableCell className="text-right">
                        {bookings > 0 ? Math.round((completed / bookings) * 100) : 0}%
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(revenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Activity Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Activity Report</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportReport('All Reports')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg dark:border-gray-800">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <p className="text-2xl font-bold">{reportData.totalCustomers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
            </div>
            <div className="text-center p-4 border rounded-lg dark:border-gray-800">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="text-2xl font-bold">{reportData.activeCustomers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Customers</p>
            </div>
            <div className="text-center p-4 border rounded-lg dark:border-gray-800">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
              <p className="text-2xl font-bold">{formatCurrency(reportData.avgBookingValue)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Booking Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}