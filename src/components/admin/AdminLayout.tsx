import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center text-gray-900 dark:text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500 mr-3"></div>
        <span>Loading Admin Workspace...</span>
      </div>
    );
  }

  // Double check authorization: role must be admin, editor, reporter, or contributor
  const isAuthorized = user && ['admin', 'editor', 'reporter', 'contributor'].includes(user.role);

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-800 dark:text-neutral-100 flex">
      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Workspace Wrapper */}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ paddingLeft: collapsed ? '80px' : '256px' }}
      >
        {/* Top bar */}
        <AdminTopBar sidebarCollapsed={collapsed} setSidebarCollapsed={setCollapsed} />

        {/* Content Area */}
        <main className="flex-1 pt-20 pb-12 px-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
