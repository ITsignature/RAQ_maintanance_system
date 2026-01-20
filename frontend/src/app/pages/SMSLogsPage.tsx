import React from 'react';
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

export function SMSLogsPage() {
  const { smsLogs, getCustomerById } = useData();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">SMS Logs</h1>
        <p className="text-muted-foreground mt-1">View all SMS message history</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>SMS History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                          <TableCell>{formatDateTime(log.sentAt)}</TableCell>
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}