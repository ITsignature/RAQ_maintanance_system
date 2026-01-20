import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { FileUpload, UploadedFile } from '@/app/components/ui/file-upload';
import { ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, updateCustomer } = useData();

  const customer = customers.find((c) => c.id === id);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    loyaltyNumber: '',
  });

  const [profilePhoto, setProfilePhoto] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        email: customer.email || '',
        address: customer.address || '',
        loyaltyNumber: customer.loyaltyNumber || '',
      });
      setProfilePhoto(customer.profilePhoto ? [customer.profilePhoto] : []);
      setDocuments(customer.documents || []);
    }
  }, [customer]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Email validation (if provided)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    updateCustomer(customer.id, {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email || undefined,
      address: formData.address || undefined,
      loyaltyNumber: formData.loyaltyNumber || undefined,
      profilePhoto: profilePhoto[0] || undefined,
      documents: documents,
    });

    toast.success('Customer updated successfully');
    navigate('/customers');
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
        <Button variant="outline" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Edit Customer
          </h1>
          <p className="text-gray-600 mt-1">Update customer information</p>
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
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0771234567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  required
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
                />
              </div>

              {/* Loyalty Number */}
              <div className="space-y-2">
                <Label htmlFor="loyaltyNumber">Loyalty Number (Optional)</Label>
                <Input
                  id="loyaltyNumber"
                  type="text"
                  placeholder="LOYAL12345"
                  value={formData.loyaltyNumber}
                  onChange={(e) => handleChange('loyaltyNumber', e.target.value)}
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
              />
            </div>

            <FileUpload
              value={profilePhoto}
              onChange={setProfilePhoto}
              accept="image/*"
              maxFiles={1}
              label="Profile Photo (Optional)"
              description="Upload a profile picture for the customer"
            />

            <FileUpload
              value={documents}
              onChange={setDocuments}
              accept=".pdf,image/*"
              maxFiles={5}
              label="Documents (Optional)"
              description="Upload ID, contracts, or other customer documents"
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500">
                Update Customer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/customers')}
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