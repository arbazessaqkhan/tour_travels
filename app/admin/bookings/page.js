'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Eye, Calendar, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success('Booking status updated!');
        fetchBookings();
      } else {
        toast.error('Error updating status');
      }
    } catch (error) {
      toast.error('Error updating status');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading bookings..." />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-600">View and manage tour bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>{booking.name}</TableCell>
                  <TableCell>{booking.tourType}</TableCell>
                  <TableCell>{booking.guests || 'N/A'}</TableCell>
                  <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status || 'pending'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details - {booking.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <User className="w-4 h-4 mr-2" />
                                  Name
                                </div>
                                <div className="font-medium">{booking.name}</div>
                              </div>
                              <div>
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <Phone className="w-4 h-4 mr-2" />
                                  Phone
                                </div>
                                <div className="font-medium">{booking.phone}</div>
                              </div>
                              <div>
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <Mail className="w-4 h-4 mr-2" />
                                  Email
                                </div>
                                <div className="font-medium">{booking.email}</div>
                              </div>
                              <div>
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Dates
                                </div>
                                <div className="font-medium">{booking.dates || 'Not specified'}</div>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Tour Type</div>
                              <div className="font-medium">{booking.tourType}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Guests</div>
                              <div className="font-medium">{booking.guests || 'Not specified'}</div>
                            </div>
                            {booking.message && (
                              <div>
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Message
                                </div>
                                <div className="p-3 bg-gray-50 rounded">{booking.message}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-sm text-gray-600 mb-2">Update Status</div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={booking.status === 'pending' ? 'default' : 'outline'}
                                  onClick={() => updateStatus(booking.id, 'pending')}
                                  disabled={processing}
                                >
                                  Pending
                                </Button>
                                <Button
                                  size="sm"
                                  variant={booking.status === 'confirmed' ? 'default' : 'outline'}
                                  onClick={() => updateStatus(booking.id, 'confirmed')}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={processing}
                                >
                                  Confirmed
                                </Button>
                                <Button
                                  size="sm"
                                  variant={booking.status === 'completed' ? 'default' : 'outline'}
                                  onClick={() => updateStatus(booking.id, 'completed')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                  disabled={processing}
                                >
                                  Completed
                                </Button>
                                <Button
                                  size="sm"
                                  variant={booking.status === 'cancelled' ? 'default' : 'outline'}
                                  onClick={() => updateStatus(booking.id, 'cancelled')}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={processing}
                                >
                                  Cancelled
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
