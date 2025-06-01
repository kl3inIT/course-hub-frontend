"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns";
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Search,
  MoreHorizontal,
  Trash2,
  Users,
  GraduationCap,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react"
import { RoleBadge } from "@/components/ui/role-badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { ResponseGeneral, Page, User } from "@/types/User"

const BACKEND_URL = "http://localhost:8080"

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10
  })
  const { toast } = useToast()
  const { getToken } = useAuth()
  const router = useRouter()

  // Xử lý thay đổi role và status
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 0 // Reset về trang đầu tiên khi thay đổi bộ lọc
    }))
    fetchUsers()
  }, [selectedRole, selectedStatus])

  // Xử lý thay đổi trang và kích thước trang
  useEffect(() => {
    fetchUsers()
  }, [pagination.currentPage, pagination.pageSize])

  const fetchUsers = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Error",
          description: "No auth token",
          variant: "destructive",
        });
        return;
      }

      const queryParams = new URLSearchParams({
        pageSize: pagination.pageSize.toString(),
        pageNo: pagination.currentPage.toString(),
        role: selectedRole !== "all" ? selectedRole : "",
        status: selectedStatus !== "all" ? selectedStatus : "",
      })

      const response = await fetch(`${BACKEND_URL}/api/admin/users?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch users")
      }

      const responseData: ResponseGeneral<Page<User>> = await response.json()

      if (responseData.status === "error") {
        throw new Error(responseData.message)
      }

      const data = responseData.data
      setUsers(data.content || [])
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }))
    } catch (error: any) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
      setUsers([])
      setPagination(prev => ({
        ...prev,
        totalElements: 0,
        totalPages: 0
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Lọc users theo searchTerm trên frontend
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }) : [];

  // Cập nhật lại số trang dựa trên kết quả tìm kiếm
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalElements: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / prev.pageSize)
    }));
  }, [filteredUsers.length, pagination.pageSize]);

  const getCurrentPageUsers = () => {
    const start = pagination.currentPage * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredUsers.slice(start, end);
  };

  const displayedUsers = getCurrentPageUsers();

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }))
  }

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 0
    }))
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      // Tìm user cần xóa trong state
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) {
        throw new Error("User not found");
      }

      // Kiểm tra nếu user có khóa học đã đăng ký
      if (userToDelete.enrolledCourses && userToDelete.enrolledCourses > 0) {
        toast({
          title: "Cannot Delete User",
          description: "User has enrolled courses and cannot be deleted",
          variant: "destructive",
        });
        return; // Dừng việc xóa nếu user có khóa học
      }

      const token = getToken()
      if (!token) {
        toast({
          title: "Error",
          description: "No auth token",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })

      let responseData
      try {
        const textResponse = await response.text()
        responseData = JSON.parse(textResponse)
      } catch (parseError) {
        toast({
          title: "Error",
          description: "Failed to parse server response",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        toast({
          title: "Cannot Delete User",
          description: responseData.detail || responseData.message || "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      // Chỉ xóa user khỏi state nếu API call thành công
      setUsers(users.filter((u) => u.id !== userId))
      
      toast({
        description: responseData.message || "User deleted successfully",
      })

      // Refresh danh sách users sau khi xóa
      fetchUsers()
    } catch (error: any) {
      console.error("Error in handleDeleteUser:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No auth token")
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({ status: newStatus }),
      })

      const responseData: ResponseGeneral<void> = await response.json()

      if (responseData.status === "error" || !response.ok) {
        throw new Error(responseData.message || "Failed to update user status")
      }

      setUsers(users.map((u) => 
        u.id === userId ? { ...u, status: newStatus as "active" | "inactive" } : u
      ))
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No auth token")
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({ role: newRole }),
      })

      const responseData: ResponseGeneral<void> = await response.json()

      if (responseData.status === "error" || !response.ok) {
        throw new Error(responseData.message || "Failed to update user role")
      }

      setUsers(users.map((u) => 
        u.id === userId ? { ...u, role: newRole } : u
      ))
    } catch (error: any) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const getUserStats = () => {
    const total = users?.length || 0
    const active = users?.filter((u) => u.status === "active").length || 0
    const inactive = users?.filter((u) => u.status === "inactive").length || 0
    const managers = users?.filter((u) => u.role === "manager").length || 0
    const learners = users?.filter((u) => u.role === "learner").length || 0

    return { total, active, inactive, managers, learners }
  }

  const stats = getUserStats()

  const canDeleteUser = (user: User): boolean => {
    return !user.enrolledCourses || user.enrolledCourses === 0;
  }

  return (
    <div className="space-y-6">
      <Toaster />
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.managers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learners</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.learners}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select 
              value={selectedRole} 
              onValueChange={(value) => {
                setSelectedRole(value)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="learner">Learner</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={selectedStatus} 
              onValueChange={(value) => {
                setSelectedStatus(value)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Enrolled Courses</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg?height=32&width=32"} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={async (newRole) => {
                        await handleUpdateUserRole(user.id, newRole)
                      }}
                    >
                      <SelectTrigger className="p-0 h-auto w-auto border-0 bg-transparent hover:bg-accent hover:text-accent-foreground [&>span]:flex [&>span]:items-center">
                        <SelectValue>
                          <RoleBadge role={user.role} />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">
                          <RoleBadge role="manager" />
                        </SelectItem>
                        <SelectItem value="learner">
                          <RoleBadge role="learner" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.status}
                      onValueChange={async (newStatus) => {
                        await handleUpdateUserStatus(user.id, newStatus)
                      }}
                    >
                      <SelectTrigger className="p-0 h-auto w-auto border-0 bg-transparent hover:bg-accent hover:text-accent-foreground [&>span]:flex [&>span]:items-center">
                        <SelectValue>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <Badge variant="default">Active</Badge>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <Badge variant="destructive">Inactive</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.joinDate ? format(new Date(user.joinDate), "yyyy-MM-dd") : "-"}
                  </TableCell>
                  <TableCell>
                    {user.enrolledCourses || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()} 
                              className={canDeleteUser(user)
                                ? "text-red-600 cursor-pointer"
                                : "text-muted cursor-not-allowed"
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {canDeleteUser(user)
                                ? "Delete User"
                                : "Cannot Delete - Has Courses"
                              }
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user account
                                and remove all associated data from our servers.
                                <br /><br />
                                <span className="font-medium text-destructive">
                                  Important: Users who have enrolled in courses cannot be deleted.
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={!canDeleteUser(user)}
                              >
                                {canDeleteUser(user)
                                  ? "Delete Permanently"
                                  : "Cannot Delete - Has Enrolled Courses"
                                }
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {filteredUsers.length > 0 ? (
                `Showing ${pagination.currentPage * pagination.pageSize + 1} to ${Math.min(
                  (pagination.currentPage + 1) * pagination.pageSize,
                  filteredUsers.length
                )} of ${filteredUsers.length} users`
              ) : (
                "No users found"
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0 || filteredUsers.length === 0}
              >
                Previous
              </Button>
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-center text-sm font-medium">
                  Page {pagination.currentPage + 1} of {pagination.totalPages}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1 || filteredUsers.length === 0}
              >
                Next
              </Button>
              <Select 
                value={pagination.pageSize.toString()} 
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 / page</SelectItem>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
