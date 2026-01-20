import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
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
import { mockUsers } from '@/lib/mock-data';
import { CreditCard, Users as UsersIcon, Settings as SettingsIcon, MessageSquare, Shield, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function SettingsPage() {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', name: 'Cash', isActive: true, isDefault: true },
    { id: '2', name: 'Card', isActive: true, isDefault: false },
    { id: '3', name: 'Online Transfer', isActive: true, isDefault: false },
    { id: '4', name: 'Other', isActive: true, isDefault: false },
  ]);

  const [systemSettings, setSystemSettings] = useState({
    defaultBookingDuration: '60',
    businessHoursStart: '08:00',
    businessHoursEnd: '18:00',
    timezone: 'Asia/Colombo',
    currency: 'LKR',
  });

  const [smsTemplates] = useState([
    {
      id: '1',
      name: 'Booking Confirmation',
      template: 'Hi {customer_name}, your booking for {product} on {date} at {time} has been confirmed.',
    },
    {
      id: '2',
      name: 'Reminder (1 day before)',
      template: 'Hi {customer_name}, reminder: You have a booking for {product} tomorrow at {time}.',
    },
    {
      id: '3',
      name: 'Completion Notification',
      template: 'Hi {customer_name}, your {product} has been completed. Thank you for choosing our services!',
    },
    {
      id: '4',
      name: 'Reschedule Notification',
      template: 'Hi {customer_name}, your booking has been rescheduled to {date} at {time}.',
    },
  ]);

  const [securitySettings, setSecuritySettings] = useState({
    minPasswordLength: '8',
    requireSpecialChars: true,
    passwordExpiryDays: '90',
    sessionTimeoutMinutes: '30',
  });

  // User management state
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    role: 'Staff',
    password: '',
  });

  const handleSavePaymentMethods = () => {
    toast.success('Payment methods updated successfully');
  };

  const handleSaveSystemSettings = () => {
    toast.success('System settings updated successfully');
  };

  const handleSaveSecuritySettings = () => {
    toast.success('Security settings updated successfully');
  };

  // User management functions
  const handleOpenUserDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        password: '',
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        role: 'Staff',
        password: '',
      });
    }
    setIsUserDialogOpen(true);
  };

  const handleCloseUserDialog = () => {
    setIsUserDialogOpen(false);
    setEditingUser(null);
    setUserFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      role: 'Staff',
      password: '',
    });
  };

  const handleSaveUser = () => {
    if (!userFormData.fullName || !userFormData.phoneNumber || !userFormData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!editingUser && !userFormData.password) {
      toast.error('Password is required for new users');
      return;
    }

    if (editingUser) {
      toast.success('User updated successfully');
    } else {
      toast.success('User added successfully');
    }
    
    handleCloseUserDialog();
  };

  const handleDeactivateUser = (user: any) => {
    toast.success(`User ${user.fullName} deactivated successfully`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">System configuration and preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs defaultValue="payment-methods" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payment-methods">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="users">
              <UsersIcon className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="system">
              <SettingsIcon className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS Templates
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage available payment methods for bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={(checked) => {
                            setPaymentMethods(
                              paymentMethods.map((m) =>
                                m.id === method.id ? { ...m, isActive: checked } : m
                              )
                            );
                          }}
                        />
                        <div>
                          <p className="font-medium">{method.name}</p>
                          {method.isDefault && (
                            <Badge variant="outline" className="mt-1">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPaymentMethods(
                              paymentMethods.map((m) => ({
                                ...m,
                                isDefault: m.id === method.id,
                              }))
                            );
                          }}
                        >
                          Set as Default
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                  <div className="pt-4">
                    <Button onClick={handleSavePaymentMethods}>Save Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Accounts</CardTitle>
                  <CardDescription>Manage system users and their roles</CardDescription>
                </div>
                <Button onClick={() => handleOpenUserDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'Admin' ? 'default' : 'outline'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenUserDialog(user)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeactivateUser(user)}>
                              Deactivate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* User Management Dialog */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Edit user details' : 'Add a new user to the system'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={userFormData.fullName}
                      onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={userFormData.phoneNumber}
                      onChange={(e) => setUserFormData({ ...userFormData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={userFormData.role}
                      onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue>{userFormData.role}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!editingUser && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleCloseUserDialog}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSaveUser}>
                    {editingUser ? 'Update User' : 'Add User'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* System Preferences Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Configure general system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Default Booking Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={systemSettings.defaultBookingDuration}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            defaultBookingDuration: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={systemSettings.timezone}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, timezone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Business Hours Start</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={systemSettings.businessHoursStart}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            businessHoursStart: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Business Hours End</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={systemSettings.businessHoursEnd}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            businessHoursEnd: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={systemSettings.currency}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, currency: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleSaveSystemSettings}>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Templates Tab */}
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle>SMS Templates</CardTitle>
                <CardDescription>
                  Customize SMS message templates. Use variables like {'{customer_name}'}, {'{date}'},
                  {'{time}'}, {'{product}'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {smsTemplates.map((template) => (
                    <div key={template.id} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">{template.name}</Label>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                      <Textarea value={template.template} readOnly className="bg-gray-50" rows={3} />
                    </div>
                  ))}
                  <div className="pt-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Available Variables:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          '{customer_name}',
                          '{date}',
                          '{time}',
                          '{product}',
                          '{staff_name}',
                          '{amount}',
                        ].map((variable) => (
                          <Badge key={variable} variant="outline">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security & Password Rules</CardTitle>
                <CardDescription>Configure security settings and password policies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minLength">Minimum Password Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        value={securitySettings.minPasswordLength}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            minPasswordLength: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Password Expiry (days)</Label>
                      <Input
                        id="expiry"
                        type="number"
                        value={securitySettings.passwordExpiryDays}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordExpiryDays: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeout">Session Timeout (minutes)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={securitySettings.sessionTimeoutMinutes}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeoutMinutes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Require Special Characters</p>
                      <p className="text-sm text-gray-600">
                        Passwords must contain at least one special character
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.requireSpecialChars}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          requireSpecialChars: checked,
                        })
                      }
                    />
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleSaveSecuritySettings}>Save Security Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}