import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { cn, getStatusColor } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function CalendarPage() {
  const { bookings, getCustomerById } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.getDay();
  
  // Add empty cells for days before the month starts
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter((booking) => booking.date === dateStr);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-gray-600 mt-1">View and manage your booking schedule</p>
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
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-gray-600 p-2">
                {day}
              </div>
            ))}

            {/* Empty cells before month starts */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="min-h-24 border border-gray-200 rounded-lg bg-gray-50" />
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
                    isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
                    !isSameMonth(day, currentMonth) && 'bg-gray-50 opacity-50'
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
                      const customer = getCustomerById(booking.customerId);
                      return (
                        <Link
                          key={booking.id}
                          to={`/bookings/${booking.id}`}
                          className="block"
                        >
                          <div
                            className={cn(
                              'text-xs p-1 rounded truncate cursor-pointer hover:opacity-80',
                              getStatusColor(booking.status)
                            )}
                          >
                            <div className="font-medium">{booking.startTime}</div>
                            <div className="truncate">{customer?.fullName}</div>
                          </div>
                        </Link>
                      );
                    })}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-600 text-center">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
              <Badge className={getStatusColor('Scheduled')}>Scheduled</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor('In Progress')}>In Progress</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor('Completed')}>Completed</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor('Cancelled')}>Cancelled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}