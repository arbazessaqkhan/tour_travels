'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { CldImage } from 'next-cloudinary';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner';
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

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      toast.error('Error fetching testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('location', e.target.location.value);
    formData.append('text', e.target.text.value);
    formData.append('rating', e.target.rating.value);
    formData.append('tour', e.target.tour.value);
    formData.append('active', e.target.active.checked);

    if (e.target.image.files[0]) {
      formData.append('image', e.target.image.files[0]);
    }

    setProcessing(true);
    try {
      const url = editingItem ? `/api/admin/testimonials/${editingItem.id}` : '/api/admin/testimonials';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (res.ok) {
        toast.success(editingItem ? 'Testimonial updated!' : 'Testimonial created!');
        setDialogOpen(false);
        setEditingItem(null);
        setImagePreview(null);
        fetchTestimonials();
      } else {
        toast.error('Error saving testimonial');
      }
    } catch (error) {
      toast.error('Error saving testimonial');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Testimonial deleted!');
        fetchTestimonials();
      }
    } catch (error) {
      toast.error('Error deleting testimonial');
    } finally {
      setProcessing(false);
    }
  };

  const toggleActive = async (item) => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('name', item.name);
      formData.append('location', item.location);
      formData.append('text', item.text);
      formData.append('rating', item.rating);
      formData.append('tour', item.tour);
      formData.append('active', !item.active);

      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: 'PUT',
        body: formData
      });

      if (res.ok) {
        toast.success('Status updated!');
        fetchTestimonials();
      }
    } catch (error) {
      toast.error('Error updating status');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading testimonials..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setImagePreview(null);
            }} className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input name="name" required defaultValue={editingItem?.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input name="location" required defaultValue={editingItem?.location} placeholder="e.g., Mumbai, India" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Testimonial Text</label>
                <Textarea name="text" required defaultValue={editingItem?.text} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <select name="rating" required defaultValue={editingItem?.rating || 5} className="w-full h-10 px-3 border border-gray-300 rounded-md">
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tour</label>
                  <Input name="tour" required defaultValue={editingItem?.tour} placeholder="Tour name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                {(imagePreview || editingItem?.image) && (
                  <div className="mb-4 relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden border mx-auto">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <CldImage
                        src={editingItem.image}
                        fill
                        className="object-cover"
                        alt="Current reviewer image"
                      />
                    )}
                  </div>
                )}
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingItem && !editingItem?.image}
                />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="active" id="active" defaultChecked={editingItem?.active !== false} className="mr-2" />
                <label htmlFor="active" className="text-sm font-medium">Active</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={processing}>Cancel</Button>
                <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700" disabled={processing}>
                  {processing ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Testimonial Modal */}
      <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Quote className="w-6 h-6 text-yellow-500 fill-yellow-500 opacity-50" />
              Testimonial Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 py-4 border-b">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
                {viewingItem?.image ? (
                  <CldImage
                    src={viewingItem.image}
                    fill
                    className="object-cover"
                    alt={viewingItem?.name}
                  />
                ) : (
                  <div className="w-full h-full bg-yellow-50 flex items-center justify-center text-yellow-300 text-3xl font-bold">
                    {viewingItem?.name?.[0]}
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{viewingItem?.name}</h3>
                <p className="text-gray-500 text-sm">{viewingItem?.location}</p>
                <div className="flex justify-center mt-2">
                  {[...Array(viewingItem?.rating || 0)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-yellow-50 rounded-2xl relative">
              <Quote className="absolute -top-4 -left-2 w-10 h-10 text-yellow-200 opacity-50" />
              <p className="text-lg text-gray-800 leading-relaxed relative z-10 italic">
                "{viewingItem?.text}"
              </p>
              <div className="mt-4 pt-4 border-t border-yellow-200 text-sm font-medium text-gray-600">
                Tour: <span className="text-yellow-800">{viewingItem?.tour}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">
                Created: {viewingItem?.createdAt ? new Date(viewingItem.createdAt).toLocaleDateString() : 'N/A'}
              </span>
              <Badge className={viewingItem?.active ? 'bg-green-500' : 'bg-gray-500'}>
                {viewingItem?.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setViewingItem(null)} variant="outline">Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All Testimonials ({testimonials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image ? (
                      <CldImage
                        src={item.image}
                        width={48}
                        height={48}
                        crop="fill"
                        alt={item.name}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-full text-[10px] text-gray-500">No Image</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <div className="flex">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{item.tour}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={item.active ? 'text-green-600 text-xs font-medium' : 'text-gray-400 text-xs'}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={item.active}
                        onCheckedChange={() => toggleActive(item)}
                        disabled={processing}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingItem(item)}
                        className="text-blue-600 hover:bg-blue-50"
                        title="View Full Testimonial"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(item);
                          setImagePreview(null);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            disabled={processing}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to delete this testimonial?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the testimonial from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700 text-white">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
