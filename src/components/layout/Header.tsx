import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/courses') && !path.includes('/materials') && !path.includes('/chats')) return 'Courses';
    if (path.includes('/materials')) return 'Course Materials';
    if (path.includes('/chats') && path.includes('/threadId')) return 'Chat Thread';
    if (path.includes('/chats')) return 'Chat Threads';
    if (path.includes('/approvals')) return 'Pending Approvals';
    
    return 'EduConnect LMS';
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Mobile menu button */}
        <button 
          className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        {/* Page title */}
        <h1 className="text-lg font-semibold text-neutral-900 md:block">
          {getPageTitle()}
        </h1>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <button
              className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>
            
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-dropdown border border-neutral-200 p-2 animate-fade-in">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            )}
          </div>
          
          {/* Notifications */}
          <button className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full"></span>
          </button>
          
          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium text-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase()
                )}
              </div>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-dropdown border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="p-3 border-b border-neutral-200">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
                <div className="mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md"
                  onClick={() => navigate('/profile')}
                >
                  Profile Settings
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-error-600 hover:bg-neutral-100 rounded-md"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;