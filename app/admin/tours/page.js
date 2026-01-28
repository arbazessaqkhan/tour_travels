'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye, EyeOff, Info } from 'lucide-react';
import { toast } from 'sonner';
import { CldImage } from 'next-cloudinary';
import { parseFormData } from '@/lib/parseForm';
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

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [viewingTour, setViewingTour] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await fetch('/api/admin/tours');
      const data = await res.json();
      setTours(data.tours || []);
    } catch (error) {
      toast.error('Error fetching tours');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form', e.target.title);
    const formData = new FormData();
    formData.append('title', e.target.title.value);
    formData.append('description', e.target.description.value);
    formData.append('price', e.target.price.value);
    formData.append('duration', e.target.duration.value);
    formData.append('features', e.target.features.value);
    formData.append('active', e.target.active.checked);

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }


    if (e.target.image.files[0]) {
      formData.append('image', e.target.image.files[0]);
    }

    setProcessing(true);
    try {
      const url = editingTour ? `/api/admin/tours/${editingTour.id}` : '/api/admin/tours';
      const method = editingTour ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (res.ok) {
        toast.success(editingTour ? 'Tour updated!' : 'Tour created!');
        setDialogOpen(false);
        setEditingTour(null);
        setImagePreview(null);
        fetchTours();
      } else {
        toast.error('Error saving tour');
      }
    } catch (error) {
      toast.error('Error saving tour');
    } finally {
      setProcessing(false);
    }
  };

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

  const handleDelete = async (id) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/tours/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Tour deleted!');
        fetchTours();
      } else {
        toast.error('Error deleting tour');
      }
    } catch (error) {
      toast.error('Error deleting tour');
    } finally {
      setProcessing(false);
    }
  };

  const toggleActive = async (tour) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/tours/${tour._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !tour.active })
      });

      if (res.ok) {
        toast.success('Tour status updated!');
        fetchTours();
      }
    } catch (error) {
      toast.error('Error updating tour');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading tours..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tours Management</h1>
          <p className="text-gray-600">Manage tour packages</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTour(null);
              setImagePreview(null);
            }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTour ? 'Edit Tour' : 'Add New Tour'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input name="title" required defaultValue={editingTour?.title} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea name="description" required defaultValue={editingTour?.description} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <Input name="price" required defaultValue={editingTour?.price} placeholder="₹15,000" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <Input name="duration" required defaultValue={editingTour?.duration} placeholder="5 Days / 4 Nights" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                {(imagePreview || editingTour?.image) && (
                  <div className="mb-4 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <CldImage
                        src={editingTour.image}
                        fill
                        className="object-cover"
                        alt="Current tour"
                      />
                    )}
                  </div>
                )}
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingTour}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Features (comma separated)</label>
                <Input name="features" required defaultValue={editingTour?.features?.join(', ')} placeholder="Hotel, Meals, Transport" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="active" id="active" defaultChecked={editingTour?.active !== false} className="mr-2" />
                <label htmlFor="active" className="text-sm font-medium">Active</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={processing}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Tour'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Tour Modal */}
      <Dialog open={!!viewingTour} onOpenChange={(open) => !open && setViewingTour(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{viewingTour?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg border">
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
                  <h4 className="text-sm font-semibold uppercase text-gray-500 mb-1">Details</h4>
                  <div className="flex gap-4">
                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-100 text-blue-800 border-none">
                      {viewingTour?.price ? `₹${viewingTour.price}` : 'No price'}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-orange-100 text-orange-800 border-none">
                      {viewingTour?.duration}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold uppercase text-gray-500 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {viewingTour?.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold uppercase text-gray-500 mb-2">Features / Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingTour?.features?.length > 0 ? (
                      viewingTour.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="bg-gray-50">
                          {feature}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 italic text-sm">No specific features listed</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold uppercase text-gray-500 mb-1">Status</h4>
                  <Badge className={viewingTour?.active ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}>
                    {viewingTour?.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setViewingTour(null)} variant="outline">Close Details</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All Tours ({tours.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tours.map((tour) => (
                <TableRow key={tour.id}>
                  <TableCell>
                    <CldImage
                      src={tour.image}
                      width={64}
                      height={64}
                      crop="fill"
                      alt={tour.title}
                    />

                  </TableCell>
                  <TableCell className="font-medium">{tour.title}</TableCell>
                  <TableCell>{tour.price}</TableCell>
                  <TableCell>{tour.duration}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={tour.active ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {tour.active ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={tour.active}
                        onCheckedChange={() => toggleActive(tour)}
                        disabled={processing}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingTour(tour)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTour(tour);
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
                            <AlertDialogTitle>Are you sure you want to delete this tour?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the tour package from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(tour.id)} className="bg-red-600 hover:bg-red-700 text-white">
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
