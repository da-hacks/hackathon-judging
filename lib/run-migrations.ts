import { readFileSync } from 'fs';
import path from 'path';
import { query } from './db';

// Run SQL migration script from db-schema.sql
async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'lib', 'db-schema.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    await query(sqlContent);
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations; 