import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Plus, 
  Globe, 
  User, 
  Newspaper, 
  Flame, 
  HelpCircle,
  Menu,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationStore } from '../../store/notificationStore';

interface AdminTopBarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, subscribeNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = subscribeNotifications();
    return () => unsubscribe();
  }, [fetchNotifications, subscribeNotifications]);

  // Convert pathname to breadcrumbs
  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const url = `/${parts.slice(0, index + 1).join('/')}`;
      const isLast = index === parts.length - 1;
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');

      return (
        <span key={url} className="flex items-center text-sm font-medium">
          <span className="mx-2 text-neutral-600">/</span>
          {isLast ? (
            <span className="text-gray-500 dark:text-neutral-400 capitalize">{label}</span>
          ) : (
            <Link to={url} className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white capitalize transition-colors">
              {label}
            </Link>
          )}
        </span>
      );
    });
  };

  return (
    <header className="fixed top-0 right-0 z-30 h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white flex items-center justify-between px-6 transition-all duration-300 left-0 md:left-auto"
      style={{ left: sidebarCollapsed ? '80px' : '256px' }}
    >
      {/* Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white md:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center">
          <Link to="/admin" className="text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white transition-colors text-sm font-medium">
            Admin
          </Link>
          {getBreadcrumbs()}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-4">
        {/* View Site */}
        <Link 
          to="/"
          target="_blank"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 hover:bg-neutral-700 hover:text-gray-900 dark:text-white transition-all text-gray-700 dark:text-neutral-300"
          title="Visit Live Site"
        >
          <Globe size={14} />
          <span className="hidden md:inline">View Site</span>
        </Link>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            onBlur={() => setTimeout(() => setShowQuickCreate(false), 200)}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-gray-900 dark:text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-red-950/20"
          >
            <Plus size={14} />
            <span>Create</span>
          </button>
          
          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-2xl py-1 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
              <Link 
                to="/admin/articles/new"
                className="flex items-center space-x-2.5 px-4 py-2 hover:bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:text-white"
              >
                <Newspaper size={16} className="text-red-500" />
                <span>New Article</span>
              </Link>
              <Link 
                to="/admin/whispers"
                className="flex items-center space-x-2.5 px-4 py-2 hover:bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:text-white"
              >
                <Flame size={16} className="text-amber-500" />
                <span>New Whisper</span>
              </Link>
              <Link 
                to="/admin/polls"
                className="flex items-center space-x-2.5 px-4 py-2 hover:bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:text-white"
              >
                <HelpCircle size={16} className="text-blue-500" />
                <span>New Poll</span>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 text-gray-900 dark:text-white font-bold rounded-full flex items-center justify-center text-[10px] ring-2 ring-neutral-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900/50">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllAsRead()}
                      className="text-xs text-red-500 hover:text-red-400 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-72 overflow-y-auto divide-y divide-neutral-900">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const isUnread = !notif.isRead;
                      return (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            if (isUnread) markAsRead(notif.id);
                          }}
                          className={`p-4 flex space-x-3 hover:bg-white dark:bg-neutral-900 cursor-pointer transition-colors ${
                            isUnread ? 'bg-white dark:bg-neutral-900/30 border-l-2 border-red-500' : ''
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {notif.type === 'comment' && <Newspaper size={16} className="text-blue-400" />}
                            {notif.type === 'publish' && <CheckCircle size={16} className="text-green-400" />}
                            {notif.type === 'alert' && <AlertTriangle size={16} className="text-amber-400" />}
                            {notif.type === 'health' && <AlertTriangle size={16} className="text-red-400" />}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h5 className="font-semibold text-xs text-gray-900 dark:text-white truncate">{notif.title}</h5>
                            <p className="text-gray-500 dark:text-neutral-400 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-neutral-600 block mt-1">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="p-6 text-center text-gray-400 dark:text-neutral-500 text-xs">No notifications yet</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-neutral-800">
          <img 
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=random`} 
            alt="Profile Avatar" 
            className="w-8 h-8 rounded-full border border-gray-300 dark:border-neutral-700 object-cover"
          />
        </div>
      </div>
    </header>
  );
};
