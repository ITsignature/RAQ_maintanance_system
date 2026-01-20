import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { DeleteConfirmDialog } from '@/app/components/DeleteConfirmDialog';
import { Plus, Search, Eye, Edit2, Trash2, Filter } from 'lucide-react';
import { formatCurrency, formatDate, getPaymentStatus, getStatusColor } from '@/lib/utils';
import { mockUsers } from '@/lib/mock-data';
import { BookingStatus } from '@/lib/types';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function BookingsList() {
  const { bookings, customers, getCustomerById, deleteBooking } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const filteredBookings = bookings.filter((booking) => {
    const customer = getCustomerById(booking.customerId);
    const matchesSearch =
      customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.phoneNumber.includes(searchTerm) ||
      booking.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesStaff = staffFilter === 'all' || booking.staffId === staffFilter;

    return matchesSearch && matchesStatus && matchesStaff;
  });

  const handleDeleteClick = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete);
      toast.success('Booking deleted successfully');
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Bookings
          </h1>
          <p className="text-gray-600 mt-1">Manage all maintenance bookings</p>
        </div>
        <Link to="/bookings/new">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by customer, phone, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={staffFilter} onValueChange={setStaffFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {mockUsers
                  .filter((u) => u.role === 'Staff')
                  .map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.fullName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const customer = getCustomerById(booking.customerId);
                    const staff = mockUsers.find((u) => u.id === booking.staffId);
                    const paymentStatus = getPaymentStatus(
                      booking.totalAmount,
                      booking.paidAmount
                    );

                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatDate(booking.date)}</p>
                            <p className="text-sm text-gray-600">{booking.startTime}</p>
                          </div>
                        </TableCell>
                        <TableCell>{customer?.fullName}</TableCell>
                        <TableCell>{customer?.phoneNumber}</TableCell>
                        <TableCell>{staff?.fullName}</TableCell>
                        <TableCell>{booking.product}</TableCell>
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
                        <TableCell className="text-right">
                          {formatCurrency(booking.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/bookings/${booking.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link to={`/bookings/${booking.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(booking.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        itemName={bookingToDelete ? getCustomerById(bookings.find(b => b.id === bookingToDelete)?.customerId || '')?.fullName : ''}
      />
    </motion.div>
  );
}