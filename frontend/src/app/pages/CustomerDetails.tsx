import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
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
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  Edit2,
} from 'lucide-react';
import { formatCurrency, formatDate, getPaymentStatus, getStatusColor } from '@/lib/utils';
import { mockUsers } from '@/lib/mock-data';
import { motion } from 'motion/react';

export function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, bookings, payments } = useData();

  const customer = customers.find((c) => c.id === id);
  const customerBookings = bookings.filter((b) => b.customerId === id);
  const customerPayments = payments.filter((p) =>
    customerBookings.some((b) => b.id === p.bookingId)
  );

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl text-gray-600">Customer not found</p>
          <Link to="/customers">
            <Button className="mt-4">Back to Customers</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalBookings = customerBookings.length;
  const completedBookings = customerBookings.filter((b) => b.status === 'Completed').length;
  const totalSpent = customerBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPaid = customerBookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const outstandingBalance = totalSpent - totalPaid;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/customers')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Customer Profile
            </h1>
            <p className="text-gray-600 mt-1">View customer details and maintenance history</p>
          </div>
        </div>
        <Link to={`/customers/${customer.id}/edit`}>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-500">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Customer
          </Button>
        </Link>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-lg">{customer.fullName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </p>
                <p className="font-medium">{customer.phoneNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="font-medium">{customer.email || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Loyalty Number
                </p>
                <p className="font-medium">
                  {customer.loyaltyNumber ? (
                    <Badge variant="outline" className="text-blue-600">
                      {customer.loyaltyNumber}
                    </Badge>
                  ) : (
                    'Not enrolled'
                  )}
                </p>
              </div>
            </div>
            {customer.address && (
              <div className="space-y-1 pt-2 border-t">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </p>
                <p className="font-medium">{customer.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="font-bold text-blue-600">{totalBookings}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-bold text-green-600">{completedBookings}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="font-bold">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Paid</span>
                <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div
                className={`flex justify-between items-center p-3 rounded-lg ${
                  outstandingBalance > 0 ? 'bg-red-50' : 'bg-green-50'
                }`}
              >
                <span className="text-sm text-gray-600">Outstanding</span>
                <span
                  className={`font-bold ${
                    outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(outstandingBalance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Maintenance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No maintenance records found</p>
              <p className="text-gray-400 text-sm mt-2">
                This customer doesn't have any bookings yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerBookings
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((booking) => {
                      const staff = mockUsers.find((u) => u.id === booking.staffId);
                      const paymentStatus = getPaymentStatus(
                        booking.paidAmount,
                        booking.totalAmount
                      );

                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-sm">
                            #{booking.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {booking.startTime} - {booking.endTime}
                            </div>
                          </TableCell>
                          <TableCell>{booking.product}</TableCell>
                          <TableCell>{staff?.fullName || 'Unassigned'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(paymentStatus)}>
                              {paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(booking.totalAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/bookings/${booking.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {customerPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerPayments
                    .sort(
                      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
                    )
                    .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          #{payment.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          #{payment.bookingId.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.method}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}