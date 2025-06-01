export interface ResponseGeneral<T> {
  message: string;
  data: T;
  status: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  avatar?: string;
  joinDate?: string;
  enrolledCourses?: number;
  permissions?: string[];
}