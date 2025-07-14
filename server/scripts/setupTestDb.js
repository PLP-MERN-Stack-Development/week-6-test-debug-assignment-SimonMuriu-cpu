const mongoose = require('mongoose');
require('dotenv').config();

const setupTestDatabase = async () => {
  try {
    const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/mern-testing-test';
    
    console.log('Connecting to test database...');
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to test database');
    
    // Drop existing collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log(`Dropped collection: ${collection.collectionName}`);
    }
    
    console.log('Test database setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
};

setupTestDatabase();