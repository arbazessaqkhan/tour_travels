'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, EyeOff, Maximize2 } from 'lucide-react';
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

export default function GalleryPage() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchGallery();
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

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      setGallery(data.gallery || []);
    } catch (error) {
      toast.error('Error fetching gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', e.target.title.value);
    formData.append('category', e.target.category.value);
    formData.append('active', e.target.active.checked);

    if (e.target.image.files[0]) {
      formData.append('image', e.target.image.files[0]);
    }

    setProcessing(true);
    try {
      const url = editingItem ? `/api/admin/gallery/${editingItem.id}` : '/api/admin/gallery';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (res.ok) {
        toast.success(editingItem ? 'Gallery item updated!' : 'Gallery item added!');
        setDialogOpen(false);
        setEditingItem(null);
        setImagePreview(null);
        fetchGallery();
      } else {
        toast.error('Error saving gallery item');
      }
    } catch (error) {
      toast.error('Error saving gallery item');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Gallery item deleted!');
        fetchGallery();
      }
    } catch (error) {
      toast.error('Error deleting item');
    } finally {
      setProcessing(false);
    }
  };

  const toggleActive = async (item) => {
    setProcessing(true);
    try {
      // Create a FormData to match the PUT expectation
      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('category', item.category);
      formData.append('active', !item.active);

      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PUT',
        body: formData
      });

      if (res.ok) {
        toast.success('Status updated!');
        fetchGallery();
      }
    } catch (error) {
      toast.error('Error updating status');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading gallery..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage gallery images</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setImagePreview(null);
            }} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Image' : 'Add New Image'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input name="title" required defaultValue={editingItem?.title} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input name="category" required defaultValue={editingItem?.category} placeholder="e.g., Nature, Culture, Adventure" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                {(imagePreview || editingItem?.image) && (
                  <div className="mb-4 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <CldImage
                        src={editingItem.image}
                        fill
                        className="object-cover"
                        alt="Current gallery item"
                      />
                    )}
                  </div>
                )}
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingItem}
                />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="active" id="active" defaultChecked={editingItem?.active !== false} className="mr-2" />
                <label htmlFor="active" className="text-sm font-medium">Active</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={processing}>Cancel</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={processing}>
                  {processing ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Gallery Item Modal */}
      <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{viewingItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-gray-100">
              {viewingItem?.image ? (
                <CldImage
                  src={viewingItem.image}
                  fill
                  className="object-contain"
                  alt={viewingItem.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">No Image</div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-none px-3 py-1">
                {viewingItem?.category}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <Badge className={viewingItem?.active ? 'bg-green-500' : 'bg-gray-500'}>
                  {viewingItem?.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setViewingItem(null)} variant="outline">Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-48">
              {item.image ? (
                <CldImage
                  src={item.image}
                  width={400}
                  height={300}
                  crop="fill"
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs ${item.active ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{item.category}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setViewingItem(item)} className="text-blue-600 hover:bg-blue-50">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1 border rounded-md px-2 py-1 bg-gray-50">
                  <Switch checked={item.active} onCheckedChange={() => toggleActive(item)} size="sm" disabled={processing} />
                </div>
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
                      <AlertDialogTitle>Are you sure you want to delete this image?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently remove the image from the gallery.
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
