export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'professor';
  avatar?: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  code: string;
  professor: User;
  students: User[];
  createdAt: string;
}

export interface Material {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  courseId: string;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Message {
  _id: string;
  threadId: string;
  courseId: string;
  userId: string;
  user: User;
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: string;
  role: 'student' | 'professor' | 'ai';
  replyTo?: string;
  approved?: boolean;
}

export interface Thread {
  _id: string;
  title: string;
  courseId: string;
  createdBy: User;
  createdAt: string;
  lastMessageAt: string;
  messagesCount: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'professor';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}