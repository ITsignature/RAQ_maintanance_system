import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Eye, DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { formatCurrency, formatDate, getPaymentStatus, getStatusColor } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function PaymentsPage() {
  const { bookings, getCustomerById } = useData();

  const pendingBookings = bookings.filter(
    (b) => b.totalAmount > b.paidAmount
  );

  const totalPending = pendingBookings.reduce(
    (sum, b) => sum + (b.totalAmount - b.paidAmount),
    0
  );
  
  const unpaidCount = pendingBookings.filter(b => b.paidAmount === 0).length;
  const partiallyPaidCount = pendingBookings.filter(
    b => b.paidAmount > 0 && b.paidAmount < b.totalAmount
  ).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">Manage pending and completed payments</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
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
              <CardTitle className="text-sm font-medium">Unpaid Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unpaidCount}</div>
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
              <CardTitle className="text-sm font-medium">Partially Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partiallyPaidCount}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No pending payments
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingBookings.map((booking) => {
                    const customer = getCustomerById(booking.customerId);
                    const paymentStatus = getPaymentStatus(
                      booking.totalAmount,
                      booking.paidAmount
                    );
                    const balance = booking.totalAmount - booking.paidAmount;

                    return (
                      <TableRow key={booking.id}>
                        <TableCell>{formatDate(booking.date)}</TableCell>
                        <TableCell>{customer?.fullName}</TableCell>
                        <TableCell>{customer?.phoneNumber}</TableCell>
                        <TableCell>{booking.product}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(booking.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(booking.paidAmount)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(balance)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(paymentStatus)}>
                            {paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/bookings/${booking.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
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
    </div>
  );
}