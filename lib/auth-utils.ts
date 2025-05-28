import { cookies } from "next/headers"
import type { User } from "@/context/auth-context"

export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) {
      return null
    }

    return JSON.parse(userCookie.value)
  } catch (error) {
    console.error("Error getting server user:", error)
    return null
  }
}

export function validateUserRole(user: User | null, allowedRoles: string[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}
