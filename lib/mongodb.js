// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;
if (!uri) {
  throw new Error('Please define the MONGO_URL environment variable inside .env.local');
}

const options = {
  //ly enable TLS (critical for Vercel + Atlas)
  tls: true,
  // Do NOT disable security in production — only for dev debugging
  tlsInsecure: process.env.NODE_ENV === 'development', // ← safer default
  // Improve connection reliability
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  // Required for Atlas SRV + newer drivers
  retryWrites: true,
  w: 'majority',
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Use global cache in development to avoid multiple connections
  if (!global._mongoClientPromise) {
    client = new MongoClient();
    global._mongoClientPromise = client.connect(uri, options);
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient();
  clientPromise = client.connect(uri, options);
}

export default clientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db('waadi_kashmir'); // matches your DB name
}