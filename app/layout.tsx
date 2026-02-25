import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'One Thing That Matters',
  description: 'Agent-assisted daily newsletter system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-navy-950 text-cyan-100 antialiased">{children}</body>
    </html>
  )
}
