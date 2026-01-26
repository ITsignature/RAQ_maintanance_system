import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO 
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type Booking = {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  customer_id: number;
  service_name: string;
  service_amount: string;
  note: string | null;
  status: string;
  payment_status: string;
  is_active: number;
  created_at: string;
};

type Customer = {
  id: number;
  name: string;
  phone_no: string;
  email?: string;
};

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Map<number, Customer>>(new Map());
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.getDay();
  
  // Add empty cells for days before the month starts
  const emptyDays = Array(firstDayOfWeek).fill(null);

  // Fetch all bookings for the current month
  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Format dates for API query
      const startDate = format(monthStart, 'yyyy-MM-dd');
      const endDate = format(monthEnd, 'yyyy-MM-dd');

      // Fetch all pages of bookings for this month
      let allBookings: Booking[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await apiFetch(`/api/bookings?page=${currentPage}`);
        if (!res.ok) throw new Error('Failed to fetch bookings');

        const data = await res.json();
        
        // Filter bookings for current month
        const monthBookings = data.bookings.filter((b: Booking) => {
          // Extract YYYY-MM-DD without timezone conversion
          const bookingDateStr = b.booking_date.substring(0, 10);
          return bookingDateStr >= startDate && bookingDateStr <= endDate;
        });

        allBookings = [...allBookings, ...monthBookings];

        // Check if we need to fetch more pages
        if (data.bookings.length < 50 || currentPage >= data.totalPages) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }

      setBookings(allBookings);

      // Fetch customers for all bookings
      await fetchCustomersForBookings(allBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers for bookings
  const fetchCustomersForBookings = async (bookingsList: Booking[]) => {
    try {
      // Get unique customer IDs
      const customerIds = [...new Set(bookingsList.map(b => b.customer_id))];
      
      // Fetch each customer
      const customerPromises = customerIds.map(async (id) => {
        try {
          const res = await apiFetch(`/api/users/${id}`);
          if (res.ok) {
            const customer = await res.json();
            return { id, customer };
          }
        } catch (error) {
          console.error(`Failed to fetch customer ${id}:`, error);
        }
        return null;
      });

      const results = await Promise.all(customerPromises);
      
      // Create a map of customer ID to customer data
      const customerMap = new Map<number, Customer>();
      results.forEach(result => {
        if (result) {
          customerMap.set(result.id, result.customer);
        }
      });

      setCustomers(customerMap);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch bookings when month changes
  useEffect(() => {
    fetchBookings();
  }, [currentMonth]);

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter((booking) => {
      // Extract YYYY-MM-DD from the ISO timestamp WITHOUT converting to local timezone
      // "2026-01-23T18:30:00.000Z" -> just take first 10 characters -> "2026-01-23"
      const bookingDateStr = booking.booking_date.substring(0, 10);
      return bookingDateStr === dateStr;
    });
  };

  const getCustomerById = (customerId: number): Customer | undefined => {
    return customers.get(customerId);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      scheduled: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      completed: 'bg-green-100 text-green-800 hover:bg-green-200',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-200',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your booking schedule
          </p>
        </div>
        <Button onClick={handleToday}>
          <CalendarIcon className="w-4 h-4 mr-2" />
          Today
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading calendar...</p>
            </div>
          ) : (
            /* Calendar Grid */
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div 
                  key={day} 
                  className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 p-2"
                >
                  {day}
                </div>
              ))}

              {/* Empty cells before month starts */}
              {emptyDays.map((_, index) => (
                <div 
                  key={`empty-${index}`} 
                  className="min-h-24 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900" 
                />
              ))}

              {/* Days of the month */}
              {daysInMonth.map((day) => {
                const dayBookings = getBookingsForDate(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'min-h-24 border rounded-lg p-2 overflow-hidden',
                      isToday 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'border-gray-200 dark:border-gray-700',
                      !isSameMonth(day, currentMonth) && 'bg-gray-50 dark:bg-gray-900 opacity-50'
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isToday && 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayBookings.length > 0 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {dayBookings.length}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map((booking) => {
                        const customer = getCustomerById(booking.customer_id);
                        return (
                          <Link
                            key={booking.id}
                            to={`/bookings/${booking.id}`}
                            className="block"
                          >
                            <div
                              className={cn(
                                'text-xs p-1 rounded truncate cursor-pointer transition-colors',
                                getStatusColor(booking.status)
                              )}
                            >
                              <div className="font-medium">
                                {formatTime(booking.start_time)}
                              </div>
                              <div className="truncate">
                                {customer?.name || 'Loading...'}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          +{dayBookings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor('pending')}>Pending</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor('scheduled')}>Scheduled</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor('completed')}>Completed</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor('cancelled')}>Cancelled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}