import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock, DollarSign, Users, AlertCircle, TrendingUp, Package } from 'lucide-react';
import { formatCurrency, formatDate, getPaymentStatus, getStatusColor } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function Dashboard() {
  const { bookings, customers, getCustomerById } = useData();

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === today);
  const upcomingBookings = bookings.filter((b) => new Date(b.date) > new Date());
  const totalRevenue = bookings.reduce((acc, b) => acc + b.paidAmount, 0);
  const pendingPayments = bookings.reduce((acc, b) => acc + (b.totalAmount - b.paidAmount), 0);
  const bookingsWithPending = bookings.filter((b) => b.totalAmount > b.paidAmount).length;
  
  const overdueBookings = bookings.filter(
    (b) => b.totalAmount > b.paidAmount && new Date(b.date) < new Date()
  );
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

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
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your overview for today.</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="overflow-hidden border-blue-100 dark:border-blue-900 hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-blue-900/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950 dark:to-transparent">
              <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{todayBookings.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {todayBookings.filter((b) => b.status === 'Completed').length} completed
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
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">This month</p>
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
                {formatCurrency(pendingPayments)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{bookingsWithPending} bookings</p>
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
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{customers.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active records</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Alerts */}
      {overdueBookings.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-red-200 dark:border-red-900 bg-gradient-to-r from-red-50 to-transparent dark:from-red-950 dark:to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-red-900 dark:text-red-300">Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueBookings.map((booking) => {
                  const customer = getCustomerById(booking.customerId);
                  return (
                    <motion.div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-red-100 dark:border-red-900"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-300">{customer?.fullName}</p>
                        <p className="text-sm text-red-700 dark:text-red-400">
                          Overdue: {formatDate(booking.date)} - {booking.product}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/bookings/${booking.id}`}>View</Link>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
              {todayBookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No bookings scheduled for today</p>
              ) : (
                <div className="space-y-3">
                  {todayBookings.slice(0, 5).map((booking, index) => {
                    const customer = getCustomerById(booking.customerId);
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
                            <p className="font-medium">{customer?.fullName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.product}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">{booking.startTime}</span>
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
              {upcomingBookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No upcoming bookings</p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map((booking, index) => {
                    const customer = getCustomerById(booking.customerId);
                    const paymentStatus = getPaymentStatus(
                      booking.totalAmount,
                      booking.paidAmount
                    );

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
                            <p className="font-medium">{customer?.fullName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.product}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(booking.date)}
                              </span>
                              <Badge className={getStatusColor(paymentStatus)}>
                                {paymentStatus}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(booking.totalAmount)}
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