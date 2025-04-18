import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Check if code is running on server side
const isServer = typeof window === 'undefined';

// Initialize the database connection
// Don't use dotenv.config() as it uses process.cwd which is not supported in Edge Runtime
// Environment variables should be loaded from .env.local automatically by Next.js
let sql: NeonQueryFunction<false, false>;

if (isServer) {
  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('WARNING: DATABASE_URL environment variable is not set');
    console.error('Database operations will fail');
  }
  
  // Create a SQL client with prepared statements
  try {
    sql = neon(process.env.DATABASE_URL!);
    console.log('Database connection initialized');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
  }
} else {
  console.warn('Attempting to access database from client side');
}

// Helper function to execute a query
export async function query<T>(queryString: string, params: any[] = []): Promise<T> {
  if (!isServer) {
    throw new Error('Database queries can only be executed on the server');
  }
  
  if (!sql) {
    throw new Error('Database connection not initialized');
  }
  
  return sql.query(queryString, params) as unknown as Promise<T>;
}

// Export sql for direct usage in server components
export { sql }; 