import type { Metadata } from 'next'
import './globals.css'
import { initDb } from '@/lib/db-init'
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Hackathon Judging',
  description: 'App for judging hackathon projects',
  generator: 'javascript ',
}

// Initialize database on the server
// This will be executed only once during server startup
// async function initDatabase() {
//   try {
//     await initDb();
//   } catch (error) {
//     console.error('Failed to initialize database:', error);
//   }
// }

// // Only run database initialization on the server
// if (typeof window === 'undefined') {
//   initDatabase().catch(console.error);
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>

      <Toaster />

      </body>
      
    </html>
  )
}
