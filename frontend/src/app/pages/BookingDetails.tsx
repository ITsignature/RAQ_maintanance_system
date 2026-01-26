import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { DeleteConfirmDialog } from '@/app/components/DeleteConfirmDialog';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
} from 'lucide-react';
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
  staff: { id: number; name: string; phone_no: string }[]; 
};

type Customer = {
  id: number;
  name: string;
  phone_no: string;
  email?: string;
  address?: string;
  loyalty_number?: string;
};

type Payment = {
  id: number;
  booking_id: number;
  amount: string;
  method: string | null;
  reference_no: string | null;
  paid_at: string;
  note: string | null;
  is_active: boolean;
  created_by: number;
};

type Invoice = {
  id: number;
  booking_id: number;
  invoice_no: string | null;
  file_path: string;
  created_at: string;
  created_by_name?: string;
};

export function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<{ id: number; name: string; phone_no: string }[]>([]);


  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [uploading, setUploading] = useState(false);

  const [paidAt, setPaidAt] = useState(() => {
  const d = new Date();
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
});


  
// Fetch booking details
  const fetchBooking = async () => {
    try {
      const res = await apiFetch(`/api/bookings/${id}`);
      if (!res.ok) throw new Error('Failed to fetch booking');

      const data = await res.json();
      console.log('📅 Booking data:', data);
      setBooking(data); // Set the booking data
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      toast.error(error.message || 'Failed to load booking');
    }
  };

  // Fetch staff details
  const fetchStaff = async () => {
    if (!booking) return; // Wait for the booking to be available

    console.log('Fetching staff for booking ID:', booking.id);
    try {
      const res = await apiFetch(`/api/bookings/${booking.id}/staff`);
      if (!res.ok) throw new Error('Failed to fetch staff details');

      const data = await res.json();
      setStaff(data); // Set the staff data
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast.error(error.message || 'Failed to load staff');
    }
  };
  // Fetch customer details
  const fetchCustomer = async (customerId: number) => {
    try {
      const res = await apiFetch(`/api/users/${customerId}`);
      if (!res.ok) throw new Error('Failed to fetch customer');

      const data = await res.json();
      setCustomer(data);
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      toast.error(error.message || 'Failed to load customer');
    }
  };

  // Fetch payments for this booking
  const fetchPayments = async () => {
    try {
      const res = await apiFetch(`/api/payments?booking_id=${id}`);
      if (!res.ok) throw new Error('Failed to fetch payments');

      const data = await res.json();
      setPayments(data);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    }
  };

  // Fetch invoices for this booking
  const fetchInvoices = async () => {
    try {
      const res = await apiFetch(`/api/invoices/booking/${id}`);
      if (!res.ok) throw new Error('Failed to fetch invoices');

      const data = await res.json();
      setInvoices(data);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Load all data
// Load all data (booking, customer, payments, invoices, and staff)
// ────────────────────────────────────────────────
// First effect: only runs when id changes
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      await fetchBooking();
      // Do NOT fetch staff here
    } catch (err) {
      // already handled inside fetchBooking
    } finally {
      setLoading(false);
    }
  };

  if (id) loadData();
}, [id]);   // ← only id


// ────────────────────────────────────────────────
// Second effect: runs whenever booking changes (once after fetchBooking succeeds)
useEffect(() => {
  if (!booking?.id) return;

  fetchStaff();           // now safe – booking is stable
  fetchCustomer(booking.customer_id);
  fetchPayments();
  fetchInvoices();

}, [booking]);           // ← correct place for these

  // Add payment
  const handleAddPayment = async () => {
    const amount = parseFloat(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const balance = getBalance();
    if (amount > balance) {
      toast.error('Payment amount cannot exceed remaining balance');
      return;
    }

    try {
      const res = await apiFetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: Number(id),
          amount,
          method: paymentMethod,
          reference_no: paymentReference || null,
          note: null,
          paid_at: paidAt,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add payment');
      }

      toast.success('Payment added successfully');
      setIsPaymentDialogOpen(false);
      setPaymentAmount('');
      setPaymentReference('');

      // Refresh data
      await fetchBooking();
      await fetchPayments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add payment');
    }
  };

  // Update booking status
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const res = await apiFetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Booking status updated to ${newStatus}`);
      await fetchBooking();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  // Delete booking
  const handleDeleteBooking = async () => {
    try {
      const res = await apiFetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete booking');

      toast.success('Booking deleted successfully');
      navigate('/bookings');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete booking');
    }
  };

  // Soft delete payment
  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      const res = await apiFetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete payment');

      toast.success('Payment deleted (soft)');
      await fetchPayments(); // Refresh payment list
    } catch (error) {
      toast.error(error.message || 'Failed to delete payment');
    }
  };

  // Upload invoice using FormData
  const handleUploadInvoice = async () => {
    if (!selectedFile) {
      toast.error('Please select an invoice file');
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }

    try {
      setUploading(true);

      // Create FormData object
      const formData = new FormData();
      formData.append('invoice', selectedFile);
      formData.append('booking_id', id!);
      if (invoiceNo) {
        formData.append('invoice_no', invoiceNo);
      }

      // Use apiFetch which handles authentication automatically
      const res = await apiFetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
        // Don't set headers - apiFetch will handle Content-Type automatically
      });

      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to upload invoice';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Response might not be JSON
          errorMessage = `Upload failed: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Try to parse JSON response
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        // If response is empty or not JSON, that's okay - upload might have succeeded
        console.warn('Response was not JSON, but request may have succeeded');
        data = { message: 'Upload completed' };
      }

      toast.success(data.message || 'Invoice uploaded successfully');
      
      // Reset form
      setSelectedFile(null);
      setInvoiceNo('');
      setIsInvoiceDialogOpen(false);
      
      // Refresh invoices
      await fetchInvoices();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload invoice');
    } finally {
      setUploading(false);
    }
  };

  // Download invoice
  const handleDownloadInvoice = async (invoiceId: number) => {
    
    try {
      const res = await apiFetch(`/api/invoices/${invoiceId}/download`, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error('Failed to download invoice');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `invoice-${invoiceId}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      // Create blob and download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const res = await apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete invoice');

      toast.success('Invoice deleted successfully');
      await fetchInvoices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invoice');
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and PDF files are allowed');
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File is too large. Maximum size is 10MB.');
        return;
      }

      setSelectedFile(file);
    }
  };

  // Utility functions
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

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `LKR ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getTotalPaid = () => {
    return payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  const getBalance = () => {
    if (!booking) return 0;
    return parseFloat(booking.service_amount) - getTotalPaid();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!booking || !customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl text-gray-600">Booking not found</p>
          <Link to="/bookings">
            <Button className="mt-4">Back to Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPaid = getTotalPaid();
  const balance = getBalance();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/bookings')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatDate(booking.booking_date)} at {formatTime(booking.start_time)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/bookings/${booking.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Badge className={`${getStatusColor(booking.status)} text-lg px-4 py-2`}>
            {booking.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Link to={`/customers/${customer.id}`}>
                    <p className="text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                      {customer.name}
                    </p>
                  </Link>
                  {customer.loyalty_number && (
                    <Badge variant="outline" className="mt-2">
                      Loyalty: {customer.loyalty_number}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <a
                      href={`tel:${customer.phone_no}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {customer.phone_no}
                    </a>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${customer.email}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {customer.email}
                      </a>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 md:col-span-2">
                      <MapPin className="w-4 h-4 mt-1" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-medium">{formatDate(booking.booking_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                  <p className="font-medium">
                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Service</p>
                  <p className="font-medium">{booking.service_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Service Amount</p>
                  <p className="font-medium">{formatCurrency(booking.service_amount)}</p>
                </div>
                {booking.note && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                    <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                      {booking.note}
                    </p>
                  </div>
                )}
        


              </div>
            </CardContent>
          </Card>

            {staff.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul>
                    {staff.map((staffMember) => (
                      <li key={staffMember.id} className="text-md bold font-medium text-gray-600 dark:text-gray-400">
                        {staffMember.name} - {staffMember.phone_no}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {booking.status === 'pending' && (
                  <Button onClick={() => handleStatusUpdate('confirmed')}>Mark Confirmed</Button>
                )}
                {booking.status === 'confirmed' && (
                  <Button onClick={() => handleStatusUpdate('completed')}>Mark Completed</Button>
                )}
                {booking.status === 'completed' && (
                  <Button variant="outline" disabled>
                    Completed
                  </Button>
                )}
                {booking.status === 'completed' ? null : (
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>
                )}

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment Info */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-3xl font-bold">{formatCurrency(booking.service_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</p>
                  <p className="text-xl font-semibold text-green-600 dark:text-green-500">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Balance Amount</p>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-500">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="pt-2 border-t dark:border-gray-800">
                  <Badge className={`${getStatusColor(booking.payment_status)} text-sm px-3 py-1`}>
                    {booking.payment_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment History</CardTitle>
              {balance > 0 && (
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                      <Label htmlFor="paidAt">Paid Date</Label>
                      <Input
                        id="paidAt"
                        type="date"
                        value={paidAt}
                        onChange={(e) => setPaidAt(e.target.value)}
                      />
                    </div>

                      <div>
                        <Label htmlFor="amount">Payment Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Remaining balance: {formatCurrency(balance)}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="method">Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="reference">Reference/Notes (Optional)</Label>
                        <Textarea
                          id="reference"
                          placeholder="Payment reference or notes"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddPayment} className="flex-1">
                          Save Payment
                        </Button>
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <p>No payments recorded yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paid_at)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.method || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoices
              </CardTitle>
              <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Invoice</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invoice-no">Invoice Number (Optional)</Label>
                      <Input
                        id="invoice-no"
                        placeholder="INV-2024-001"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="invoice-file">Invoice File</Label>
                      <Input
                        id="invoice-file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Accepted formats: PDF, JPEG, PNG (Max 10MB)
                      </p>
                      {selectedFile && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={handleUploadInvoice}
                        disabled={!selectedFile || uploading}
                      >
                        {uploading ? 'Uploading...' : 'Upload Invoice'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null);
                          setInvoiceNo('');
                          setIsInvoiceDialogOpen(false);
                        }}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No invoices uploaded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {invoice.invoice_no || `Invoice #${invoice.id}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(invoice.issued_at)}
                            {invoice.created_by_name && ` • ${invoice.created_by_name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteBooking}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        itemName={`${customer.name} - ${booking.service_name}`}
      />
    </motion.div>
  );
}
