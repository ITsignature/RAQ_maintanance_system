import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

type Customer = {
  id: number;
  name: string;
  phone_no: string;
  telephone?: string;
  email?: string;
  address?: string;
  loyalty_number?: string;
  created_at: string;
};

type Staff = {
  id: number;
  name: string;
  phone_no: string;
};

type Booking = {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  service_name: string;
  service_amount: string;
  status: string;
  payment_status: string;
  note: string | null;
  created_at: string;
  paid_amount: string;
  staff: Staff[];
};

type Payment = {
  id: number;
  booking_id: number;
  amount: string;
  method: string | null;
  reference_no: string | null;
  paid_at: string;
  service_name: string;
};

type Statistics = {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  totalPaid: number;
  outstandingBalance: number;
};

export function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    totalPaid: 0,
    outstandingBalance: 0
  });

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/users/customers/${id}/details`);

      if (!res.ok) {
        throw new Error('Failed to fetch customer details');
      }

      const data = await res.json();
      setCustomer(data.customer);
      setBookings(data.bookings);
      setPayments(data.payments);
      setStatistics(data.statistics);

      console.log(data);

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

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

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Paid': 'bg-green-100 text-green-800',
      'Unpaid': 'bg-red-100 text-red-800',
      'Partial': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">Customer Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View customer details and booking history
            </p>
          </div>
        </div>
        <Link to={`/customers/${customer.id}/edit`}>
          <Button>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="font-medium text-lg">{customer.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </p>
                <p className="font-medium">{customer.phone_no}</p>
              </div>
              {customer.telephone && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telephone</p>
                  <p className="font-medium">{customer.telephone}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="font-medium">{customer.email || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Loyalty Number
                </p>
                <p className="font-medium">
                  {customer.loyalty_number ? (
                    <Badge variant="outline" className="text-blue-600">
                      {customer.loyalty_number}
                    </Badge>
                  ) : (
                    'Not enrolled'
                  )}
                </p>
              </div>
            </div>
            {customer.address && (
              <div className="space-y-1 pt-2 border-t dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
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
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</span>
                <span className="font-bold text-blue-600">{statistics.totalBookings}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-bold text-green-600">{statistics.completedBookings}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Spent</span>
                <span className="font-bold">{formatCurrency(statistics.totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Paid</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(statistics.totalPaid)}
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-3 rounded-lg ${
                  statistics.outstandingBalance > 0
                    ? 'bg-red-50 dark:bg-red-950'
                    : 'bg-green-50 dark:bg-green-950'
                }`}
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">Outstanding</span>
                <span
                  className={`font-bold ${
                    statistics.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(statistics.outstandingBalance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Booking History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 text-sm mt-2">
                This customer doesn't have any bookings yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{formatDate(booking.booking_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                      </TableCell>
                      <TableCell>{booking.service_name}</TableCell>
                      <TableCell>
                        {booking.staff.length > 0 ? (
                          <div className="text-sm">
                            {booking.staff.map((s) => s.name).join(', ')}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.payment_status)}>
                          {booking.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(booking.service_amount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(booking.paid_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/bookings/${booking.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
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
                    <TableHead>Date</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paid_at)}</TableCell>
                      <TableCell>{payment.service_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.method || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {payment.reference_no || '-'}
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