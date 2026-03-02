const mongoose = require('mongoose');
const { env } = require('../config/env');
let isConnected = false;

export {}

const connectingToDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  const mongoUri = env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ FATAL ERROR: MONGODB_URI is missing in environment variables.');
    process.exit(1);
  }

  try {
    const db = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,       
      maxPoolSize: 10,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log(`✅ MongoDB Connected securely to: ${db.connection.host}`);
    
  } catch (error) {
    console.error('❌ MongoDB Initial Connection Error:', (error as Error).message);
    process.exit(1); 
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Mongoose will automatically attempt to reconnect...');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB automatically reconnected!');
  isConnected = true;
});

mongoose.connection.on('error', (err: Error) => {
  console.error('❌ MongoDB runtime error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed cleanly due to app termination');
  process.exit(0);
});

module.exports = connectingToDatabase;