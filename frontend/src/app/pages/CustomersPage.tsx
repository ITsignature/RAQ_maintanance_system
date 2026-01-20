import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { DeleteConfirmDialog } from '@/app/components/DeleteConfirmDialog';
import { Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function CustomersPage() {
  const { customers, bookings, deleteCustomer } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getCustomerBalance = (customerId: string) => {
    const customerBookings = bookings.filter((b) => b.customerId === customerId);
    return customerBookings.reduce(
      (total, booking) => total + (booking.totalAmount - booking.paidAmount),
      0
    );
  };

  const handleDeleteClick = (customerId: string) => {
    // Check if customer has bookings
    const hasBookings = bookings.some((b) => b.customerId === customerId);
    if (hasBookings) {
      toast.error('Cannot delete customer with existing bookings');
      return;
    }
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete);
      toast.success('Customer deleted successfully');
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Customers
          </h1>
          <p className="text-gray-600 mt-1">Manage customer information and records</p>
        </div>
        <Link to="/customers/new">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Loyalty #</TableHead>
                  <TableHead>Outstanding Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => {
                    const balance = getCustomerBalance(customer.id);

                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.fullName}</TableCell>
                        <TableCell>{customer.phoneNumber}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>
                          {customer.loyaltyNumber ? (
                            <Badge variant="outline">{customer.loyaltyNumber}</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {balance > 0 ? (
                            <span className="text-red-600 font-medium">
                              {formatCurrency(balance)}
                            </span>
                          ) : (
                            <span className="text-green-600">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/customers/${customer.id}/details`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link to={`/customers/${customer.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(customer.id)}
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
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        itemName={customerToDelete ? customers.find(c => c.id === customerToDelete)?.fullName : ''}
      />
    </motion.div>
  );
}