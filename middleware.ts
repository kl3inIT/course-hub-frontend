import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  "/admin": ["admin"],
  "/manager": ["manager", "admin"],
  "/create-course": ["manager", "admin"],
  "/profile/edit": ["learner", "manager", "admin"],
  "/profile/create": ["learner", "manager", "admin"],
} as const

// Routes that require authentication but no specific role
const AUTH_REQUIRED_ROUTES = ["/dashboard", "/profile", "/learn"] as const

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/courses",
  "/about",
  "/contact",
  "/reset-password",
  "/verify-otp",
  "/setup-2fa",
  "/verify-phone",
  "/otp-demo",
] as const

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get user data from cookie or header (in a real app, this would be from JWT)
  const userCookie = request.cookies.get("user")?.value
  let user = null

  if (userCookie) {
    try {
      user = JSON.parse(userCookie)
    } catch (error) {
      console.error("Error parsing user cookie:", error)
    }
  }

  // Check if route is public
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check protected routes
  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to unauthorized page
        const unauthorizedUrl = new URL("/unauthorized", request.url)
        unauthorizedUrl.searchParams.set("requiredRole", allowedRoles.join(" or "))
        unauthorizedUrl.searchParams.set("currentRole", user.role)
        return NextResponse.redirect(unauthorizedUrl)
      }
    }
  }

  // Check auth required routes
  if (AUTH_REQUIRED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("returnUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
