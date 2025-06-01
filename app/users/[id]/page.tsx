"use client"

import UserProfile from "@/components/profile/user-profile"

const hardcodedUser = {
  id: "1",
  name: "Phan Tín",
  username: "tin-phan-1",
  avatar: "https://github.com/shadcn.png",
  joinDate: "2020-03-15",
  enrolledCourses: [
    {
      id: "1",
      title: "App \"Đừng Chạm Tay Lên Mặt\"",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
      progress: 65,
      enrolledStudents: 10885,
      duration: "1h34p",
      isFree: true
    },
    {
      id: "2",
      title: "Làm việc với Terminal & Ubuntu",
      thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=2074&auto=format&fit=crop",
      progress: 45,
      enrolledStudents: 20684,
      duration: "4h59p",
      isFree: true
    },
    {
      id: "3",
      title: "Xây Dựng Website với ReactJS",
      thumbnail: "https://images.unsplash.com/photo-1648737963540-306235c8170e?q=80&w=2070&auto=format&fit=crop",
      progress: 30,
      enrolledStudents: 75774,
      duration: "27h32p",
      isFree: true
    }
  ]
}

export default function UserProfilePage() {
  return (
    <div>
      <UserProfile />
    </div>
  )
}