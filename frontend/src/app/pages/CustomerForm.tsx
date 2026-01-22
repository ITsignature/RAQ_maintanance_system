import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';           // ← your authenticated fetch helper
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function CustomerForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone_no: '',
    telephone: '',
    email: '',
    loyalty_number: '',
    address: '',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone_no.trim()) {
      toast.error('Full name and mobile phone are required');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name:           formData.name.trim(),
        phone_no:       formData.phone_no.trim(),
        telephone:      formData.telephone?.trim() || undefined,
        email:          formData.email?.trim() || undefined,
        loyalty_number: formData.loyalty_number?.trim() || undefined,
        address:        formData.address?.trim() || undefined,
      };

      const res = await apiFetch('/api/users/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 409) {
          toast.error(errData.message || 'Phone number or email already exists');
        } else if (res.status === 400) {
          toast.error(errData.message || 'Please check the form fields');
        } else {
          throw new Error('Failed to create customer');
        }
        return;
      }

      const data = await res.json();
      toast.success('Customer created successfully');

      // Optional: go to the new customer's detail page
      // navigate(`/customers/${data.customer_id}`);
      navigate('/customers');

    } catch (err) {
      console.error(err);
      toast.error('Failed to create customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/customers')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Customer</h1>
          <p className="text-gray-600 mt-1">Create a new customer record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_no">
                      Mobile Phone <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="phone_no"
                      type="tel"
                      placeholder="0777 123 456"
                      value={formData.phone_no}
                      onChange={e => handleChange('phone_no', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Telephone (Optional)</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="0112 345 678"
                      value={formData.telephone}
                      onChange={e => handleChange('telephone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loyalty_number">Loyalty Number (Optional)</Label>
                  <Input
                    id="loyalty_number"
                    placeholder="LOY-00123"
                    value={formData.loyalty_number}
                    onChange={e => handleChange('loyalty_number', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Textarea
                    id="address"
                    placeholder="No. 123, Main Street, Colombo 07"
                    rows={3}
                    value={formData.address}
                    onChange={e => handleChange('address', e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-5">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Customer'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/customers')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}