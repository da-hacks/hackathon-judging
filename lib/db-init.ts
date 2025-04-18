import { query } from './db';
import { initializeDatabase } from './db-models';

// Function to initialize the database that can be called from server components
export async function initDb() {
  console.log('Initializing database...');
  
  try {
    // Initialize database schema
    await initializeDatabase();
    console.log('Database initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Export a function that tests the database connection
export async function testDbConnection() {
  try {
    const result = await query<any[]>('SELECT version()', []);
    return {
      success: true,
      version: result[0]?.version || 'Unknown',
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
} 