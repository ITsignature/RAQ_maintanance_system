import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function CustomerForm() {
  const navigate = useNavigate();
  const { addCustomer } = useData();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    telephone: '',
    email: '',
    loyaltyNumber: '',
    address: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const customer = addCustomer({
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      telephone: formData.telephone || undefined,
      email: formData.email || undefined,
      loyaltyNumber: formData.loyaltyNumber || undefined,
      address: formData.address || undefined,
    });

    toast.success('Customer created successfully');
    navigate('/customers');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/customers')}>
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Mobile Phone <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="07X XXX XXXX"
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Telephone (Optional)</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="011 XXX XXXX"
                      value={formData.telephone}
                      onChange={(e) => handleChange('telephone', e.target.value)}
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
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loyaltyNumber">Loyalty Number (Optional)</Label>
                  <Input
                    id="loyaltyNumber"
                    placeholder="LOY001"
                    value={formData.loyaltyNumber}
                    onChange={(e) => handleChange('loyaltyNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter customer address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit">Save Customer</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/customers')}
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