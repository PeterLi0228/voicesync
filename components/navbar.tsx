"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Headphones } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-6 w-6 text-primary" />
          <Link href="/" className="text-xl font-bold">
            VoiceSync
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-foreground/60",
            )}
          >
            Home
          </Link>
          <Link
            href="/upload"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/upload" ? "text-primary" : "text-foreground/60",
            )}
          >
            Upload
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
          >
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button asChild>
            <Link href="/upload">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
