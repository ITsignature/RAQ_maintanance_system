import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { Booking, Payment, PaymentStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount);
}

// utils.ts
export function formatDate(date: string | Date): string {
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    return "Invalid Date"; // Return a fallback message or empty string
  }
  
  return parsedDate.toLocaleDateString();
}


export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
}

export function formatTime(time: string): string {
  return time;
}

export function getPaymentStatus(totalAmount: number, paidAmount: number): PaymentStatus {
  if (paidAmount === 0) return 'Unpaid';
  if (paidAmount >= totalAmount) return 'Paid';
  return 'Partially Paid';
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    // Booking statuses
    Scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
    'In Progress': 'bg-amber-100 text-amber-800 border-amber-300',
    Completed: 'bg-green-100 text-green-800 border-green-300',
    Cancelled: 'bg-red-100 text-red-800 border-red-300',
    // Payment statuses
    Paid: 'bg-green-100 text-green-800 border-green-300',
    'Partially Paid': 'bg-amber-100 text-amber-800 border-amber-300',
    Unpaid: 'bg-red-100 text-red-800 border-red-300',
    // SMS statuses
    Sent: 'bg-green-100 text-green-800 border-green-300',
    Failed: 'bg-red-100 text-red-800 border-red-300',
    Pending: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function calculateBalance(booking: Booking): number {
  return booking.totalAmount - booking.paidAmount;
}

export function getTotalPendingAmount(bookings: Booking[]): number {
  return bookings.reduce((total, booking) => {
    const status = getPaymentStatus(booking.totalAmount, booking.paidAmount);
    if (status === 'Unpaid' || status === 'Partially Paid') {
      return total + (booking.totalAmount - booking.paidAmount);
    }
    return total;
  }, 0);
}

export function getBookingsByDate(bookings: Booking[], date: string): Booking[] {
  return bookings.filter((booking) => booking.date === date);
}

export function getTodayBookings(bookings: Booking[]): Booking[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getBookingsByDate(bookings, today);
}

export function getUpcomingBookings(bookings: Booking[], limit: number = 5): Booking[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return bookings
    .filter((booking) => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate > today;
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, limit);
}