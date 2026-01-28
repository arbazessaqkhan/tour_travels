'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  MapPin,
  Image,
  FileText,
  Star,
  Calendar,
  LogOut,
  Menu,
  X,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: MapPin, label: 'Tours', href: '/admin/tours' },
  { icon: Image, label: 'Gallery', href: '/admin/gallery' },
  { icon: FileText, label: 'Posts/Blogs', href: '/admin/posts' },
  { icon: Star, label: 'Testimonials', href: '/admin/testimonials' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
];

// Primary items for bottom nav (first 4 items)
const bottomNavItems = menuItems.slice(0, 4);
// Secondary items for the "More" menu
const moreMenuItems = menuItems.slice(4);

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuOpen && !e.target.closest('.more-menu-container')) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [moreMenuOpen]);

  // Close more menu on route change
  useEffect(() => {
    setMoreMenuOpen(false);
  }, [pathname]);

  const checkAuth = async () => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();

      if (data.authenticated) {
        setAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  // Show login page without layout
  if (pathname === '/admin/login') {
    return children;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show layout if not authenticated
  if (!authenticated) {
    return null;
  }

  // Check if current path matches any item in more menu
  const isMoreMenuActive = moreMenuItems.some(item => pathname === item.href);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop/Tablet Sidebar - Hidden on mobile */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 z-40 hidden md:block ${sidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-xs text-gray-400">Waadi Kashmir</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-gray-700"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LogOut className="w-5 h-5" />
                  {sidebarOpen && <span className="ml-3">Logout</span>}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be redirected to the login page and will need to login again to access the admin panel.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </aside>

      {/* Mobile Header - Visible only on mobile */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-gray-900 to-gray-800 text-white z-40 flex items-center justify-between px-4 md:hidden">
        <div>
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <p className="text-[10px] text-gray-400 -mt-1">Waadi Kashmir</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-700"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the login page and will need to login again to access the admin panel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      {/* Mobile Bottom Navigation - Visible only on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className="flex flex-col items-center justify-center py-2">
                  <div
                    className={`p-1.5 rounded-lg transition-all duration-200 ${isActive
                        ? 'bg-blue-100'
                        : ''
                      }`}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors ${isActive
                          ? 'text-blue-600'
                          : 'text-gray-500'
                        }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 font-medium transition-colors ${isActive
                        ? 'text-blue-600'
                        : 'text-gray-500'
                      }`}
                  >
                    {item.label === 'Posts/Blogs' ? 'Posts' : item.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* More Menu Button */}
          <div className="flex-1 more-menu-container relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMoreMenuOpen(!moreMenuOpen);
              }}
              className="w-full flex flex-col items-center justify-center py-2"
            >
              <div
                className={`p-1.5 rounded-lg transition-all duration-200 ${isMoreMenuActive || moreMenuOpen
                    ? 'bg-blue-100'
                    : ''
                  }`}
              >
                <MoreHorizontal
                  className={`w-5 h-5 transition-colors ${isMoreMenuActive || moreMenuOpen
                      ? 'text-blue-600'
                      : 'text-gray-500'
                    }`}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${isMoreMenuActive || moreMenuOpen
                    ? 'text-blue-600'
                    : 'text-gray-500'
                  }`}
              >
                More
              </span>
            </button>

            {/* More Menu Popup */}
            {moreMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                {moreMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center space-x-3 px-4 py-3 transition-colors ${isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 
          pt-14 pb-20 md:pt-0 md:pb-0
          md:${sidebarOpen ? 'ml-64' : 'ml-20'}
          ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
        `}
      >
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
