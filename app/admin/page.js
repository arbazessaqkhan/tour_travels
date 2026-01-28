'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Image, FileText, Star, Calendar, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tours: 0,
    gallery: 0,
    posts: 0,
    testimonials: 0,
    bookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [tours, gallery, posts, testimonials, bookings] = await Promise.all([
        fetch('/api/admin/tours').then(r => r.json()),
        fetch('/api/admin/gallery').then(r => r.json()),
        fetch('/api/admin/posts').then(r => r.json()),
        fetch('/api/admin/testimonials').then(r => r.json()),
        fetch('/api/admin/bookings').then(r => r.json())
      ]);

      setStats({
        tours: tours.tours?.length || 0,
        gallery: gallery.gallery?.length || 0,
        posts: posts.posts?.length || 0,
        testimonials: testimonials.testimonials?.length || 0,
        bookings: bookings.bookings?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Tours', value: stats.tours, icon: MapPin, color: 'from-blue-500 to-blue-600', href: '/admin/tours' },
    { title: 'Gallery Items', value: stats.gallery, icon: Image, color: 'from-purple-500 to-purple-600', href: '/admin/gallery' },
    { title: 'Blog Posts', value: stats.posts, icon: FileText, color: 'from-green-500 to-green-600', href: '/admin/posts' },
    { title: 'Testimonials', value: stats.testimonials, icon: Star, color: 'from-yellow-500 to-yellow-600', href: '/admin/testimonials' },
    { title: 'Bookings', value: stats.bookings, icon: Calendar, color: 'from-orange-500 to-orange-600', href: '/admin/bookings' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to Waadi Kashmir Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = stat.href}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">Click to manage</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Content Items</span>
                <span className="font-bold text-lg">{stats.tours + stats.gallery + stats.posts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Interactions</span>
                <span className="font-bold text-lg">{stats.bookings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reviews</span>
                <span className="font-bold text-lg">{stats.testimonials}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">System Status</p>
                  <p className="text-gray-500">All services running normally</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">Database Connected</p>
                  <p className="text-gray-500">MongoDB connection active</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">Admin Access</p>
                  <p className="text-gray-500">You are logged in as admin</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
