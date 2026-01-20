import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Booking, Customer, Payment, SMSLog, Notification } from '@/lib/types';
import {
  mockBookings,
  mockCustomers,
  mockPayments,
  mockSMSLogs,
  mockNotifications,
} from '@/lib/mock-data';

interface DataContextType {
  bookings: Booking[];
  customers: Customer[];
  payments: Payment[];
  smsLogs: SMSLog[];
  notifications: Notification[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Booking;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  addSMSLog: (smsLog: Omit<SMSLog, 'id' | 'sentAt'>) => SMSLog;
  markNotificationAsRead: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getBookingById: (id: string) => Booking | undefined;
  getPaymentsByBookingId: (bookingId: string) => Payment[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>(mockSMSLogs);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking => {
    const newBooking: Booking = {
      ...bookingData,
      id: `b${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBookings((prev) => [...prev, newBooking]);
    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
          : booking
      )
    );
  };

  const deleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === id ? { ...customer, ...updates } : customer))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
  };

  const addPayment = (paymentData: Omit<Payment, 'id' | 'createdAt'>): Payment => {
    const newPayment: Payment = {
      ...paymentData,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [...prev, newPayment]);

    // Update booking paid amount
    const booking = bookings.find((b) => b.id === paymentData.bookingId);
    if (booking) {
      updateBooking(booking.id, {
        paidAmount: booking.paidAmount + paymentData.amount,
      });
    }

    return newPayment;
  };

  const addSMSLog = (smsLogData: Omit<SMSLog, 'id' | 'sentAt'>): SMSLog => {
    const newSMSLog: SMSLog = {
      ...smsLogData,
      id: `s${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    setSmsLogs((prev) => [...prev, newSMSLog]);
    return newSMSLog;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const getCustomerById = (id: string) => {
    return customers.find((customer) => customer.id === id);
  };

  const getBookingById = (id: string) => {
    return bookings.find((booking) => booking.id === id);
  };

  const getPaymentsByBookingId = (bookingId: string) => {
    return payments.filter((payment) => payment.bookingId === bookingId);
  };

  return (
    <DataContext.Provider
      value={{
        bookings,
        customers,
        payments,
        smsLogs,
        notifications,
        addBooking,
        updateBooking,
        deleteBooking,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addPayment,
        addSMSLog,
        markNotificationAsRead,
        getCustomerById,
        getBookingById,
        getPaymentsByBookingId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
