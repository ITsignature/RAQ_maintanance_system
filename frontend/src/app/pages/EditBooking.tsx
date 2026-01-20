import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
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
import { FileUpload, UploadedFile } from '@/app/components/ui/file-upload';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { mockUsers } from '@/lib/mock-data';
import { BookingStatus } from '@/lib/types';
import { motion } from 'motion/react';

export function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getBookingById, updateBooking, customers } = useData();

  const booking = id ? getBookingById(id) : null;

  const [formData, setFormData] = useState({
    customerId: '',
    date: '',
    startTime: '',
    endTime: '',
    product: '',
    totalAmount: '',
    staffId: '',
    status: 'Scheduled' as BookingStatus,
    notes: '',
  });

  const [servicePhotos, setServicePhotos] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  useEffect(() => {
    if (booking) {
      setFormData({
        customerId: booking.customerId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        product: booking.product,
        totalAmount: booking.totalAmount.toString(),
        staffId: booking.staffId,
        status: booking.status,
        notes: booking.notes || '',
      });
      setServicePhotos(booking.servicePhotos || []);
      setDocuments(booking.documents || []);
    }
  }, [booking]);

  if (!booking) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerId || !formData.date || !formData.startTime || !formData.endTime || !formData.product || !formData.totalAmount || !formData.staffId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    updateBooking(booking.id, {
      customerId: formData.customerId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      product: formData.product,
      totalAmount,
      staffId: formData.staffId,
      status: formData.status,
      notes: formData.notes,
      servicePhotos,
      documents,
    });

    toast.success('Booking updated successfully');
    navigate(`/bookings/${booking.id}`);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/bookings/${booking.id}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Edit Booking
          </h1>
          <p className="text-gray-600 mt-1">Update booking information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Booking Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => handleChange('customerId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.fullName} - {customer.phoneNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  required
                />
              </div>

              {/* Product/Service */}
              <div className="space-y-2">
                <Label htmlFor="product">Product/Service *</Label>
                <Input
                  id="product"
                  type="text"
                  placeholder="e.g., AC Repair, Plumbing Service"
                  value={formData.product}
                  onChange={(e) => handleChange('product', e.target.value)}
                  required
                />
              </div>

              {/* Total Amount */}
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (LKR) *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.totalAmount}
                  onChange={(e) => handleChange('totalAmount', e.target.value)}
                  required
                />
              </div>

              {/* Staff Assignment */}
              <div className="space-y-2">
                <Label htmlFor="staffId">Assign Staff *</Label>
                <Select
                  value={formData.staffId}
                  onValueChange={(value) => handleChange('staffId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers
                      .filter((u) => u.role === 'Staff' || u.role === 'Manager')
                      .map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.fullName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value as BookingStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or instructions"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
              />
            </div>

            <FileUpload
              value={servicePhotos}
              onChange={setServicePhotos}
              accept="image/*"
              maxFiles={10}
              label="Service Photos (Optional)"
              description="Upload before/after photos of the service"
            />

            <FileUpload
              value={documents}
              onChange={setDocuments}
              accept=".pdf,.doc,.docx"
              maxFiles={5}
              label="Documents (Optional)"
              description="Upload invoices, warranties, or other documents"
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500">
                Update Booking
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/bookings/${booking.id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}