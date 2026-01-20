// Type definitions for the maintenance booking system

export type BookingStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';
export type PaymentMethod = 'Cash' | 'Card' | 'Online Transfer' | 'Other';
export type UserRole = 'Admin' | 'Staff';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  password: string;
  profilePhoto?: UploadedFile;
}

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  telephone?: string;
  email?: string;
  loyaltyNumber?: string;
  address?: string;
  createdAt: string;
  profilePhoto?: UploadedFile;
  documents?: UploadedFile[];
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
  enteredBy: string;
  createdAt: string;
  receipt?: UploadedFile;
}

export interface Booking {
  id: string;
  customerId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  product: string;
  notes?: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
  servicePhotos?: UploadedFile[];
  documents?: UploadedFile[];
}

export interface SMSLog {
  id: string;
  bookingId: string;
  customerId: string;
  phoneNumber: string;
  messageType: string;
  message: string;
  status: 'Sent' | 'Failed' | 'Pending';
  sentAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}