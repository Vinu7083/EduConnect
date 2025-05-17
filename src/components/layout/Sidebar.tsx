import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageSquare, FileText, CheckSquare, Users, Settings, GraduationCap as Graduation } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isProfessor = user?.role === 'professor';
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      enabled: true,
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: <BookOpen size={20} />,
      enabled: true,
    },
    {
      name: 'Materials',
      path: '/courses/:courseId/materials',
      icon: <FileText size={20} />,
      enabled: location.pathname.includes('/courses/') && location.pathname.includes('/courseId/'),
    },
    {
      name: 'Chat Threads',
      path: '/courses/:courseId/chats',
      icon: <MessageSquare size={20} />,
      enabled: location.pathname.includes('/courses/') && location.pathname.includes('/courseId/'),
    },
    {
      name: 'Pending Approvals',
      path: '/approvals',
      icon: <CheckSquare size={20} />,
      enabled: isProfessor,
    },
    {
      name: 'Students',
      path: '/students',
      icon: <Users size={20} />,
      enabled: isProfessor,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings size={20} />,
      enabled: true,
    },
  ].filter(item => item.enabled);
  
  return (
    <div className="bg-white border-r border-neutral-200 w-64 hidden md:flex flex-col h-screen sticky top-0">
      {/* Logo and App Name */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white">
            <Graduation size={20} />
          </div>
          <span className="font-bold text-xl">EduConnect</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    {
                      'bg-primary-50 text-primary-700': isActive,
                      'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900': !isActive,
                    }
                  )
                }
                end
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User info */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium text-sm overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;