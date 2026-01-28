'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Phone, Mail, MapPin, Star, Calendar, Users, Award, Menu, X, Instagram, Facebook, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CldImage } from 'next-cloudinary';
import { Quote, ScrollText } from 'lucide-react';

export default function Home() {
  const [tours, setTours] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [viewingTour, setViewingTour] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchTours();
    fetchTestimonials();
    fetchGallery();
    fetchPosts();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await fetch('/api/tours');
      const data = await res.json();
      setTours(data.tours || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setGallery(data.gallery || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      console.log('d', data)
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };


  const handleBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const raw = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      phone: e.target.phone.value.trim(),
      tourType: e.target.tourType.value.trim(),
      dates: e.target.dates.value.trim(),
      guests: e.target.guests.value,
      message: e.target.message.value.trim()
    };

    // Basic frontend validation to help prevent abuse
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s]{7,18}$/;

    if (raw.name.length < 2 || raw.name.length > 80) {
      toast.error('Please enter a valid name (2-80 characters).');
      setIsSubmitting(false);
      return;
    }

    if (!emailRegex.test(raw.email) || raw.email.length > 120) {
      toast.error('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    if (!phoneRegex.test(raw.phone)) {
      toast.error('Please enter a valid phone number.');
      setIsSubmitting(false);
      return;
    }

    if (!raw.tourType) {
      toast.error('Please select a tour.');
      setIsSubmitting(false);
      return;
    }

    const guestsNumber = parseInt(raw.guests || '1', 10);
    if (Number.isNaN(guestsNumber) || guestsNumber < 1 || guestsNumber > 20) {
      toast.error('Guests should be between 1 and 20.');
      setIsSubmitting(false);
      return;
    }

    if (raw.message.length > 500) {
      toast.error('Message is too long. Please keep it under 500 characters.');
      setIsSubmitting(false);
      return;
    }

    // Very simple script-tag check
    const combinedText = `${raw.name} ${raw.tourType} ${raw.message}`;
    if (/<script/i.test(combinedText)) {
      toast.error('Invalid characters detected in input.');
      setIsSubmitting(false);
      return;
    }

    const formData = {
      ...raw,
      guests: guestsNumber,
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Booking submitted successfully! We will contact you shortly.');
        e.target.reset();
      } else {
        toast.error(data.error || 'Failed to submit booking');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCall = () => {
    window.location.href = 'tel:+919797100072';
  };


  const handleWhatsApp = () => {
    window.open('https://wa.me/919797100072', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <img src={'/logo.png'} alt="Waadi Kashmir" className="w-12 h-12 object-contain" />
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Waadi Kashmir</h1>
                  <p className="text-xs text-gray-600">Tour & Travels</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 480"
                  className="w-6 h-auto shadow-sm border border-gray-100 rounded-sm"
                  title="Proudly Indian"
                >
                  <path fill="#f4c430" d="M0 0h640v160H0z" />
                  <path fill="#fff" d="M0 160h640v160H0z" />
                  <path fill="#248813" d="M0 320h640v160H0z" />
                  <g transform="translate(320 240)">
                    <circle r="70" fill="none" stroke="#000080" strokeWidth="2" />
                    {[...Array(24)].map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1="10"
                        x2="0"
                        y2="70"
                        transform={`rotate(${i * 15})`}
                        stroke="#000080"
                        strokeWidth="2"
                      />
                    ))}
                  </g>
                </svg>
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#home" className="text-gray-700 hover:text-orange-500 transition">Home</a>
              <a href="#tours" className="text-gray-700 hover:text-orange-500 transition">Tours</a>
              <a href="#about" className="text-gray-700 hover:text-orange-500 transition">About</a>
              <a href="#gallery" className="text-gray-700 hover:text-orange-500 transition">Gallery</a>
              <a href="#booking" className="text-gray-700 hover:text-orange-500 transition">Book Now</a>
              <Button onClick={handleCall} className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pb-4 border-t pt-4 md:hidden"
            >
              <div className="flex flex-col space-y-3">
                <a href="#home" className="text-gray-700 hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>Home</a>
                <a href="#tours" className="text-gray-700 hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>Tours</a>
                <a href="#about" className="text-gray-700 hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>About</a>
                <a href="#gallery" className="text-gray-700 hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
                <a href="#booking" className="text-gray-700 hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>Book Now</a>
                <Button onClick={handleCall} className="bg-gradient-to-r from-orange-500 to-green-500">
                  <Phone className="w-4 h-4 mr-2" /> Call Now
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-blue-100 to-green-100 opacity-50" />
        <div className="container mx-auto px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 480"
                className="w-20 h-auto shadow-xl border-4 border-white rounded-lg"
              >
                <path fill="#f4c430" d="M0 0h640v160H0z" />
                <path fill="#fff" d="M0 160h640v160H0z" />
                <path fill="#248813" d="M0 320h640v160H0z" />
                <g transform="translate(320 240)">
                  <circle r="70" fill="none" stroke="#000080" strokeWidth="2" />
                  {[...Array(24)].map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1="10"
                      x2="0"
                      y2="70"
                      transform={`rotate(${i * 15})`}
                      stroke="#000080"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              </svg>
            </motion.div>
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-green-600 to-blue-600 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Discover Waadi Kashmir
            </motion.h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Where Heaven Meets Earth
            </p>
            <p className="text-lg text-gray-600 mb-12">
              Curated journeys to Srinagar, Gulmarg, Pahalgam & beyond
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                onClick={handleCall}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-6"
              >
                <Phone className="w-5 h-5 mr-2" />
                Book Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('tours').scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6 border-2"
              >
                Explore Tours
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg"
              >
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">10K+</div>
                <div className="text-sm md:text-base text-gray-600">Happy Travelers</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg"
              >
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-sm md:text-base text-gray-600">Tours</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-sm md:text-base text-gray-600">5-Star Reviews</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-gray-600 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">About Waadi Kashmir</h2>
            <p className="text-lg text-gray-600 mb-8">
              Born in Srinagar, delivering authentic Kashmiri journeys. We are a licensed tour operator by J&K Tourism,
              dedicated to showcasing the unparalleled beauty of Kashmir to travelers worldwide.
            </p>
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              <Card className="border-orange-200 hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Licensed by J&K Tourism</h3>
                </CardContent>
              </Card>
              <Card className="border-green-200 hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <Phone className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">24/7 Support</h3>
                </CardContent>
              </Card>
              <Card className="border-blue-200 hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Expert Guides</h3>
                </CardContent>
              </Card>
              <Card className="border-indigo-200 hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Local Expertise</h3>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tour Packages Section */}
      <section id="tours" className="py-20 bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Tour Packages</h2>
            <p className="text-lg text-gray-600">Explore our curated Kashmir experiences</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="overflow-hidden h-full hover:shadow-2xl transition-all duration-300 flex flex-col">
                  <div className="relative h-64 overflow-hidden shrink-0">
                    <img
                      src={tour.image}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold">
                      {tour.price}
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{tour.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tour.features?.slice(0, 3).map((feature, i) => (
                        <span key={i} className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        onClick={handleCall}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call to Book
                      </Button>
                      <Button
                        onClick={() => setViewingTour(tour)}
                        variant="outline"
                        className="flex-1"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tour Detail Modal */}
        <Dialog open={!!viewingTour} onOpenChange={(open) => !open && setViewingTour(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{viewingTour?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg border">
                {viewingTour?.image ? (
                  <CldImage
                    src={viewingTour.image}
                    fill
                    className="object-cover"
                    alt={viewingTour.title}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold uppercase text-gray-400 mb-1">Details</h4>
                    <div className="flex gap-4">
                      <Badge variant="secondary" className="px-3 py-1 text-sm bg-orange-100 text-orange-800 border-none">
                        {viewingTour?.price}
                      </Badge>
                      <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-100 text-blue-800 border-none">
                        {viewingTour?.duration}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase text-gray-400 mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                      {viewingTour?.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold uppercase text-gray-400 mb-2">Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingTour?.features?.length > 0 ? (
                        viewingTour.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-100 px-3 py-1">
                            {feature}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 italic text-sm">No specific highlights listed</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-blue-900 font-bold mb-2">Need a Custom Itinerary?</h4>
                    <p className="text-blue-700 text-sm mb-4">We can customize this tour to fit your preferences and budget perfectly.</p>
                    <Button onClick={handleCall} className="w-full bg-blue-600 hover:bg-blue-700">
                      Enquire Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setViewingTour(null)} variant="outline">Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Destinations Map Section */}
      <section id="destinations\" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Popular Destinations</h2>
            <p className="text-lg text-gray-600">Click to explore Kashmir's treasures</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Srinagar', icon: '🏛️', color: 'from-orange-500 to-orange-600' },
              { name: 'Gulmarg', icon: '⛷️', color: 'from-blue-500 to-blue-600' },
              { name: 'Pahalgam', icon: '🏔️', color: 'from-green-500 to-green-600' },
              { name: 'Leh-Ladakh', icon: '🏞️', color: 'from-purple-500 to-purple-600' }
            ].map((dest, index) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleCall}
                className="cursor-pointer"
              >
                <Card className={`bg-gradient-to-br ${dest.color} text-white hover:shadow-2xl transition-all`}>
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">{dest.icon}</div>
                    <h3 className="text-2xl font-bold">{dest.name}</h3>
                    <p className="text-sm mt-2 opacity-90\">Click to inquire</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">What Our Travelers Say</h2>
            <p className="text-lg text-gray-600">Real experiences from real people</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full mr-4 object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.location}</p>
                        <div className="flex mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.text}"</p>
                    <p className="text-sm text-green-600 mt-3 font-medium">Tour: {testimonial.tour}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Photo Gallery</h2>
            <p className="text-lg text-gray-600">Glimpses of Kashmir's beauty</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm">{item.category}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog / Posts Section */}
      <section id="posts" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Travel Stories & Blogs
            </h2>
            <p className="text-lg text-gray-600">
              Latest updates, tips & Kashmir experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col">
                  <div className="h-56 overflow-hidden shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <CardContent className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {(post.content || '').slice(0, 180)}{(post.content || '').length > 180 ? '...' : ''}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t">
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        {post.author || 'Admin'}
                      </div>
                      <Button
                        variant="link"
                        className="px-0 text-orange-600 font-semibold h-auto"
                        onClick={() => setViewingPost(post)}
                      >
                        Read More →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Blog Post Detail Modal */}
        <Dialog open={!!viewingPost} onOpenChange={(open) => !open && setViewingPost(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight">{viewingPost?.title}</DialogTitle>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                  {viewingPost?.author?.[0] || 'A'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{viewingPost?.author || 'Admin'}</p>
                  <p className="text-xs text-gray-500">
                    {viewingPost?.createdAt ? new Date(viewingPost.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Travel Stories'}
                  </p>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="relative w-full h-56 md:h-72 rounded-xl overflow-hidden shadow-lg border">
                {viewingPost?.image ? (
                  <CldImage
                    src={viewingPost.image}
                    fill
                    className="object-cover"
                    alt={viewingPost.title}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 relative italic text-gray-700">
                  <Quote className="absolute -top-3 -left-2 w-8 h-8 text-orange-200 opacity-60" />
                  <p className="relative z-10 text-base md:text-lg leading-relaxed">
                    {(viewingPost?.content || '').slice(0, 220)}{(viewingPost?.content || '').length > 220 ? '...' : ''}
                  </p>
                </div>

                <div className="prose prose-blue max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed bg-white border rounded-2xl p-6 md:p-10 shadow-sm min-h-[250px]">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                    <ScrollText className="w-6 h-6 text-green-600" />
                    Complete Experience
                  </h3>
                  <div className="text-sm md:text-base text-gray-700 space-y-4">
                    {viewingPost?.content}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4">
              <Button onClick={() => setViewingPost(null)} variant="outline">Close Reading</Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>


      {/* Booking Form Section */}
      <section id="booking" className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Book Your Journey</h2>
              <p className="text-lg text-gray-600">Fill the form and we'll contact you shortly</p>
            </div>

            <Card className="shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <Input name="name" required placeholder="Your name" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <Input name="email" type="email" required placeholder="your@email.com" className="w-full" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <Input name="phone" required placeholder="+91 9999999999" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tour Type *</label>
                      <select name="tourType" required className="w-full h-10 px-3 border border-gray-300 rounded-md">
                        <option value="">Select Tour</option>
                        {tours.map(tour => (
                          <option key={tour.id} value={tour.title}>{tour.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dates</label>
                      <Input name="dates" placeholder="e.g., Dec 15-20, 2024" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                      <Input name="guests" type="number" defaultValue="2" min="1" className="w-full" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <Textarea name="message" placeholder="Any special requirements..." rows={4} className="w-full" />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-lg py-6"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    By submitting, you agree to receive booking confirmation via email & SMS
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Waadi Kashmir</h3>
              <p className="text-gray-300 text-sm">Your trusted partner for authentic Kashmir experiences since 2020.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +91-9797100072</p>
                <p className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +91-9419041818</p>
                <p className="flex items-center"><Mail className="w-4 h-4 mr-2" /> waadikashmirtravels@gmail.com</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <a href="#tours" className="block hover:text-orange-400 transition">Tour Packages</a>
                <a href="#about" className="block hover:text-orange-400 transition">About Us</a>
                <a href="#gallery" className="block hover:text-orange-400 transition">Gallery</a>
                <a href="#booking" className="block hover:text-orange-400 transition">Book Now</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/waadikashmirtravels" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://www.facebook.com/share/1DDBY1KnaG" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition">
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
              <div className="mt-4 text-sm text-gray-300">
                <p className="flex items-center mb-2">
                  <Award className="w-4 h-4 mr-2 text-yellow-400" />
                  Licensed by J&K Tourism
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 Waadi Kashmir Tour & Travels. All rights reserved.</p>
            <p className="mt-2">Secure Payments | 24/7 Support | WhatsApp Verified</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        {/* WhatsApp Button */}
        <motion.div
          initial={{ scale: 0, x: 20 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: 1.2, type: 'spring' }}
        >
          <Button
            onClick={handleWhatsApp}
            size="lg"
            className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-[#25D366] hover:bg-[#128C7E] shadow-2xl flex items-center justify-center p-0 border-2 border-white"
            title="Chat on WhatsApp"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 md:w-10 md:h-10 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </Button>
        </motion.div>

        {/* Call Button */}
        <motion.div
          initial={{ scale: 0, x: 20 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: 1, type: 'spring' }}
          className="relative group"
        >
          <Button
            onClick={handleCall}
            size="lg"
            className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-2xl flex items-center justify-center border-2 border-white"
            title="Call Us"
          >
            <Phone className="w-6 h-6 md:w-8 md:h-8" />
          </Button>

          {/* Indian Flag Badge on Call Button */}
          <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border w-8 h-8 flex items-center justify-center text-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 480"
              className="w-5 h-auto rounded-[1px]"
            >
              <path fill="#f4c430" d="M0 0h640v160H0z" />
              <path fill="#fff" d="M0 160h640v160H0z" />
              <path fill="#248813" d="M0 320h640v160H0z" />
              <circle cx="320" cy="240" r="40" fill="#000080" />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
}