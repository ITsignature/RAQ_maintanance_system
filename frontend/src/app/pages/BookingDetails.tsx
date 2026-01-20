import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { FileUpload, UploadedFile } from '@/app/components/ui/file-upload';
import { motion } from 'motion/react';
import { ArrowLeft, Phone, Mail, MapPin, DollarSign, FileText, Plus, Edit, Trash2, Download, Image as ImageIcon } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getPaymentStatus, getStatusColor } from '@/lib/utils';
import { mockUsers } from '@/lib/mock-data';
import { PaymentMethod, BookingStatus } from '@/lib/types';
import { toast } from 'sonner';

export function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getBookingById, getCustomerById, getPaymentsByBookingId, addPayment, updateBooking, deleteBooking } =
    useData();

  const booking = id ? getBookingById(id) : null;
  const customer = booking ? getCustomerById(booking.customerId) : null;
  const payments = booking ? getPaymentsByBookingId(booking.id) : [];
  const staff = booking ? mockUsers.find((u) => u.id === booking.staffId) : null;

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [invoiceFiles, setInvoiceFiles] = useState<UploadedFile[]>([]);

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

  const paymentStatus = getPaymentStatus(booking.totalAmount, booking.paidAmount);
  const balance = booking.totalAmount - booking.paidAmount;

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      toast.error('Payment amount cannot exceed remaining balance');
      return;
    }

    addPayment({
      bookingId: booking.id,
      amount,
      paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      reference: paymentReference,
      enteredBy: user?.id || '1',
    });

    toast.success('Payment added successfully');
    setIsPaymentDialogOpen(false);
    setPaymentAmount('');
    setPaymentReference('');
  };

  const handleStatusUpdate = (newStatus: BookingStatus) => {
    updateBooking(booking.id, { status: newStatus });
    toast.success(`Booking status updated to ${newStatus}`);
  };

  const handleDeleteBooking = () => {
    deleteBooking(booking.id);
    toast.success('Booking deleted successfully');
    navigate('/bookings');
  };

  const handleUploadInvoice = () => {
    if (invoiceFiles.length === 0) {
      toast.error('Please select an invoice file');
      return;
    }
    // Update booking with invoice URL
    updateBooking(booking.id, { 
      invoiceUrl: invoiceFiles[0].url 
    });
    toast.success('Invoice uploaded successfully');
    setInvoiceFiles([]);
    setIsInvoiceDialogOpen(false);
  };

  const handleDownloadInvoice = () => {
    if (booking.invoiceUrl) {
      // In a real app, this would trigger a download
      const link = document.createElement('a');
      link.href = booking.invoiceUrl;
      link.download = `invoice-${booking.id}.pdf`;
      link.click();
      toast.success('Invoice download started');
    }
  };

  const handleDeleteInvoice = () => {
    updateBooking(booking.id, { invoiceUrl: undefined });
    toast.success('Invoice deleted successfully');
  };

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
            {formatDate(booking.date)} at {formatTime(booking.startTime)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/bookings/edit/${booking.id}`}>
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
                      {customer.fullName}
                    </p>
                  </Link>
                  {customer.loyaltyNumber && (
                    <Badge variant="outline" className="mt-2">
                      Loyalty: {customer.loyaltyNumber}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${customer.phoneNumber}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {customer.phoneNumber}
                    </a>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${customer.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
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
                  <p className="font-medium">{formatDate(booking.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                  <p className="font-medium">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Staff Assigned</p>
                  <p className="font-medium">{staff?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Product</p>
                  <p className="font-medium">{booking.product}</p>
                </div>
                {booking.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                    <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                      {booking.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {booking.status === 'Scheduled' && (
                  <Button onClick={() => handleStatusUpdate('In Progress')}>
                    Mark In Progress
                  </Button>
                )}
                {booking.status === 'In Progress' && (
                  <Button onClick={() => handleStatusUpdate('Completed')}>
                    Mark Completed
                  </Button>
                )}
                <Button variant="outline">Reschedule</Button>
                <Button variant="outline">Send SMS Reminder</Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Service Photos */}
          {booking.servicePhotos && booking.servicePhotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Service Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {booking.servicePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 aspect-square"
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                        <a
                          href={photo.url}
                          download={photo.name}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Button size="sm" variant="secondary">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {booking.documents && booking.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {booking.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(doc.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <a href={doc.url} download={doc.name}>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
                  <p className="text-3xl font-bold">{formatCurrency(booking.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</p>
                  <p className="text-xl font-semibold text-green-600 dark:text-green-500">
                    {formatCurrency(booking.paidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Balance Amount</p>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-500">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="pt-2 border-t dark:border-gray-800">
                  <Badge className={`${getStatusColor(paymentStatus)} text-sm px-3 py-1`}>
                    {paymentStatus}
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
                        <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
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
                        <Button
                          variant="outline"
                          onClick={() => setIsPaymentDialogOpen(false)}
                        >
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.paymentMethod}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Invoice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.invoiceUrl ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice uploaded</p>
                    <p className="text-sm font-medium mt-1 truncate">{booking.invoiceUrl}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleDownloadInvoice}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleDeleteInvoice}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No invoice uploaded</p>
                  <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">Upload Invoice</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Invoice</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <FileUpload
                          value={invoiceFiles}
                          onChange={setInvoiceFiles}
                          maxFiles={1}
                          accept=".pdf"
                          label="Invoice Document"
                          description="Upload the invoice PDF file"
                        />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={handleUploadInvoice}
                            disabled={invoiceFiles.length === 0}
                          >
                            Upload Invoice
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setInvoiceFiles([]);
                              setIsInvoiceDialogOpen(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
        itemName={`${customer.fullName} - ${booking.product}`}
      />
    </motion.div>
  );
}
