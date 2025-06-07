import { httpClient } from "@/api/http-client"
import { ApiResponse, Page } from "@/types/common"
import { 
  User, 
  UserDetail, 
  ProfileData, 
  CreateManagerRequest,
  UserSearchParams 
} from "@/types/user"

export const userApi = {
  // Get user's own profile info
  getMyInfo: async (): Promise<ApiResponse<ProfileData>> => {
    const response = await httpClient.get("/users/myInfo")
    return response.data
  },

  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<ApiResponse<UserDetail>> => {
    const response = await httpClient.get(`/users/profile/${userId}`)
    return response.data
  },

  // Get user detail by ID (admin/manager only)
  getUserDetail: async (userId: string): Promise<ApiResponse<UserDetail>> => {
    const response = await httpClient.get(`/admin/users/${userId}/detail`)
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData: FormData): Promise<ApiResponse<ProfileData>> => {
    const response = await httpClient.put("/users/profile", profileData)
    return response.data
  },

  // Upload avatar
  uploadAvatar: async (avatarFile: FormData): Promise<ApiResponse<{ avatar: string }>> => {
    const response = await httpClient.post("/users/avatar", avatarFile)
    return response.data
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await httpClient.put("/users/change-password", {
      currentPassword,
      newPassword
    })
    return response.data
  },

  // Admin APIs
  admin: {
    // Get all users with pagination and filters
    getUsers: async (params: UserSearchParams): Promise<ApiResponse<Page<User>>> => {
      const response = await httpClient.get("/admin/users", { params })
      return response.data
    },

    // Create new manager
    createManager: async (data: CreateManagerRequest): Promise<ApiResponse<User>> => {
      const response = await httpClient.post("/admin/users", data)
      return response.data
    },

    // Update user status
    updateUserStatus: async (userId: string, status: "active" | "banned"): Promise<ApiResponse<void>> => {
      const response = await httpClient.put(`/admin/users/${userId}/status`, null, {
        params: { status }
      })
      return response.data
    },

    // Delete user (manager only)
    deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
      const response = await httpClient.delete(`/admin/users/${userId}`)
      return response.data
    }
  }
} 