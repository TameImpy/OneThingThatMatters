import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'One Thing That Matters',
  description: 'One signal in AI. Monday to Friday. Every Angle.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-navy-950 text-cyan-100 antialiased">{children}</body>
    </html>
  )
}
