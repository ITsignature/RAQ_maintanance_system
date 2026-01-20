import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  FileText,
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
import { formatCurrency, formatDate, getPaymentStatus, getStatusColor } from '@/lib/utils';
import { mockUsers } from '@/lib/mock-data';
import { motion } from 'motion/react';

export function ReportsPage() {
  const { bookings, customers, payments, getCustomerById } = useData();
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');

  // Filter bookings by date range
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return bookingDate >= start && bookingDate <= end;
  });

  // Calculate statistics
  const totalBookings = filteredBookings.length;
  const completedBookings = filteredBookings.filter((b) => b.status === 'Completed').length;
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const collectedPayments = filteredBookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const pendingPayments = totalRevenue - collectedPayments;

  // Payment method breakdown
  const paymentMethodStats = payments.reduce((acc, payment) => {
    acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  // Staff performance
  const staffStats = mockUsers
    .filter((u) => u.role === 'Staff')
    .map((staff) => {
      const staffBookings = filteredBookings.filter((b) => b.staffId === staff.id);
      const completed = staffBookings.filter((b) => b.status === 'Completed').length;
      const revenue = staffBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      return {
        staff,
        bookings: staffBookings.length,
        completed,
        revenue,
      };
    });

  const exportReport = (reportType: string) => {
    // Simulate export - in real app would generate CSV/PDF
    alert(`Exporting ${reportType} report...`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate business reports and analytics</p>
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
                <Button variant="outline" className="w-full">
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
            <Calendar className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-gray-600 mt-1">
              {completedBookings} completed ({Math.round((completedBookings / totalBookings) * 100) || 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-600 mt-1">Selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected Payments</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(collectedPayments)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((collectedPayments / totalRevenue) * 100) || 0}% collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(pendingPayments)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Outstanding amount</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments Report */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Payments Report</CardTitle>
            <Button size="sm" variant="outline" onClick={() => exportReport('Pending Payments')}>
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
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings
                    .filter((b) => b.totalAmount > b.paidAmount)
                    .slice(0, 5)
                    .map((booking) => {
                      const customer = getCustomerById(booking.customerId);
                      const paymentStatus = getPaymentStatus(
                        booking.totalAmount,
                        booking.paidAmount
                      );
                      const balance = booking.totalAmount - booking.paidAmount;

                      return (
                        <TableRow key={booking.id}>
                          <TableCell>{customer?.fullName}</TableCell>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(booking.totalAmount)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {formatCurrency(balance)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(paymentStatus)}>
                              {paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment Collection Report</CardTitle>
            <Button size="sm" variant="outline" onClick={() => exportReport('Payment Collection')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(paymentMethodStats).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{method}</Badge>
                    <span className="text-sm text-gray-600">
                      {payments.filter((p) => p.paymentMethod === method).length} payments
                    </span>
                  </div>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Collected</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(collectedPayments)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff Performance Report</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportReport('Staff Performance')}>
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
                {staffStats.map(({ staff, bookings, completed, revenue }) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.fullName}</TableCell>
                    <TableCell className="text-right">{bookings}</TableCell>
                    <TableCell className="text-right">{completed}</TableCell>
                    <TableCell className="text-right">
                      {bookings > 0 ? Math.round((completed / bookings) * 100) : 0}%
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Activity Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Activity Report</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportReport('Customer Activity')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{customers.length}</p>
              <p className="text-sm text-gray-600">Total Customers</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">
                {new Set(filteredBookings.map((b) => b.customerId)).size}
              </p>
              <p className="text-sm text-gray-600">Active Customers</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">
                {formatCurrency(totalRevenue / filteredBookings.length || 0)}
              </p>
              <p className="text-sm text-gray-600">Avg. Booking Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}