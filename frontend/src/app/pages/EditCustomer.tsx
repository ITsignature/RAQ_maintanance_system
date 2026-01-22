import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { ArrowLeft, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

type Customer = {
  id: number;
  name: string;
  phone_no: string;
  telephone?: string | null;
  email?: string | null;
  loyalty_number?: string | null;
  address?: string | null;
};

export function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone_no: '',
    telephone: '',
    email: '',
    address: '',
    loyalty_number: '',
  });

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/users/${id}`);
        if (!res.ok) throw new Error('Failed to fetch customer');

        const data = await res.json();
        setCustomer(data);

        console.log(data);
        
        // Populate form with existing data
        setFormData({
          name: data.name || '',
          phone_no: data.phone_no || '',
          telephone: data.telephone || '',
          email: data.email || '',
          address: data.address || '',
          loyalty_number: data.loyalty_number || '',
        });
      } catch (error: any) {
        console.error('Error:', error);
        toast.error(error.message || 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.phone_no.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Phone number validation (9-20 characters)
    if (formData.phone_no.length < 9 || formData.phone_no.length > 20) {
      toast.error('Phone number must be between 9 and 20 characters');
      return;
    }

    // Email validation (if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Prepare data for submission
    const updateData: any = {
      name: formData.name.trim(),
      phone_no: formData.phone_no.trim(),
      telephone: formData.telephone.trim() || null,
      email: formData.email.trim() || null,
      loyalty_number: formData.loyalty_number.trim() || null,
      address: formData.address.trim() || null,
    };

    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/users/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update customer');
      }

      toast.success('Customer updated successfully');
      navigate(`/customers/${id}/details`);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl text-gray-600">Customer not found</p>
          <Link to="/customers">
            <Button className="mt-4">Back to Customers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/customers/${id}/details`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Customer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update customer information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  minLength={2}
                  maxLength={120}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_no">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_no"
                  type="tel"
                  placeholder="0771234567"
                  value={formData.phone_no}
                  onChange={(e) => handleChange('phone_no', e.target.value)}
                  required
                  minLength={9}
                  maxLength={20}
                  readOnly
                  disabled
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter 9-20 digit phone number (e.g., 0771234567)
                </p>
              </div>

              {/* Telephone */}
              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone (Optional)</Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="0112345678"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  minLength={9}
                  maxLength={20}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Loyalty Number */}
              <div className="space-y-2">
                <Label htmlFor="loyalty_number">Loyalty Number (Optional)</Label>
                <Input
                  id="loyalty_number"
                  type="text"
                  placeholder="LOY12345"
                  value={formData.loyalty_number}
                  onChange={(e) => handleChange('loyalty_number', e.target.value)}
                  maxLength={50}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Textarea
                id="address"
                placeholder="Enter customer address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.address.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t dark:border-gray-800">
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Customer'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/customers/${id}/details`)}
                disabled={submitting}
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