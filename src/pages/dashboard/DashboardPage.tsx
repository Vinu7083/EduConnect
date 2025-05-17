import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, FileText, Users, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import { Course, Thread, Material } from '../../types';
import { ApiResponse } from '../../types';

const DashboardPage = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesResponse, threadsResponse, materialsResponse] = await Promise.all([
          api.get<ApiResponse<Course[]>>('/courses'),
          api.get<ApiResponse<Thread[]>>('/threads/recent'),
          api.get<ApiResponse<Material[]>>('/materials/recent'),
        ]);
        
        if (coursesResponse.data?.data) {
          setCourses(coursesResponse.data.data);
        }
        
        if (threadsResponse.data?.data) {
          setRecentThreads(threadsResponse.data.data);
        }
        
        if (materialsResponse.data?.data) {
          setRecentMaterials(materialsResponse.data.data);
        }
        
        // Fetch pending approvals for professors
        if (user?.role === 'professor') {
          const approvalsResponse = await api.get<ApiResponse<{ count: number }>>('/ai/pending/count');
          if (approvalsResponse.data?.data) {
            setPendingApprovals(approvalsResponse.data.data.count);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, showError]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-primary-100 mb-6">
          {user?.role === 'professor'
            ? 'Manage your courses, materials, and student interactions.'
            : 'Access your courses, materials, and communicate with professors.'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">My Courses</p>
                <p className="text-2xl font-semibold">{courses.length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <BookOpen size={24} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Recent Discussions</p>
                <p className="text-2xl font-semibold">{recentThreads.length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <MessageSquare size={24} className="text-white" />
              </div>
            </div>
          </div>
          
          {user?.role === 'professor' ? (
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Pending Approvals</p>
                  <p className="text-2xl font-semibold">{pendingApprovals}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Clock size={24} className="text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">New Materials</p>
                  <p className="text-2xl font-semibold">{recentMaterials.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <FileText size={24} className="text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Courses section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Courses</h2>
          <Link to="/courses" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>
        
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-primary-100 rounded-full">
                <BookOpen size={24} className="text-primary-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
            <p className="text-neutral-600 mb-4">
              {user?.role === 'professor'
                ? 'Start by creating your first course'
                : 'Enroll in courses to get started'}
            </p>
            <Link
              to="/courses"
              className="btn btn-primary"
            >
              {user?.role === 'professor' ? 'Create Course' : 'Browse Courses'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="bg-white rounded-lg shadow-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-xs font-medium">
                    {course.code}
                  </div>
                  {course.professor._id === user?._id && (
                    <div className="bg-accent-100 text-accent-800 rounded-full px-3 py-1 text-xs font-medium">
                      Instructor
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center text-sm text-neutral-500">
                  <Users size={16} className="mr-1" />
                  {course.students.length} students
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Recent activity section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent discussions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Discussions</h2>
          </div>
          
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            {recentThreads.length === 0 ? (
              <div className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-primary-100 rounded-full">
                    <MessageSquare size={24} className="text-primary-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
                <p className="text-neutral-600">
                  Start a new discussion in one of your courses
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {recentThreads.map((thread) => (
                  <Link
                    key={thread._id}
                    to={`/courses/${thread.courseId}/chats/${thread._id}`}
                    className="block p-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium">{thread.title}</h3>
                      <span className="text-xs text-neutral-500">
                        {new Date(thread.lastMessageAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-2">
                      Started by {thread.createdBy.name}
                    </p>
                    <div className="flex items-center text-xs">
                      <MessageSquare size={12} className="mr-1 text-neutral-400" />
                      <span className="text-neutral-500">
                        {thread.messagesCount} {thread.messagesCount === 1 ? 'message' : 'messages'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Recent materials */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Materials</h2>
          </div>
          
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            {recentMaterials.length === 0 ? (
              <div className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-primary-100 rounded-full">
                    <FileText size={24} className="text-primary-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No materials yet</h3>
                <p className="text-neutral-600">
                  {user?.role === 'professor'
                    ? 'Upload course materials for your students'
                    : 'No materials have been added to your courses yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {recentMaterials.map((material) => (
                  <a
                    key={material._id}
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium">{material.title}</h3>
                      <span className="text-xs text-neutral-500">
                        {new Date(material.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2 line-clamp-1">
                      {material.description}
                    </p>
                    <div className="flex items-center text-xs">
                      <FileText size={12} className="mr-1 text-neutral-400" />
                      <span className="text-neutral-500">
                        Uploaded by {material.uploadedBy.name}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Pending approvals for professors */}
      {user?.role === 'professor' && pendingApprovals > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-full mr-3">
                <Clock size={20} className="text-warning-600" />
              </div>
              <div>
                <h3 className="font-semibold text-warning-800">
                  Pending AI Responses
                </h3>
                <p className="text-sm text-warning-700">
                  You have {pendingApprovals} AI responses awaiting your approval
                </p>
              </div>
            </div>
            <Link to="/approvals" className="btn btn-primary">
              Review Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;