// Run this script to seed initial data
// node scripts/seed-data.js

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017/waadi_kashmir';

const sampleTours = [
  {
    id: 'TOUR1',
    title: 'Dal Lake Houseboat Experience',
    description: 'Stay in a traditional Kashmiri houseboat on the iconic Dal Lake. Experience authentic Kashmiri hospitality with stunning mountain views.',
    duration: '2 Days / 1 Night',
    price: '₹ 8,500',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    features: ['Houseboat Stay', 'Shikara Ride', 'Kashmiri Cuisine', 'Sunset Views'],
    active: true,
    createdAt: new Date()
  },
  {
    id: 'TOUR2',
    title: 'Gulmarg Snow Adventure',
    description: 'Experience the magic of Gulmarg - Asia\'s premier skiing destination. Gondola rides, snow activities, and breathtaking Himalayan views.',
    duration: '3 Days / 2 Nights',
    price: '₹ 15,500',
    image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800',
    features: ['Gondola Ride', 'Skiing', 'Snow Activities', 'Mountain Views'],
    active: true,
    createdAt: new Date()
  },
  {
    id: 'TOUR3',
    title: 'Pahalgam Valley Paradise',
    description: 'Explore the Valley of Shepherds with its pristine meadows, gushing rivers, and serene landscapes. Perfect for nature lovers.',
    duration: '2 Days / 1 Night',
    price: '₹ 12,000',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    features: ['Betaab Valley', 'Aru Valley', 'River Rafting', 'Horse Riding'],
    active: true,
    createdAt: new Date()
  },
  {
    id: 'TOUR4',
    title: 'Srinagar Heritage Walk',
    description: 'Discover the rich heritage of Srinagar with visits to Mughal Gardens, ancient temples, and bustling markets.',
    duration: '1 Day',
    price: '₹ 5,500',
    image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800',
    features: ['Mughal Gardens', 'Shankaracharya Temple', 'Local Markets', 'Traditional Crafts'],
    active: true,
    createdAt: new Date()
  },
  {
    id: 'TOUR5',
    title: 'Complete Kashmir Package',
    description: 'The ultimate Kashmir experience covering Srinagar, Gulmarg, Pahalgam, and Sonmarg. All-inclusive luxury package.',
    duration: '7 Days / 6 Nights',
    price: '₹ 35,000',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    features: ['All Major Destinations', 'Luxury Hotels', 'Private Transport', 'All Meals'],
    active: true,
    createdAt: new Date()
  },
  {
    id: 'TOUR6',
    title: 'Leh Ladakh Adventure',
    description: 'Journey to the roof of the world. Experience the stark beauty of Ladakh with its monasteries and high-altitude passes.',
    duration: '6 Days / 5 Nights',
    price: '₹ 42,000',
    image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800',
    features: ['Monasteries', 'Pangong Lake', 'Khardung La', 'Local Culture'],
    active: true,
    createdAt: new Date()
  }
];

const sampleTestimonials = [
  {
    id: 'TEST1',
    name: 'Rajesh Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Amazing experience with Waadi Kashmir! The houseboat stay was magical and the team was incredibly professional. Highly recommended!',
    image: 'https://i.pravatar.cc/150?img=12',
    tour: 'Dal Lake Houseboat Experience',
    active: true,
    createdAt: new Date()
  },
  {
    id: 'TEST2',
    name: 'Priya Patel',
    location: 'Delhi',
    rating: 5,
    text: 'Best Kashmir tour ever! Gulmarg was breathtaking and the arrangements were flawless. Thank you Waadi Kashmir team!',
    image: 'https://i.pravatar.cc/150?img=45',
    tour: 'Gulmarg Snow Adventure',
    active: true,
    createdAt: new Date()
  },
  {
    id: 'TEST3',
    name: 'Amit Kumar',
    location: 'Bangalore',
    rating: 5,
    text: 'Pahalgam was like heaven on earth! Professional service and great hospitality. Will definitely book again.',
    image: 'https://i.pravatar.cc/150?img=33',
    tour: 'Pahalgam Valley Paradise',
    active: true,
    createdAt: new Date()
  },
  {
    id: 'TEST4',
    name: 'Sneha Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'The complete Kashmir package exceeded all expectations! Every detail was perfectly planned. 10/10 experience!',
    image: 'https://i.pravatar.cc/150?img=48',
    tour: 'Complete Kashmir Package',
    active: true,
    createdAt: new Date()
  }
];

const sampleGallery = [
  {
    id: 'GAL1',
    title: 'Dal Lake at Sunrise',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600',
    category: 'Lakes',
    active: true,
    createdAt: new Date()
  },
  {
    id: 'GAL2',
    title: 'Gulmarg Snow Peaks',
    image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=600',
    category: 'Mountains',
    active: true,
    createdAt: new Date()
  },
  {
    id: 'GAL3',
    title: 'Traditional Houseboat',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600',
    category: 'Accommodation',
    active: true,
    createdAt: new Date()
  },
  {
    id: 'GAL4',
    title: 'Pahalgam Valley',
    image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=600',
    category: 'Valleys',
    active: true,
    createdAt: new Date()
  }
];

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('waadi_kashmir');
    
    // Clear existing data (optional)
    await db.collection('tours').deleteMany({});
    await db.collection('testimonials').deleteMany({});
    await db.collection('gallery').deleteMany({});
    
    // Insert tours
    await db.collection('tours').insertMany(sampleTours);
    console.log('✅ Tours seeded');
    
    // Insert testimonials
    await db.collection('testimonials').insertMany(sampleTestimonials);
    console.log('✅ Testimonials seeded');
    
    // Insert gallery
    await db.collection('gallery').insertMany(sampleGallery);
    console.log('✅ Gallery seeded');
    
    console.log('\n🎉 Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
