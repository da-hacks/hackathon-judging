import { config } from 'dotenv';
import path from 'path';
import { initializeDatabase, createProject, createJudge } from './db-models';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// Make sure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  console.error('Make sure you have a .env.local file with DATABASE_URL defined.');
  process.exit(1);
}

// This script can be run independently to initialize the database
async function init() {
  console.log('Initializing database...');
  
  try {
    // Initialize database schema
    await initializeDatabase();
    
    // Add sample data
    console.log('Adding sample data...');
    try {
      // Sample projects
      const sampleProjects = [
        {
          name: "Smart Health Monitor",
          description: "A wearable device that monitors vital signs and alerts users of potential health issues.",
          team_members: "Alice, Bob, Charlie",
          table_number: 1,
          is_finalist: false
        },
        {
          name: "EcoTrack",
          description: "An app that helps users reduce their carbon footprint by tracking daily activities.",
          team_members: "David, Emma, Frank",
          table_number: 2,
          is_finalist: false
        },
        {
          name: "StudyBuddy",
          description: "An AI-powered study assistant that helps students prepare for exams.",
          team_members: "Grace, Henry, Ivy",
          table_number: 3,
          is_finalist: false
        },
        {
          name: "FoodShare",
          description: "A platform connecting restaurants with excess food to homeless shelters.",
          team_members: "Jack, Kate, Liam",
          table_number: 4,
          is_finalist: false
        },
        {
          name: "VirtualTour",
          description: "A VR application that allows users to explore museums and historical sites remotely.",
          team_members: "Mike, Nina, Oscar",
          table_number: 5,
          is_finalist: false
        }
      ];
      
      // Add projects to database
      for (const project of sampleProjects) {
        await createProject(project);
      }
      
      // Sample judges
      const sampleJudges = [
        {
          name: "Dr. Smith",
          email: "smith@example.com",
        },
        {
          name: "Prof. Johnson",
          email: "johnson@example.com",
        },
        {
          name: "Ms. Williams",
          email: "williams@example.com",
        }
      ];
      
      // Add judges to database
      for (const judge of sampleJudges) {
        await createJudge(judge);
      }
      
      console.log('Sample data added successfully!');
    } catch (error) {
      console.error('Error adding sample data:', error);
      // Continue even if sample data fails - the schema is created
    }
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Only run if this script is executed directly (not imported)
if (require.main === module) {
  init();
}

export default init; 