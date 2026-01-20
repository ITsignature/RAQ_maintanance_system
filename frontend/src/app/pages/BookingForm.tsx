import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { toast } from 'sonner';
import { Badge } from '@/app/components/ui/badge';

export function BookingForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { customers, addBooking, bookings } = useData();
  
  const [formData, setFormData] = useState({
    customerId: '',
    staffId: '',
    date: '',
    startTime: '',
    endTime: '',
    product: '',
    notes: '',
    totalAmount: '',
  });

  const [conflict, setConflict] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Check for conflicts when date, time, or staff changes
    if (field === 'date' || field === 'startTime' || field === 'staffId') {
      checkConflicts({ ...formData, [field]: value });
    }
  };

  const checkConflicts = (data: typeof formData) => {
    if (!data.date || !data.startTime || !data.staffId) {
      setConflict(null);
      return;
    }

    const staffBookings = bookings.filter(
      (b) => b.staffId === data.staffId && b.date === data.date
    );

    const hasConflict = staffBookings.some((booking) => {
      // Simple time overlap check
      return booking.startTime === data.startTime;
    });

    if (hasConflict) {
      const staff = mockUsers.find((u) => u.id === data.staffId);
      setConflict(`${staff?.fullName} is already booked at this time`);
    } else {
      setConflict(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (conflict) {
      toast.error('Please resolve the scheduling conflict before saving');
      return;
    }

    if (!formData.customerId || !formData.staffId || !formData.date || !formData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const booking = addBooking({
      customerId: formData.customerId,
      staffId: formData.staffId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime || formData.startTime,
      product: formData.product,
      notes: formData.notes,
      status: 'Scheduled',
      totalAmount: parseFloat(formData.totalAmount) || 0,
      paidAmount: 0,
    });

    toast.success('Booking created successfully');
    navigate(`/bookings/${booking.id}`);
  };

  const selectedCustomer = customers.find((c) => c.id === formData.customerId);
  const staffMembers = mockUsers.filter((u) => u.role === 'Staff');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/bookings')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Booking</h1>
          <p className="text-gray-600 mt-1">Schedule a new maintenance booking</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      Date <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staff">
                      Staff Assigned <span className="text-red-600">*</span>
                    </Label>
                    <Select value={formData.staffId} onValueChange={(v) => handleChange('staffId', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">
                      Start Time <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                    />
                  </div>
                </div>

                {conflict && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Scheduling Conflict</p>
                      <p className="text-sm text-red-700">{conflict}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product & Service Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">
                      Product/Service Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="product"
                      placeholder="e.g., Air Conditioning Service"
                      value={formData.product}
                      onChange={(e) => handleChange('product', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Total Amount (LKR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.totalAmount}
                      onChange={(e) => handleChange('totalAmount', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes or special instructions"
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">
                      Select Customer <span className="text-red-600">*</span>
                    </Label>
                    <Select value={formData.customerId} onValueChange={(v) => handleChange('customerId', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a customer" />
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

                  {selectedCustomer && (
                    <div className="p-4 bg-gray-50 border rounded-lg space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedCustomer.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedCustomer.phoneNumber}</p>
                      </div>
                      {selectedCustomer.email && (
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{selectedCustomer.email}</p>
                        </div>
                      )}
                      {selectedCustomer.loyaltyNumber && (
                        <div>
                          <p className="text-sm text-gray-600">Loyalty Number</p>
                          <Badge variant="outline">{selectedCustomer.loyaltyNumber}</Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/customers/new')}
                  >
                    + Add New Customer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={!!conflict}>
                Save Booking
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/bookings')}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}