import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

type Staff = { id: number; name: string; phone_no: string };
type Customer = { id: number; name: string; phone_no: string; email?: string; loyalty_number?: string };

const parseBookingDate = (bookingDate: string) => {
  // Parse the date in UTC and set it to the correct format
  const date = new Date(bookingDate);
  
  // Ensure to format it in YYYY-MM-DD format without changing the day
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // Return the date as YYYY-MM-DD
  return utcDate.toISOString().split('T')[0];
};

export function EditBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [conflict, setConflict] = useState<string | null>(null);

  // Staff & Customer data
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    staffIds: [] as string[],
    date: '',
    startTime: '',
    endTime: '',
    serviceName: '',
    totalAmount: '',
    notes: '',
    status: 'pending' as 'pending' | 'confirmed' | 'completed' | 'cancelled',

  });

  const staffDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch booking + related data
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);

        // 1. Get booking
        const bookingRes = await apiFetch(`/api/bookings/${id}`);
        if (!bookingRes.ok) throw new Error('Booking not found');
        const booking = await bookingRes.json();

        console.log('📅 Booking data:', booking);
        

        // 2. Get assigned staff
        const staffRes = await apiFetch(`/api/bookings/${id}/staff`);
        const assignedStaff = staffRes.ok ? (await staffRes.json()) : [];

        // 3. Get all staff (for picker)
        const allStaffRes = await apiFetch('/api/users/staff');
        const staffList = allStaffRes.ok ? (await allStaffRes.json()) : [];

        setAllStaff(staffList);
        setFormData({
          customerId: String(booking.customer_id),
          staffIds: assignedStaff.map((s: Staff) => String(s.id)),
          date: parseBookingDate(booking.booking_date), 
          startTime: booking.start_time.slice(0, 5), // HH:mm
          endTime: booking.end_time?.slice(0, 5) || booking.start_time.slice(0, 5),
          serviceName: booking.service_name || '',
          totalAmount: String(booking.service_amount || ''),
          notes: booking.note || '',
          status: booking.status,
        });

        // Pre-fill customer search field
        if (booking.customer_name) {
          setCustomerSearch(booking.customer_name);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Customer lazy search
  useEffect(() => {
    const q = customerSearch.trim();
    if (q.length < 2) {
      setCustomers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(`/api/users/customers?search=${encodeURIComponent(q)}`);
        if (res.ok) {
          setCustomers(await res.json());
        }
      } catch {}
    }, 350);

    return () => clearTimeout(timer);
  }, [customerSearch]);

  // Click outside → close dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!staffDropdownRef.current?.contains(e.target as Node)) {
        // close staff dropdown if you add search there too
      }
      if (!customerDropdownRef.current?.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedStaff = useMemo(
    () => allStaff.filter((s) => formData.staffIds.includes(String(s.id))),
    [allStaff, formData.staffIds]
  );

  const toggleStaff = (staffId: string) => {
    setFormData((prev) => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter((id) => id !== staffId)
        : [...prev.staffIds, staffId],
    }));
    setConflict(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflict(null);

    if (
      !formData.customerId ||
      !formData.date ||
      !formData.startTime ||
      !formData.serviceName ||
      formData.staffIds.length === 0
    ) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const payload = {
        customer_id: Number(formData.customerId),
        booking_date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime || formData.startTime,
        service_name: formData.serviceName,
        service_amount: Number(formData.totalAmount) || 0,
        note: formData.notes || null,
        staff_ids: formData.staffIds.map(Number),
        status: formData.status,
      };

      console.log('📅 Payload:', payload);
     const res = await apiFetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        const data = await res.json();
        setConflict(data.message || 'Time slot conflict detected');
        toast.error('Time conflict');
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Update failed');
      }

      toast.success('Booking updated');
      navigate(`/bookings/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking');
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading booking...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/bookings/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Booking</h1>
          <p className="text-muted-foreground">Booking #{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left & Middle - main fields */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as any })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {conflict && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2 items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-red-800 text-sm">{conflict}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service & Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Name *</Label>
                  <Input
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Amount (LKR)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Customer + Staff + Actions */}
          <div className="space-y-6">
            {/* Customer */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" ref={customerDropdownRef}>
                  <div className="relative">
                    <Input
                      placeholder="Search customer..."
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                    />

                    {showCustomerDropdown && customers.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {customers.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between"
                            onClick={() => {
                              setFormData({ ...formData, customerId: String(c.id) });
                              setCustomerSearch(c.name);
                              setShowCustomerDropdown(false);
                            }}
                          >
                            <div>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-sm text-muted-foreground">{c.phone_no}</div>
                            </div>
                            {formData.customerId === String(c.id) && <span>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Staff */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Staff *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Selected staff chips */}
                  <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                    {selectedStaff.map((s) => (
                      <Badge key={s.id} variant="secondary" className="gap-1 px-3 py-1">
                        {s.name}
                        <button
                          type="button"
                          onClick={() => toggleStaff(String(s.id))}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                    {selectedStaff.length === 0 && (
                      <div className="text-sm text-muted-foreground">No staff selected</div>
                    )}
                  </div>

                  {/* Staff picker */}
                  <div className="relative" ref={staffDropdownRef}>
                    <Input placeholder="Search & add staff..." readOnly className="bg-gray-50" />
                    {/* You can add proper staff search+multi-select here similar to create form */}
                    {/* For brevity → showing simple list of all staff */}
                    <div className="mt-2 max-h-48 overflow-auto border rounded-md">
                      {allStaff.map((s) => {
                        const isSelected = formData.staffIds.includes(String(s.id));
                        return (
                          <div
                            key={s.id}
                            className={`p-2.5 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                              isSelected ? 'bg-gray-100' : ''
                            }`}
                            onClick={() => toggleStaff(String(s.id))}
                          >
                            <div className="w-4 h-4 border rounded flex items-center justify-center">
                              {isSelected && <span className="text-xs">✓</span>}
                            </div>
                            <div>
                              <div>{s.name}</div>
                              <div className="text-xs text-muted-foreground">{s.phone_no}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-3 sticky top-4">
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/bookings/${id}`)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}