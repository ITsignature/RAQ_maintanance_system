import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock, DollarSign, Users, TrendingUp, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';

type DashboardData = {
  today: {
    bookings: Array<{
      id: number;
      booking_date: string;
      start_time: string;
      end_time: string;
      customer_id: number;
      service_name: string;
      service_amount: number;
      paid_amount: number;
      balance: number;
      status: string;
      payment_status: string;
      customer: {
        id: number;
        name: string;
        phone_no: string;
        email?: string;
      };
      staff: Array<{
        id: number;
        name: string;
      }>;
    }>;
    total: number;
    completed: number;
    revenue: number;
  };
  upcoming: {
    bookings: Array<{
      id: number;
      booking_date: string;
      start_time: string;
      service_name: string;
      service_amount: number;
      status: string;
      payment_status: string;
      customer: {
        id: number;
        name: string;
        phone_no: string;
      };
    }>;
    total: number;
  };
  financial: {
    totalRevenue: number;
    pendingPayments: number;
    bookingsWithPending: number;
  };
  customers: {
    total: number;
  };
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from the optimized backend endpoint
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const res = await apiFetch('/api/dashboard/stats');
        
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const dashboardData = await res.json();
        setData(dashboardData);
        
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
    return `LKR ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
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
                {data.today.total}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {data.today.completed} completed
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
                {formatCurrency(data.financial.totalRevenue)}
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
                {formatCurrency(data.financial.pendingPayments)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {data.financial.bookingsWithPending} bookings
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
                {data.customers.total}
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
              {data.today.bookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No bookings scheduled for today
                </p>
              ) : (
                <div className="space-y-3">
                  {data.today.bookings.slice(0, 5).map((booking, index) => (
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
                          <p className="font-medium">{booking.customer.name}</p>
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
                  ))}
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
              {data.upcoming.bookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No upcoming bookings
                </p>
              ) : (
                <div className="space-y-3">
                  {data.upcoming.bookings.slice(0, 5).map((booking, index) => (
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
                          <p className="font-medium">{booking.customer.name}</p>
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
                            {formatCurrency(booking.service_amount)}
                          </p>
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/bookings/${booking.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}