import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private baseURL: string = 'http://localhost:5000';
  
  connect(token: string): void {
    this.socket = io(this.baseURL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      autoConnect: true,
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
  
  joinCourse(courseId: string): void {
    if (this.socket) {
      this.socket.emit('joinCourse', { courseId });
    }
  }
  
  leaveCourse(courseId: string): void {
    if (this.socket) {
      this.socket.emit('leaveCourse', { courseId });
    }
  }
  
  joinThread(threadId: string): void {
    if (this.socket) {
      this.socket.emit('joinThread', { threadId });
    }
  }
  
  leaveThread(threadId: string): void {
    if (this.socket) {
      this.socket.emit('leaveThread', { threadId });
    }
  }
  
  onNewMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }
  
  onMessageApproved(callback: (messageId: string) => void): void {
    if (this.socket) {
      this.socket.on('messageApproved', callback);
    }
  }
  
  offNewMessage(): void {
    if (this.socket) {
      this.socket.off('newMessage');
    }
  }
  
  offMessageApproved(): void {
    if (this.socket) {
      this.socket.off('messageApproved');
    }
  }
  
  sendMessage(message: Omit<Message, '_id' | 'user' | 'createdAt'>): void {
    if (this.socket) {
      this.socket.emit('sendMessage', message);
    }
  }
}

export const socketService = new SocketService();