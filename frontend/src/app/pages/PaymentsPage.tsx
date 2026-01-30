import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Eye,
  DollarSign,
  Loader2,
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

type Payment = {
  id: number;
  booking_id: number;
  amount: string;
  method: string | null;
  reference_no: string | null;
  paid_at: string;
  note: string | null;
  is_active: boolean;
  created_by: number;
  service_name: string;
  service_amount: string;
  payment_status: string;
  customer_name?: string;
  customer_phone?: string;
  booking_date?: string;
};

type PaginationData = {
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
};

type Statistics = {
  totalPayments: number;
  totalAmount: number;
  todayPayments: number;
  todayAmount: number;
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 1,
    perPage: 50,
  });
  const [statistics, setStatistics] = useState<Statistics>({
    totalPayments: 0,
    totalAmount: 0,
    todayPayments: 0,
    todayAmount: 0,
  });
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchPayments = async (page: number = 1) => {
    setLoading(true);
    try {
      let url = `/api/payments/overview?page=${page}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (paymentMethodFilter !== 'all') {
        url += `&method=${encodeURIComponent(paymentMethodFilter)}`;
      }
      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      setPayments(data.payments);
      setPagination(data.pagination);
      setStatistics(data.statistics);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, paymentMethodFilter]);

  const filteredPayments = payments.filter((payment) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        payment.customer_name?.toLowerCase().includes(search) ||
        payment.customer_phone?.includes(search) ||
        payment.service_name.toLowerCase().includes(search) ||
        payment.reference_no?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `LKR ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodColor = (method: string | null) => {
    const colors: Record<string, string> = {
      Cash: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      Card: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
      'Online Transfer':
        'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400',
      Other: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400',
    };
    return colors[method || 'Other'] || 'bg-gray-100 text-gray-800';
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPayments(newPage);
    }
  };

  const clearFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setPaymentMethodFilter('all');
    setSearchTerm('');
  };

  const setDateRangePreset = (preset: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (preset) {
      case 'today':
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        setStartDate(yesterdayStr);
        setEndDate(yesterdayStr);
        break;
      case 'last7days':
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 6);
        setStartDate(last7.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
      case 'last30days':
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 29);
        setStartDate(last30.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
      case 'thisMonth':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setStartDate(lastMonthStart.toISOString().split('T')[0]);
        setEndDate(lastMonthEnd.toISOString().split('T')[0]);
        break;
    }
  };

  const getDateRangeDisplay = () => {
    if (startDate === endDate) {
      return formatDate(startDate);
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

 

const exportToPDF = () => {
  if (filteredPayments.length === 0) {
    toast.error('No payments to export');
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape', // better for tables
  });

  // Title
  doc.setFontSize(16);
  doc.text('Payments Report', 14, 15);

  // Subtitle
  doc.setFontSize(10);
  doc.text(
    `Date Range: ${getDateRangeDisplay()} | Generated: ${new Date().toLocaleString()}`,
    14,
    22
  );

  const tableData = filteredPayments.map((p, index) => [
    index + 1,
    `#${p.id}`,
    formatDateTime(p.paid_at),
    p.customer_name || '-',
    p.customer_phone || '-',
    p.service_name,
    p.method || 'N/A',
    p.reference_no || '-',
    formatCurrency(p.amount),
    p.note || '-',
  ]);

  autoTable(doc, {
    startY: 28,
    head: [[
      '#',
      'Payment ID',
      'Date & Time',
      'Customer',
      'Phone',
      'Service',
      'Method',
      'Reference',
      'Amount',
      'Note',
    ]],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [30, 64, 175], // blue header
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 35 },
      6: { cellWidth: 20 },
      7: { cellWidth: 30 },
      8: { cellWidth: 25 },
      9: { cellWidth: 40 },
    },
  });

  doc.save(`payments-${startDate}-to-${endDate}.pdf`);
};



  return (
    <div className="p-2 md:p-1 lg:p-1 space-y-6 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all payment transactions
          </p>
        </div>
        <DropdownMenu>
       <Button
         variant="outline"
         onClick={exportToPDF}
         className="w-full sm:w-auto"
       >
         Export PDF
       </Button>

        </DropdownMenu>
      </div>

      {/* Statistics Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(statistics.totalAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Payments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.todayPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(statistics.todayAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.totalAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Responsive Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date Range Presets */}
            <div className="space-y-2">
              <Label>Quick Date Range</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRangePreset('today')}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRangePreset('yesterday')}
                >
                  Yesterday
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRangePreset('last7days')}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRangePreset('last30days')}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRangePreset('thisMonth')}
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRangePreset('lastMonth')}
                >
                  Last Month
                </Button>
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method-filter">Payment Method</Label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger id="method-filter" className="w-full">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Payment Transactions
            {(startDate || endDate) && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({getDateRangeDisplay()})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Payment ID</TableHead>
                      <TableHead className="whitespace-nowrap">Date & Time</TableHead>
                      <TableHead className="whitespace-nowrap">Customer</TableHead>
                      <TableHead className="whitespace-nowrap">Service</TableHead>
                      <TableHead className="whitespace-nowrap">Method</TableHead>
                      <TableHead className="whitespace-nowrap">Reference</TableHead>
                      <TableHead className="whitespace-nowrap">Amount</TableHead>
                      <TableHead className="whitespace-nowrap">Note</TableHead>
                      {/* <TableHead className="whitespace-nowrap">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                 <TableBody>
  {filteredPayments.length === 0 ? (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
        No payments found
      </TableCell>
    </TableRow>
  ) : (
    filteredPayments.map((payment) => (
      <TableRow
        key={payment.id}
        onClick={() => navigate(`/bookings/${payment.booking_id}`)}
        className="cursor-pointer hover:bg-muted/50 transition"
      >
        <TableCell className="font-medium">#{payment.id}</TableCell>

        <TableCell className="whitespace-nowrap">
          {formatDateTime(payment.paid_at)}
        </TableCell>

        <TableCell>
          <div className="space-y-1">
            <div className="font-medium">{payment.customer_name}</div>
            <div className="text-sm text-muted-foreground">
              {payment.customer_phone}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="space-y-1">
            <div className="font-medium">{payment.service_name}</div>
            <div className="text-xs text-muted-foreground">
              Booking #{payment.booking_id}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <Badge variant="outline" className={getMethodColor(payment.method)}>
            {payment.method || "N/A"}
          </Badge>
        </TableCell>

        <TableCell className="whitespace-nowrap">
          {payment.reference_no || "-"}
        </TableCell>

        <TableCell className="font-semibold whitespace-nowrap">
          {formatCurrency(payment.amount)}
        </TableCell>

        <TableCell className="max-w-xs truncate">
          {payment.note || "-"}
        </TableCell>

        {/* 👁 View button removed */}
      </TableRow>
    ))
  )}
</TableBody>

                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No payments found
                  </div>
                ) : (
                  filteredPayments.map((payment) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-lg">#{payment.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(payment.paid_at)}
                          </div>
                        </div>
                        <Badge variant="outline" className={getMethodColor(payment.method)}>
                          {payment.method || 'N/A'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Customer</div>
                          <div className="font-medium">{payment.customer_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.customer_phone}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">Service</div>
                          <div className="font-medium">{payment.service_name}</div>
                          <div className="text-xs text-muted-foreground">
                            Booking #{payment.booking_id}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <div className="text-xs text-muted-foreground">Amount</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(payment.amount)}
                            </div>
                          </div>
                          <Link to={`/bookings/${payment.booking_id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        </div>

                        {payment.reference_no && (
                          <div>
                            <div className="text-xs text-muted-foreground">Reference</div>
                            <div className="text-sm">{payment.reference_no}</div>
                          </div>
                        )}

                        {payment.note && (
                          <div>
                            <div className="text-xs text-muted-foreground">Note</div>
                            <div className="text-sm">{payment.note}</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 space-y-4">
                  <div className="text-sm text-muted-foreground text-center">
                    Showing page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total payments)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="flex-1 md:flex-none"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="flex-1 md:flex-none"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}