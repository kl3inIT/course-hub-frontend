"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BookOpen, LogOut, Settings, Menu, GraduationCap, Users, Shield } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { RoleBadge } from "@/components/ui/role-badge"

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const getUserLinks = () => {
    if (!user) return []

    const links = []

    // Learner links
    if (user.role === "learner") {
      links.push({ href: "/dashboard", label: "My Learning", show: true })
    }

    // Manager links
    if (user.role === "manager") {
      links.push(
        { href: "/dashboard", label: "My Learning", show: true },
        { href: "/manager", label: "Course Management", show: true },
      )
    }

    // Admin links
    if (user.role === "admin") {
      links.push(
        { href: "/dashboard", label: "My Learning", show: true },
        { href: "/manager", label: "Course Management", show: true },
        { href: "/admin", label: "Admin Panel", show: true },
      )
    }

    return links
  }

  const userLinks = getUserLinks()

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">LearnHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative group ${
                    isActiveLink(link.href) ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                      isActiveLink(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </Link>
              ))}
              {userLinks.map((link) =>
                link.show ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors relative group ${
                      isActiveLink(link.href) ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                        isActiveLink(link.href) ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                ) : null,
              )}
            </div>
          </div>

          {/* Right Side - Auth & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop User Menu */}
            {user ? (
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>
                          {user.name
                            ? user.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                            : user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                        <RoleBadge role={user.role} size="sm" />
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        My Learning
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "manager" && (
                      <DropdownMenuItem asChild>
                        <Link href="/manager">
                          <Users className="mr-2 h-4 w-4" />
                          Course Management
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/manager">
                            <Users className="mr-2 h-4 w-4" />
                            Course Management
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6" />
                      <span className="font-bold text-xl">LearnHub</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {navigationLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`text-lg font-medium transition-colors py-2 ${
                            isActiveLink(link.href) ? "text-primary" : "hover:text-primary"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      {userLinks.map((link) =>
                        link.show ? (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`text-lg font-medium transition-colors py-2 ${
                              isActiveLink(link.href) ? "text-primary" : "hover:text-primary"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ) : null,
                      )}
                    </div>

                    {user ? (
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback>
                              {user.name
                                ? user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                : user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <RoleBadge role={user.role} size="sm" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 text-sm py-2 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Profile
                          </Link>
                          <Button
                            onClick={() => {
                              handleLogout()
                              setIsMobileMenuOpen(false)
                            }}
                            variant="outline"
                            className="justify-start gap-2"
                          >
                            <LogOut className="h-4 w-4" />
                            Log out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4 flex flex-col gap-3">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
