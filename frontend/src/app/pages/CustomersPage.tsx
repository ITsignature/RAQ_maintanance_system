import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { DeleteConfirmDialog } from '@/app/components/DeleteConfirmDialog';
import { Plus, Search, Eye, Edit2, Trash2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { toast } from 'sonner';
import { motion } from 'motion/react';

type Customer = {
  id: number;
  name: string;
  phone_no: string;
  email?: string | null;
  loyalty_number?: string | null;
  address?: string | null;
};

type CustomerStats = {
  total_amount: number;
  paid_amount: number;
  outstanding_balance: number;
};

export function CustomersPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerStats, setCustomerStats] = useState<Record<number, CustomerStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);

  // Fetch customers + their stats
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all customers
      const custRes = await apiFetch('/api/users/customers?search=');
      if (!custRes.ok) throw new Error('Failed to load customers');
      const custData = await custRes.json();
      setCustomers(custData);

      // Fetch customer stats (outstanding balance)
      const statsRes = await apiFetch('/api/users/customers/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('👥 Customer stats data:', statsData);
        setCustomerStats(statsData);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone_no.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.loyalty_number && c.loyalty_number.toLowerCase().includes(searchTerm.toLowerCase()))

  );

  const getCustomerBalance = (customerId: number): number => {
    return customerStats[customerId]?.outstanding_balance || 0;
  };

  const handleDeleteClick = (customerId: number) => {
    // Check if customer has any bookings (outstanding balance or total amount > 0)
    const stats = customerStats[customerId];
    if (stats && stats.total_amount > 0) {
      toast.error('Cannot delete customer with existing bookings');
      return;
    }
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    try {
      const res = await apiFetch(`/api/users/${customerToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Delete failed');
      }

      toast.success('Customer deleted successfully');
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer');
    }
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer information and records
          </p>
        </div>
        <Link to="/customers/new">
          <Button>
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
              placeholder="Search by name, phone,Loyalty # or email..."
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
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone_no}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {customer.email || '-'}
                        </TableCell>
                        <TableCell>
                          {customer.loyalty_number ? (
                            <Badge variant="outline">{customer.loyalty_number}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {balance > 0 ? (
                            <span className="text-red-600 font-medium">
                              {formatCurrency(balance)}
                            </span>
                          ) : (
                            <span className="text-green-600 font-medium">
                              {formatCurrency(0)}
                            </span>
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        itemName={
          customerToDelete
            ? customers.find((c) => c.id === customerToDelete)?.name || 'this customer'
            : ''
        }
      />
    </motion.div>
  );
}