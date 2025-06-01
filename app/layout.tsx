import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VoiceSync - Audio Translation & Dubbing Platform",
  description: "Transform your audio content for global audiences with AI-powered translation and dubbing. Support for 12+ languages with professional quality results.",
  keywords: ["audio translation", "dubbing", "voice sync", "AI translation", "multilingual", "audio localization"],
  authors: [{ name: "VoiceSync Team" }],
  creator: "VoiceSync",
  publisher: "VoiceSync",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://voicesync.app'),
  openGraph: {
    title: "VoiceSync - Audio Translation & Dubbing Platform",
    description: "Transform your audio content for global audiences with AI-powered translation and dubbing.",
    url: 'https://voicesync.app',
    siteName: 'VoiceSync',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VoiceSync - Audio Translation Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoiceSync - Audio Translation & Dubbing Platform',
    description: 'Transform your audio content for global audiences with AI-powered translation and dubbing.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  generator: 'Next.js',
  applicationName: 'VoiceSync',
  referrer: 'origin-when-cross-origin',
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem 
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
