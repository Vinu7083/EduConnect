import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Paperclip, Image, Bot } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { socketService } from '../../services/socket';
import { api } from '../../services/api';
import { Message, Thread, Course } from '../../types';
import MessageItem from '../../components/chat/MessageItem';
import { ApiResponse } from '../../types';

const ChatThreadPage = () => {
  const { courseId, threadId } = useParams<{ courseId: string; threadId: string }>();
  const { user } = useAuth();
  const { showError } = useToast();
  
  const [thread, setThread] = useState<Thread | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [askingAI, setAskingAI] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch thread data and messages
  useEffect(() => {
    if (!threadId || !courseId) return;
    
    const fetchThreadData = async () => {
      try {
        const [threadResponse, courseResponse, messagesResponse] = await Promise.all([
          api.get<ApiResponse<Thread>>(`/threads/${threadId}`),
          api.get<ApiResponse<Course>>(`/courses/${courseId}`),
          api.get<ApiResponse<Message[]>>(`/messages?threadId=${threadId}`),
        ]);
        
        if (threadResponse.data?.data) {
          setThread(threadResponse.data.data);
        }
        
        if (courseResponse.data?.data) {
          setCourse(courseResponse.data.data);
        }
        
        if (messagesResponse.data?.data) {
          setMessages(messagesResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching thread data:', error);
        showError('Failed to load the thread data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchThreadData();
  }, [threadId, courseId, showError]);
  
  // Socket.io setup
  useEffect(() => {
    if (!threadId) return;
    
    // Join the thread room
    socketService.joinThread(threadId);
    
    // Listen for new messages
    socketService.onNewMessage((newMessage) => {
      if (newMessage.threadId === threadId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    
    // Listen for message approvals
    socketService.onMessageApproved((messageId) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, approved: true } : msg
        )
      );
    });
    
    // Cleanup function
    return () => {
      socketService.leaveThread(threadId);
      socketService.offNewMessage();
      socketService.offMessageApproved();
    };
  }, [threadId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && files.length === 0) || !threadId || !courseId || !user) {
      return;
    }
    
    setSending(true);
    
    try {
      if (files.length > 0) {
        // Handle file upload
        const formData = new FormData();
        formData.append('threadId', threadId);
        formData.append('courseId', courseId);
        formData.append('content', message);
        formData.append('role', user.role);
        
        files.forEach((file) => {
          formData.append('files', file);
        });
        
        await api.upload<ApiResponse<Message>>('/messages/upload', formData);
      } else {
        // Send text message via socket
        socketService.sendMessage({
          threadId,
          courseId,
          userId: user._id,
          content: message,
          role: user.role,
        });
      }
      
      // Clear input fields
      setMessage('');
      setFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
    } finally {
      setSending(false);
    }
  };
  
  const handleAskAI = async () => {
    if (!message.trim() || !threadId || !courseId || !user) {
      return;
    }
    
    setAskingAI(true);
    
    try {
      const response = await api.post<ApiResponse<{ message: string }>>('/ai/chat', {
        threadId,
        courseId,
        userId: user._id,
        question: message,
      });
      
      if (response.data?.success) {
        setMessage('');
      } else {
        throw new Error(response.data?.message || 'Failed to ask AI');
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      showError('Failed to ask AI');
    } finally {
      setAskingAI(false);
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-600 font-semibold">Loading chat...</p>
        </div>
      </div>
    );
  }
  
  if (!thread || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-lg text-neutral-600">Thread not found</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-64px-32px-32px)]">
      {/* Thread header */}
      <div className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-neutral-900">{thread.title}</h2>
        <p className="text-sm text-neutral-500">
          Course: {course.title} ({course.code}) • Started by {thread.createdBy.name}
        </p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <MessageSquare size={48} className="mb-2 text-neutral-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem 
              key={msg._id} 
              message={msg} 
              isCurrentUser={msg.userId === user?._id}
              showApprovalStatus={msg.role === 'ai'} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="bg-white border-t border-neutral-200 p-4">
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div 
                key={index}
                className="bg-neutral-100 rounded px-3 py-1 text-sm flex items-center gap-2"
              >
                {file.type.startsWith('image/') ? (
                  <Image size={14} />
                ) : (
                  <Paperclip size={14} />
                )}
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  className="text-neutral-500 hover:text-neutral-700"
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
          
          <button
            type="button"
            onClick={handleFileSelect}
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <Paperclip size={20} />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          
          <button
            type="button"
            onClick={handleAskAI}
            className="p-2 rounded-full text-neutral-500 hover:text-primary-600 hover:bg-primary-50"
            disabled={!message.trim() || asking}
          >
            <Bot size={20} />
          </button>
          
          <button
            type="submit"
            className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
            disabled={(!message.trim() && files.length === 0) || sending}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatThreadPage;