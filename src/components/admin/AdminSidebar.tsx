import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Newspaper, 
  Flame, 
  Smile, 
  HelpCircle, 
  FolderOpen, 
  Users, 
  MessageSquare, 
  Layers, 
  Sliders, 
  Megaphone, 
  BarChart3, 
  Globe, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'Content Management',
      items: [
        { path: '/admin/articles', label: 'Articles', icon: Newspaper },
        { path: '/admin/whispers', label: 'Whispers', icon: Flame },
        { path: '/admin/jokes-trivia', label: 'Jokes & Trivia', icon: Smile },
        { path: '/admin/polls', label: 'Polls', icon: HelpCircle }
      ]
    },
    {
      title: 'Design & Structure',
      items: [
        { path: '/admin/sections', label: 'Sections', icon: Layers },
        { path: '/admin/homepage', label: 'Homepage', icon: Sliders },
        { path: '/admin/media', label: 'Media Library', icon: FolderOpen }
      ]
    },
    {
      title: 'User & Feedback',
      items: [
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/comments', label: 'Comments', icon: MessageSquare },
        { path: '/admin/newsletter', label: 'Newsletter', icon: Mail }
      ]
    },
    {
      title: 'Growth & Settings',
      items: [
        { path: '/admin/ads', label: 'Advertisements', icon: Megaphone },
        { path: '/admin/seo', label: 'SEO Settings', icon: Globe }
      ]
    }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen bg-gray-50 dark:bg-neutral-950 border-r border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-neutral-800">
        <Link to="/" className="flex items-center space-x-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-red-900/50 flex-shrink-0">
            D
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-lg tracking-tight whitespace-nowrap"
            >
              Dunkrow <span className="text-red-500 font-medium text-xs border border-red-500/30 px-1.5 py-0.5 rounded ml-1 bg-red-500/10">CMS</span>
            </motion.div>
          )}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/admin' && location.pathname.startsWith(item.path));
                
                return (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-red-600 text-gray-900 dark:text-white font-medium shadow-md shadow-red-900/20' 
                            : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white hover:bg-white dark:bg-neutral-900'
                        }`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={20} className={isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-neutral-400 group-hover:text-gray-900 dark:text-white'} />
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <img 
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=random`} 
            alt="Admin Avatar" 
            className="w-10 h-10 rounded-full border border-gray-300 dark:border-neutral-700 object-cover flex-shrink-0"
          />
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-left overflow-hidden"
            >
              <h4 className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                {user?.username}
              </h4>
              <p className="text-xs text-gray-400 dark:text-neutral-500 capitalize truncate">
                {user?.role}
              </p>
            </motion.div>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-red-500 transition-colors"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};
