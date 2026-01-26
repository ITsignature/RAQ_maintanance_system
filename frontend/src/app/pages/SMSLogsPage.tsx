import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import { motion } from 'motion/react';
import { MessageSquare, Wifi, DollarSign, Phone, Clock, User } from 'lucide-react';

export function SMSLogsPage() {
  const { smsLogs, getCustomerById } = useData();
  
  // Mock SMS settings - replace with actual API call
  const [smsBalance, setSmsBalance] = useState(1250);
  const [gatewayStatus, setGatewayStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');
  const [gatewayProvider, setGatewayProvider] = useState('Twilio');

  // In real implementation, fetch this data from your API
  useEffect(() => {
    // Example: fetchSMSSettings();
  }, []);

  const getGatewayStatusColor = (status: string) => {
    const colors = {
      connected: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.disconnected;
  };

  return (
    <div className="flex-1 mx-auto p-2 md:p-2 lg:p-2 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">SMS Logs</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          View all SMS message history and gateway status
        </p>
      </motion.div>

      {/* SMS Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* SMS Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SMS Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{smsBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Messages remaining
              </p>
              {smsBalance < 100 && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  Low Balance
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gateway Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gateway Status</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={getGatewayStatusColor(gatewayStatus)}>
                  {gatewayStatus}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Provider: <span className="font-medium">{gatewayProvider}</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total SMS Sent Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total SMS Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{smsLogs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time messages
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* SMS Logs Table/Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">SMS History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Message Type</TableHead>
                    <TableHead>Message Preview</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smsLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No SMS logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    smsLogs.map((log) => {
                      const customer = getCustomerById(log.customerId);

                      return (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDateTime(log.sentAt)}
                          </TableCell>
                          <TableCell>{customer?.fullName}</TableCell>
                          <TableCell>{log.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.messageType}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {log.message}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {smsLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No SMS logs found
                </div>
              ) : (
                smsLogs.map((log) => {
                  const customer = getCustomerById(log.customerId);

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      {/* Header with Date/Time and Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {formatDateTime(log.sentAt)}
                          </span>
                        </div>
                        <Badge className={`${getStatusColor(log.status)} text-xs flex-shrink-0`}>
                          {log.status}
                        </Badge>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {customer?.fullName || 'Unknown Customer'}
                          </p>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <a
                          href={`tel:${log.phoneNumber}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {log.phoneNumber}
                        </a>
                      </div>

                      {/* Message Type */}
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <Badge variant="outline" className="text-xs">
                          {log.messageType}
                        </Badge>
                      </div>

                      {/* Message Preview */}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Message Preview
                        </p>
                        <p className="text-sm line-clamp-2">
                          {log.message}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}