import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import ProvidersAndLayout from '@/components/ProvidersAndLayout'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Site Builder SDK Playground',
  description: 'Site Builder SDK Playground'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProvidersAndLayout>{children}</ProvidersAndLayout>
      </body>
    </html>
  )
}
