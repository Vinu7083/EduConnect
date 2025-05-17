import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { socketService } from '../../services/socket';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { isAuthenticated, token } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket server
      socketService.connect(token);
      
      return () => {
        // Disconnect from socket server on unmount
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, token]);
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        
        <footer className="py-4 px-6 text-center border-t border-neutral-200 text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} EduConnect LMS. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;