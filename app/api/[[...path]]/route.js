import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession, setSession, clearSession, encrypt } from '@/lib/auth';
import { sendBookingEmail } from '@/lib/email';
import { sendBookingSMS } from '@/lib/sms';
import bcrypt from 'bcryptjs';
import cloudinary from '@/lib/cloudinary';
import { ObjectId } from 'mongodb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Helper function to handle errors
function errorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { status, headers: corsHeaders });
}

// Helper function for success response
function successResponse(data, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

// GET Handler
export async function GET(request, { params }) {
  try {
    const path = params?.path?.join('/') || '';
    const { searchParams } = new URL(request.url);
    const db = await getDb();

    // Auth check endpoint
    if (path === 'auth/check') {
      const session = await getSession();
      return successResponse({ authenticated: !!session, user: session?.user || null });
    }

    // Tour Packages
    if (path === 'tours') {
      const tours = await db.collection('tours').find({ active: true }).sort({ createdAt: -1 }).toArray();
      return successResponse({ tours });
    }

    if (path.startsWith('tours/')) {
      const id = path.split('/')[1];
      const tour = await db.collection('tours').findOne({ id });
      if (!tour) return errorResponse('Tour not found', 404);
      return successResponse({ tour });
    }

    // Testimonials
    if (path === 'testimonials') {
      const testimonials = await db.collection('testimonials').find({ active: true }).sort({ createdAt: -1 }).toArray();
      return successResponse({ testimonials });
    }

    // Gallery
    if (path === 'gallery') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const gallery = await db.collection('gallery').find({ active: true }).sort({ createdAt: -1 }).limit(limit).toArray();
      return successResponse({ gallery });
    }

    // Blog Posts
    if (path === 'posts') {
      const posts = await db.collection('posts').find({ active: true }).sort({ createdAt: -1 }).toArray();
      return successResponse({ posts });
    }

    if (path.startsWith('posts/')) {
      const slug = path.split('/')[1];
      const post = await db.collection('posts').findOne({ slug, active: true });
      if (!post) return errorResponse('Post not found', 404);
      return successResponse({ post });
    }

    // Admin: Get all bookings
    if (path === 'admin/bookings') {
      const session = await getSession();
      if (!session) return errorResponse('Unauthorized', 401);

      const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
      return successResponse({ bookings });
    }

    // Admin: Get all tours (including inactive)
    if (path === 'admin/tours') {
      const session = await getSession();
      if (!session) return errorResponse('Unauthorized', 401);

      const tours = await db.collection('tours').find({}).sort({ createdAt: -1 }).toArray();
      return successResponse({ tours });
    }

    // Admin: Get all testimonials (including inactive)
    if (path === 'admin/testimonials') {
      const session = await getSession();
      if (!session) return errorResponse('Unauthorized', 401);

      const testimonials = await db.collection('testimonials').find({}).sort({ createdAt: -1 }).toArray();
      return successResponse({ testimonials });
    }

    // Admin: Get all gallery items (including inactive)
    if (path === 'admin/gallery') {
      const session = await getSession();
      if (!session) return errorResponse('Unauthorized', 401);

      const gallery = await db.collection('gallery').find({}).sort({ createdAt: -1 }).toArray();
      return successResponse({ gallery });
    }

    // Admin: Get all posts (including inactive)
    if (path === 'admin/posts') {
      const session = await getSession();
      if (!session) return errorResponse('Unauthorized', 401);

      const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).toArray();
      return successResponse({ posts });
    }

    // Admin: Get all contacts (kept for API compatibility, though UI is hidden)
    if (path === 'admin/contacts') {
      const session = await getSession();
      if (!session) return errorResponse('Unauthorized', 401);

      const contacts = await db.collection('contacts').find({}).sort({ createdAt: -1 }).toArray();
      return successResponse({ contacts });
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('GET Error:', error);
    return errorResponse(error.message);
  }
}

// POST Handler
export async function POST(request, { params }) {
  try {
    const path = params?.path?.join('/') || '';
    const db = await getDb();

    // Authentication
    if (path === 'auth/login') {
      const body = await request.json();
      const { username, password } = body;

      // Find user
      let user = await db.collection('users').findOne({ username });

      // If no users exist, create default admin
      if (!user && username === 'admin123') {
        const hashedPassword = await bcrypt.hash('admiN@123', 10);
        await db.collection('users').insertOne({
          username: 'admin123',
          password: hashedPassword,
          role: 'admin',
          createdAt: new Date()
        });
        user = await db.collection('users').findOne({ username });
      }

      if (!user) return errorResponse('Invalid credentials', 401);

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return errorResponse('Invalid credentials', 401);

      await setSession({ username: user.username, role: user.role });

      return successResponse({
        message: 'Login successful',
        user: { username: user.username, role: user.role }
      });
    }

    if (path === 'auth/logout') {
      await clearSession();
      return successResponse({ message: 'Logged out successfully' });
    }

    // Booking Form Submission
    if (path === 'bookings') {
      const body = await request.json();
      const { name, email, phone, tourType, dates, guests, message } = body;

      if (!name || !email || !phone || !tourType) {
        return errorResponse('Missing required fields', 400);
      }

      // Create booking
      const booking = {
        id: `BK${Date.now()}`,
        name,
        email,
        phone,
        tourType,
        dates: dates || 'Not specified',
        guests: guests || '1',
        message: message || '',
        status: 'pending',
        createdAt: new Date()
      };

      await db.collection('bookings').insertOne(booking);

      // Send email notification
      const emailResult = await sendBookingEmail(booking);

      // Send SMS notification
      const smsResult = await sendBookingSMS(booking);

      return successResponse({
        message: 'Booking received successfully! We will contact you shortly.',
        bookingId: booking.id,
        notifications: {
          email: emailResult,
          sms: smsResult
        }
      });
    }

    // Contact Form
    if (path === 'contact') {
      const body = await request.json();
      const { name, email, phone, message } = body;

      await db.collection('contacts').insertOne({
        name,
        email,
        phone,
        message,
        createdAt: new Date()
      });

      return successResponse({ message: 'Message sent successfully!' });
    }

    // Admin Routes - Require Authentication
    const session = await getSession();
    if (!session && path.startsWith('admin/')) {
      return errorResponse('Unauthorized', 401);
    }

    // Admin: Create Tour Package
    if (path === 'admin/tours') {
      const formData = await request.formData();

      const imageFile = formData.get('image');
      let imageUrl = '';

      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'tours' },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          ).end(buffer);
        });

        imageUrl = uploadResult.secure_url;
      }

      const featuresRaw = formData.get('features') || '';
      features: featuresRaw
        ? featuresRaw.split(',').map(f => f.trim())
        : []

      const tour = {
        id: `TOUR${Date.now()}`,
        title: formData.get('title'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        duration: formData.get('duration'),
        features: featuresRaw
          ? featuresRaw.split(',').map(f => f.trim())
          : [],
        active: formData.get('active') === 'true',
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('tours').insertOne(tour);

      return successResponse(
        { message: 'Tour created successfully', tour },
        201
      );
    }


    // Admin: Create Testimonial
    if (path === 'admin/testimonials') {
      const formData = await request.formData();
      const imageFile = formData.get('image');
      let imageUrl = '';

      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'testimonials' },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          ).end(buffer);
        });

        imageUrl = uploadResult.secure_url;
      }

      const testimonial = {
        id: `TEST${Date.now()}`,
        name: formData.get('name'),
        location: formData.get('location'),
        text: formData.get('text'),
        rating: Number(formData.get('rating')),
        tour: formData.get('tour'),
        image: imageUrl,
        active: formData.get('active') === 'true',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('testimonials').insertOne(testimonial);
      return successResponse({ message: 'Testimonial created successfully', testimonial }, 201);
    }

    // Admin: Create Gallery Item
    if (path === 'admin/gallery') {
      const formData = await request.formData();
      const imageFile = formData.get('image');
      let imageUrl = '';

      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'gallery' },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          ).end(buffer);
        });

        imageUrl = uploadResult.secure_url;
      }

      const galleryItem = {
        id: `GAL${Date.now()}`,
        title: formData.get('title'),
        category: formData.get('category'),
        image: imageUrl,
        active: formData.get('active') === 'true',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('gallery').insertOne(galleryItem);
      return successResponse({ message: 'Gallery item created successfully', galleryItem }, 201);
    }

    // Admin: Create Blog Post
    if (path === 'admin/posts') {
      const formData = await request.formData();
      const imageFile = formData.get('image');
      let imageUrl = '';

      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'posts' },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          ).end(buffer);
        });

        imageUrl = uploadResult.secure_url;
      }

      const post = {
        id: `POST${Date.now()}`,
        slug: formData.get('title')?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `post-${Date.now()}`,
        title: formData.get('title'),
        content: formData.get('content'),
        author: formData.get('author') || 'Admin',
        image: imageUrl,
        active: formData.get('active') === 'true',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('posts').insertOne(post);
      return successResponse({ message: 'Post created successfully', post }, 201);
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('POST Error:', error);
    return errorResponse(error.message);
  }
}

// PUT Handler
export async function PUT(request, { params }) {
  try {
    const path = params?.path?.join('/') || '';
    const db = await getDb();

    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    // PATCH Handler if ends with status

    if (path.startsWith('admin/tours/') && path.endsWith('/status')) {
      const id = path.split('/')[2];
      const body = await request.json();
      console.log('Updating status for tour ID:', id, 'to', body);

      await db.collection('tours').updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...body, active: body.active } }
      );

      return successResponse({ message: 'Status updated' });
    }

    // ===============================
    // Admin: Update Tour (FormData)
    // ===============================
    if (path.startsWith('admin/tours/')) {
      const id = path.split('/')[2];
      console.log('Updating tour with ID:', id);

      // ✅ USE formData(), NOT json()
      const formData = await request.formData();

      const updateData = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        duration: formData.get('duration'),
        features: formData.get('features')
          ?.split(',')
          .map(f => f.trim()),
        active: formData.get('active') === 'true',
        updatedAt: new Date(),
      };

      // Optional image upload
      const imageFile = formData.get('image');

      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'tours' },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          ).end(buffer);
        });

        updateData.image = uploadResult.secure_url;
      }

      await db.collection('tours').updateOne(
        { id },
        { $set: updateData }
      );

      return successResponse({ message: 'Tour updated successfully' });
    }


    // ===============================
    // Admin: Testimonials, Gallery, Posts (FormData)
    // ===============================
    if (path.startsWith('admin/testimonials/')) {
      const id = path.split('/')[2];
      const formData = await request.formData();

      const updateData = {
        name: formData.get('name'),
        location: formData.get('location'),
        text: formData.get('text'),
        rating: Number(formData.get('rating')),
        tour: formData.get('tour'),
        active: formData.get('active') === 'true',
        updatedAt: new Date(),
      };

      const imageFile = formData.get('image');
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'testimonials' },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          ).end(buffer);
        });

        updateData.image = uploadResult.secure_url;
      }

      await db.collection('testimonials').updateOne(
        { id },
        { $set: updateData }
      );

      return successResponse({ message: 'Testimonial updated successfully' });
    }

    if (path.startsWith('admin/gallery/')) {
      const id = path.split('/')[2];
      const formData = await request.formData();

      const updateData = {
        title: formData.get('title'),
        category: formData.get('category'),
        active: formData.get('active') === 'true',
        updatedAt: new Date(),
      };

      const imageFile = formData.get('image');
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'gallery' },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          ).end(buffer);
        });

        updateData.image = uploadResult.secure_url;
      }

      await db.collection('gallery').updateOne(
        { id },
        { $set: updateData }
      );

      return successResponse({ message: 'Gallery item updated successfully' });
    }

    if (path.startsWith('admin/posts/')) {
      const id = path.split('/')[2];
      const formData = await request.formData();

      const updateData = {
        title: formData.get('title'),
        content: formData.get('content'),
        author: formData.get('author') || 'Admin',
        active: formData.get('active') === 'true',
        updatedAt: new Date(),
      };

      const imageFile = formData.get('image');
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'posts' },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          ).end(buffer);
        });

        updateData.image = uploadResult.secure_url;
      }

      await db.collection('posts').updateOne(
        { id },
        { $set: updateData }
      );

      return successResponse({ message: 'Post updated successfully' });
    }

    if (path.startsWith('admin/bookings/')) {
      const id = path.split('/')[2];
      const body = await request.json();

      await db.collection('bookings').updateOne(
        { id },
        { $set: { status: body.status, updatedAt: new Date() } }
      );

      return successResponse({ message: 'Booking updated successfully' });
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('PUT Error:', error);
    return errorResponse(error.message);
  }
}


// DELETE Handler
export async function DELETE(request, { params }) {
  try {
    const path = params?.path?.join('/') || '';
    const db = await getDb();

    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    // Admin: Delete Tour
    if (path.startsWith('admin/tours/')) {
      const id = path.split('/')[2];
      const tour = await db.collection('tours').findOne({ id });
      if (!tour) return errorResponse('Tour not found', 404);
      console.log('img', tour?.image)
      if (tour?.image) {
        const publicId = tour.image.split('/').pop().split('.')[0];
        console.log('Deleting image from Cloudinary with public ID:', publicId);
        await cloudinary.uploader.destroy(`tours/${publicId}`);
      }
      await db.collection('tours').deleteOne({ id });
      return successResponse({ message: 'Tour deleted successfully' });
    }

    // Admin: Delete Testimonial
    if (path.startsWith('admin/testimonials/')) {
      const id = path.split('/')[2];
      const item = await db.collection('testimonials').findOne({ id });
      if (item?.image) {
        const publicId = item.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`testimonials/${publicId}`);
      }
      await db.collection('testimonials').deleteOne({ id });
      return successResponse({ message: 'Testimonial deleted successfully' });
    }

    // Admin: Delete Gallery Item
    if (path.startsWith('admin/gallery/')) {
      const id = path.split('/')[2];
      const item = await db.collection('gallery').findOne({ id });
      if (item?.image) {
        const publicId = item.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`gallery/${publicId}`);
      }
      await db.collection('gallery').deleteOne({ id });
      return successResponse({ message: 'Gallery item deleted successfully' });
    }

    // Admin: Delete Post
    if (path.startsWith('admin/posts/')) {
      const id = path.split('/')[2];
      const post = await db.collection('posts').findOne({ id });
      if (post?.image) {
        const publicId = post.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`posts/${publicId}`);
      }
      await db.collection('posts').deleteOne({ id });
      return successResponse({ message: 'Post deleted successfully' });
    }

    // Admin: Delete Contact
    if (path.startsWith('admin/contacts/')) {
      const id = path.split('/')[2];
      await db.collection('contacts').deleteOne({ _id: new ObjectId(id) });
      return successResponse({ message: 'Contact deleted successfully' });
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('DELETE Error:', error);
    return errorResponse(error.message);
  }
}
