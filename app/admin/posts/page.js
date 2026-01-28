'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye, EyeOff, ScrollText } from 'lucide-react';
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

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPosts();
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

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      toast.error('Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', e.target.title.value);
    formData.append('content', e.target.content.value);
    formData.append('author', e.target.author.value);
    formData.append('active', e.target.active.checked);

    if (e.target.image.files[0]) {
      formData.append('image', e.target.image.files[0]);
    }

    setProcessing(true);
    try {
      const url = editingPost ? `/api/admin/posts/${editingPost.id}` : '/api/admin/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (res.ok) {
        toast.success(editingPost ? 'Post updated!' : 'Post created!');
        setDialogOpen(false);
        setEditingPost(null);
        setImagePreview(null);
        fetchPosts();
      } else {
        toast.error('Error saving post');
      }
    } catch (error) {
      toast.error('Error saving post');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Post deleted!');
        fetchPosts();
      }
    } catch (error) {
      toast.error('Error deleting post');
    } finally {
      setProcessing(false);
    }
  };

  const toggleActive = async (post) => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('title', post.title);
      formData.append('content', post.content);
      formData.append('author', post.author || 'Admin');
      formData.append('active', !post.active);

      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PUT',
        body: formData
      });

      if (res.ok) {
        toast.success('Post status updated!');
        fetchPosts();
      }
    } catch (error) {
      toast.error('Error updating post');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading posts..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts/Blogs Management</h1>
          <p className="text-gray-600">Manage blog posts and articles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPost(null);
              setImagePreview(null);
            }} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Add New Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input name="title" required defaultValue={editingPost?.title} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea name="content" required defaultValue={editingPost?.content} rows={8} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                {(imagePreview || editingPost?.image) && (
                  <div className="mb-4 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <CldImage
                        src={editingPost.image}
                        fill
                        className="object-cover"
                        alt="Current post image"
                      />
                    )}
                  </div>
                )}
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingPost}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <Input name="author" required defaultValue={editingPost?.author || 'Admin'} />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="active" id="active" defaultChecked={editingPost?.active !== false} className="mr-2" />
                <label htmlFor="active" className="text-sm font-medium">Active</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={processing}>Cancel</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Post Modal */}
      <Dialog open={!!viewingPost} onOpenChange={(open) => !open && setViewingPost(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{viewingPost?.title}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{viewingPost?.author || 'Admin'}</Badge>
              <span className="text-xs text-gray-500">
                Created: {viewingPost?.createdAt ? new Date(viewingPost.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg border">
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
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed bg-white border rounded-lg p-6 min-h-[200px]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-green-600" />
                  Full Content
                </h3>
                {viewingPost?.content}
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                <div>
                  <h4 className="text-sm font-semibold uppercase text-gray-500 mb-1">Status</h4>
                  <Badge className={viewingPost?.active ? 'bg-green-500' : 'bg-gray-500'}>
                    {viewingPost?.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {viewingPost?.slug && (
                  <div className="text-right">
                    <h4 className="text-sm font-semibold uppercase text-gray-500 mb-1">Slug</h4>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">{viewingPost.slug}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setViewingPost(null)} variant="outline">Close View</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    {post.image ? (
                      <CldImage
                        src={post.image}
                        width={64}
                        height={64}
                        crop="fill"
                        alt={post.title}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">No Image</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.author || 'Admin'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={post.active ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {post.active ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={post.active}
                        onCheckedChange={() => toggleActive(post)}
                        disabled={processing}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingPost(post)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPost(post);
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
                            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the blog post from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-red-600 hover:bg-red-700 text-white">
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
