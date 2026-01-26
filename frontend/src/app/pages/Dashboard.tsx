import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock, DollarSign, Users, TrendingUp, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
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

type DashboardStats = {
  todayBookings: Booking[];
  upcomingBookings: Booking[];
  totalRevenue: number;
  pendingPayments: number;
  totalCustomers: number;
  bookingsWithPending: number;
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: [],
    upcomingBookings: [],
    totalRevenue: 0,
    pendingPayments: 0,
    totalCustomers: 0,
    bookingsWithPending: 0,
  });
  const [customers, setCustomers] = useState<Map<number, Customer>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Fetch all bookings (we'll need to paginate if there are many)
        const [bookingsRes, customersRes] = await Promise.all([
          apiFetch('/api/bookings?page=1'),
          apiFetch('/api/users?role=customer&page=1'),
        ]);

        if (!bookingsRes.ok || !customersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const bookingsData = await bookingsRes.json();
        const customersData = await customersRes.json();

        console.log('📅 customersData data:', customersData);
        const allBookings: Booking[] = bookingsData.bookings;

        // Calculate stats
        const todayBookings = allBookings.filter((b) => b.booking_date === today);
        
        const upcomingBookings = allBookings.filter((b) => {
          return b.booking_date > today;
        });

        // Calculate revenue (sum of service amounts for completed bookings)
        const totalRevenue = allBookings
          .filter((b) => b.status.toLowerCase() === 'completed')
          .reduce((sum, b) => sum + parseFloat(b.service_amount), 0);

        // For pending payments, we need to fetch payment data for each booking
        // This is a simplified version - you may want to optimize this
        let pendingPayments = 0;
        let bookingsWithPending = 0;

        for (const booking of allBookings) {
          const serviceAmount = parseFloat(booking.service_amount);
          
          // Fetch payments for this booking
          const paymentsRes = await apiFetch(`/api/payments?booking_id=${booking.id}`);
          if (paymentsRes.ok) {
            const payments = await paymentsRes.json();
            const totalPaid = payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
            const balance = serviceAmount - totalPaid;
            
            if (balance > 0) {
              pendingPayments += balance;
              bookingsWithPending++;
            }
          }
        }

        // Build customer map
        const customerMap = new Map<number, Customer>();
        if (customersData.users) {
          customersData.users.forEach((customer: Customer) => {
            customerMap.set(customer.id, customer);
          });
        }

        // Fetch customers for bookings that aren't in the map
        const uniqueCustomerIds = [...new Set(allBookings.map(b => b.customer_id))];
        for (const customerId of uniqueCustomerIds) {
          if (!customerMap.has(customerId)) {
            try {
              const res = await apiFetch(`/api/users/${customerId}`);
              if (res.ok) {
                const customer = await res.json();
                customerMap.set(customerId, customer);
              }
            } catch (error) {
              console.error(`Failed to fetch customer ${customerId}:`, error);
            }
          }
        }

        setStats({
          todayBookings,
          upcomingBookings: upcomingBookings.slice(0, 10), // Limit to 10
          totalRevenue,
          pendingPayments,
          totalCustomers: customersData.length || 0,
          bookingsWithPending,
        });

        setCustomers(customerMap);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getCustomerById = (customerId: number): Customer | undefined => {
    return customers.get(customerId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's your overview for today.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="overflow-hidden border-blue-100 dark:border-blue-900 hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-blue-900/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950 dark:to-transparent">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.todayBookings.length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {stats.todayBookings.filter((b) => b.status.toLowerCase() === 'completed').length} completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="overflow-hidden border-green-100 dark:border-green-900 hover:shadow-lg hover:shadow-green-100/50 dark:hover:shadow-green-900/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950 dark:to-transparent">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">From completed bookings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="overflow-hidden border-amber-100 dark:border-amber-900 hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-900/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950 dark:to-transparent">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(stats.pendingPayments)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {stats.bookingsWithPending} bookings
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="overflow-hidden border-purple-100 dark:border-purple-900 hover:shadow-lg hover:shadow-purple-100/50 dark:hover:shadow-purple-900/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950 dark:to-transparent">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalCustomers}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active records</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950 dark:to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Today's Schedule
              </CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link to="/calendar">View Calendar</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats.todayBookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No bookings scheduled for today
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.todayBookings.slice(0, 5).map((booking, index) => {
                    const customer = getCustomerById(booking.customer_id);
                    return (
                      <motion.div
                        key={booking.id}
                        className="p-3 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{customer?.name || 'Loading...'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {booking.service_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTime(booking.start_time)}
                              </span>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/bookings/${booking.id}`}>Details</Link>
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-50 to-transparent dark:from-green-950 dark:to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                Upcoming Bookings
              </CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link to="/bookings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats.upcomingBookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No upcoming bookings
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.upcomingBookings.slice(0, 5).map((booking, index) => {
                    const customer = getCustomerById(booking.customer_id);

                    return (
                      <motion.div
                        key={booking.id}
                        className="p-3 border rounded-lg hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-200 dark:hover:border-green-800 transition-all duration-200"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: -4 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{customer?.name || 'Loading...'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {booking.service_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(booking.booking_date)}
                              </span>
                              <Badge className={getStatusColor(booking.payment_status)}>
                                {booking.payment_status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(parseFloat(booking.service_amount))}
                            </p>
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/bookings/${booking.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}