import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Calendar } from '@/app/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Checkbox } from '@/app/components/ui/checkbox';
import { 
  Search, 
  Phone, 
  Mail, 
  CalendarIcon, 
  Filter, 
  X, 
  Send,
  MessageSquare,
  Wifi,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { format, parseISO, startOfDay } from "date-fns";
import { Loader } from '../components/Loader';


type Customer = {
  id: number;
  name: string;
  phone_no: string;
  email?: string;
  address?: string;
  loyalty_number?: string;
  created_at: string;
  last_booking_date?: string | null;
  total_bookings?: number;
};

type SMSTemplate = {
  id: string;
  name: string;
  message: string;
};

export function SMSLogsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // SMS Configuration
  const [smsMessage, setSmsMessage] = useState('');
  const [smsBalance, setSmsBalance] = useState(0);
  const [gatewayStatus, setGatewayStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [showSendDialog, setShowSendDialog] = useState(false);
  
  // Date filter states
  const [dateFilterType, setDateFilterType] = useState<'all' | 'range' | 'before' | 'after'>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);

  // SMS Templates
  const smsTemplates: SMSTemplate[] = [
    {
      id: 'maintenance_reminder',
      name: 'Maintenance Reminder',
      message: 'Hi {name}, your Tank maintenance is due soon. Book your slot today! Call us at 076 025 0061'
    },
    {
      id: 'booking_confirmation',
      name: 'Booking Confirmation',
      message: 'Hi {name}, your booking for {date} has been confirmed. See you soon!'
    },
    {
      id: 'service_complete',
      name: 'Service Complete',
      message: 'Hi {name}, your Tank maintenance service is complete. You can pick it up anytime!'
    },
    {
      id: 'custom',
      name: 'Custom Message',
      message: ''
    }
  ];

  // Fetch customers with their last booking date
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const customersRes = await apiFetch('/api/users/customers');
      if (!customersRes.ok) throw new Error('Failed to fetch customers');

      const customersData = await customersRes.json();
      const customersList: Customer[] = Array.isArray(customersData)
        ? customersData
        : (customersData.users || []);

      const bookingsRes = await apiFetch('/api/bookings?page=1');
      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');

      const bookingsData = await bookingsRes.json();
      const allBookings = bookingsData.bookings || [];

      const customersWithBookingInfo = customersList.map((customer) => {
        const customerBookings = allBookings.filter(
          (b: any) => b.customer_id === customer.id
        );

        let lastBookingDate = null;
        if (customerBookings.length > 0) {
          const sortedBookings = customerBookings.sort(
            (a: any, b: any) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
          );
          lastBookingDate = sortedBookings[0].booking_date;
        }

        return {
          ...customer,
          last_booking_date: lastBookingDate,
          total_bookings: customerBookings.length,
        };
      });

      setCustomers(customersWithBookingInfo);
      setFilteredCustomers(customersWithBookingInfo);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error(error.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch SMS settings
  const fetchSMSSettings = async () => {
    try {
      const response = await apiFetch('/api/sms/settings');
      if (response.ok) {
        const data = await response.json();
        setSmsBalance(data.balance || 0);
        setGatewayStatus(data.status || 'disconnected');
      }
    } catch (error) {
      console.error('Error fetching SMS settings:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchSMSSettings();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...customers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term) ||
          customer.phone_no.includes(term) ||
          customer.email?.toLowerCase().includes(term) ||
          customer.loyalty_number?.toLowerCase().includes(term)
      );
    }

    if (dateFilterType !== "all") {
      filtered = filtered.filter((customer) => {
        if (!customer.last_booking_date) return false;

        // Parse the last booking date and normalize to start of day for comparison
        const lastBooking = startOfDay(parseISO(customer.last_booking_date));

        switch (dateFilterType) {
          case "range": {
            if (!startDate || !endDate) return true;
            const from = startOfDay(startDate);
            const to = startOfDay(endDate);
            return lastBooking >= from && lastBooking <= to;
          }

          case "after": {
            if (!singleDate) return true;
            const from = startOfDay(singleDate);
            return lastBooking >= from;
          }

          case "before": {
            if (!singleDate) return true;
            const to = startOfDay(singleDate);
            return lastBooking <= to;
          }

          default:
            return true;
        }
      });
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, customers, dateFilterType, startDate, endDate, singleDate]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return format(date, 'MMM dd, yyyy');
  };

  const clearDateFilter = () => {
    setDateFilterType('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setSingleDate(undefined);
  };

  const toggleCustomerSelection = (customerId: number) => {
    const newSelection = new Set(selectedCustomers);
    if (newSelection.has(customerId)) {
      newSelection.delete(customerId);
    } else {
      newSelection.add(customerId);
    }
    setSelectedCustomers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = smsTemplates.find(t => t.id === templateId);
    if (template) {
      setSmsMessage(template.message);
    }
  };

  const handleSendSMS = async () => {
    if (selectedCustomers.size === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    if (!smsMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);

      const selectedCustomersList = customers.filter(c => selectedCustomers.has(c.id));
      
      const response = await apiFetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customers: selectedCustomersList.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone_no
          })),
          message: smsMessage
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send SMS');
      }

      const result = await response.json();
      
      toast.success(`SMS sent successfully to ${result.sent} customer(s)`);
      setShowSendDialog(false);
      setSmsMessage('');
      setSelectedCustomers(new Set());
      
      fetchSMSSettings();
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast.error(error.message || 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  const getGatewayStatusColor = (status: string) => {
    const colors = {
      connected: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.disconnected;
  };

  const hasActiveFilters = searchTerm || dateFilterType !== 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          {/* <p className="text-xl text-gray-600 dark:text-gray-400">Loading customers...</p> */}
          <Loader/>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 mx-auto p-2 md:p-2 lg:p-2 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Send SMS</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            Send maintenance reminders and notifications to customers
          </p>
        </div>
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogTrigger asChild>
            <Button 
              className="w-full sm:w-auto"
              disabled={selectedCustomers.size === 0 || gatewayStatus !== 'connected'}
            >
              <Send className="w-4 h-4 mr-2" />
              Send SMS ({selectedCustomers.size})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send SMS to {selectedCustomers.size} Customer(s)</DialogTitle>
              <DialogDescription>
                Compose your message below. Use placeholders like {'{name}'} for personalization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Template (Optional)
                </label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {smsTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Message
                </label>
                <Textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Characters: {smsMessage.length} | Estimated SMS: {Math.ceil(smsMessage.length / 160)}
                </p>
              </div>

              {smsMessage && (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                  <p className="text-xs font-medium mb-1">Preview:</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {smsMessage.replace('{name}', 'John Doe').replace('{phone}', '123-456-7890')}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSendDialog(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendSMS}
                  disabled={sending || !smsMessage.trim()}
                >
                  {sending ? 'Sending...' : `Send to ${selectedCustomers.size} Customer(s)`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SMS Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SMS Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Messages remaining</p>
            {smsBalance < 100 && (
              <Badge variant="destructive" className="mt-2 text-xs">Low Balance</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gateway Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getGatewayStatusColor(gatewayStatus)}>
              {gatewayStatus}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Provider: <span className="font-medium">TextIt</span>
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Selected Customers</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCustomers.size}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to send</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Filter className="w-4 h-4 md:w-5 md:h-5" />
            Filters
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  clearDateFilter();
                }}
                className="ml-auto"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, phone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full">
              <Select value={dateFilterType} onValueChange={(value: any) => setDateFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Last booking date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="range">Date Range</SelectItem>
                  <SelectItem value="after">After Date</SelectItem>
                  <SelectItem value="before">Before Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateFilterType === 'range' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setStartDate(new Date(e.target.value));
                      } else {
                        setStartDate(undefined);
                      }
                    }}
                    placeholder="Start Date"
                    className="flex-1"
                  />
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setEndDate(new Date(e.target.value));
                      } else {
                        setEndDate(undefined);
                      }
                    }}
                    placeholder="End Date"
                    className="flex-1"
                  />
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {(dateFilterType === 'after' || dateFilterType === 'before') && (
              <div className="w-full">
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={singleDate ? format(singleDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSingleDate(new Date(e.target.value));
                      } else {
                        setSingleDate(undefined);
                      }
                    }}
                    placeholder="Select Date"
                    className="flex-1"
                  />
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
                      <Calendar mode="single" selected={singleDate} onSelect={setSingleDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCustomers.length} of {customers.length} customers
            {selectedCustomers.size > 0 && ` • ${selectedCustomers.size} selected`}
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Loyalty #</TableHead>
                  <TableHead className="text-center">Total Bookings</TableHead>
                  <TableHead>Last Booking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {hasActiveFilters ? 'No customers match your filters' : 'No customers found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                      onClick={() => toggleCustomerSelection(customer.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedCustomers.has(customer.id)}
                          onCheckedChange={() => toggleCustomerSelection(customer.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{customer.phone_no}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="w-3 h-3" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.loyalty_number ? (
                          <Badge variant="outline">{customer.loyalty_number}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{customer.total_bookings || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        {customer.last_booking_date ? (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formatDate(customer.last_booking_date)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Never</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden p-4 space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {hasActiveFilters ? 'No customers match your filters' : 'No customers found'}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                  onClick={() => toggleCustomerSelection(customer.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedCustomers.has(customer.id)}
                      onCheckedChange={() => toggleCustomerSelection(customer.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-lg">{customer.name}</div>
                      {customer.loyalty_number && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {customer.loyalty_number}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {customer.total_bookings || 0} bookings
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{customer.phone_no}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t text-sm text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Last booking:</span>
                    <span className="font-medium">
                      {customer.last_booking_date ? formatDate(customer.last_booking_date) : 'Never'}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}