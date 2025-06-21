import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nephew Stories - Interactive Tales for Young Readers',
  description: 'Personalized interactive stories for children, crafted from their favorite books',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf9f7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-story-background font-story antialiased">
        {children}
      </body>
    </html>
  )
}