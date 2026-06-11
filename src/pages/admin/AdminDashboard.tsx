import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Newspaper, 
  Users, 
  MessageSquare, 
  Eye, 
  Mail, 
  Sparkles, 
  Clock, 
  Plus, 
  ExternalLink,
  Flame,
  Smile,
  HelpCircle,
  Megaphone
} from 'lucide-react';
import { useArticleStore } from '../../store/articleStore';
import { useCommentStore } from '../../store/commentStore';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { useNotificationStore } from '../../store/notificationStore';
import MiniChart from '../../components/admin/MiniChart';

export const AdminDashboard: React.FC = () => {
  const { articles, fetchAllArticles, isLoading: articlesLoading } = useArticleStore();
  const { pendingComments, fetchPendingComments, isLoading: commentsLoading } = useCommentStore();
  const { overview, popularArticles, fetchAnalytics, isLoading: analyticsLoading } = useAnalyticsStore();
  const { notifications, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchAllArticles();
    fetchPendingComments();
    fetchAnalytics();
    fetchNotifications();
  }, [fetchAllArticles, fetchPendingComments, fetchAnalytics, fetchNotifications]);

  const draftCount = articles.filter(a => a.status === 'draft').length;
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const scheduledCount = articles.filter(a => a.status === 'scheduled').length;

  const quickStats = [
    {
      title: 'Total Page Views',
      value: overview.totalViews.toLocaleString(),
      trend: `+${overview.totalViewsTrend}%`,
      trendType: 'up',
      chartData: [45, 60, 55, 70, 65, 80, 95],
      icon: Eye,
      color: '#3B82F6', // Blue
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Published Articles',
      value: publishedCount,
      trend: `${scheduledCount} Scheduled`,
      trendType: 'neutral',
      chartData: [2, 5, 3, 6, 8, 12, 15],
      icon: Newspaper,
      color: '#EF4444', // Red
      bgColor: 'bg-red-500/10'
    },
    {
      title: 'Pending Moderation',
      value: pendingComments.length,
      trend: pendingComments.length > 0 ? 'Action required' : 'Clear',
      trendType: pendingComments.length > 0 ? 'down' : 'up',
      chartData: [8, 5, 12, 7, 4, 9, pendingComments.length],
      icon: MessageSquare,
      color: '#F59E0B', // Amber
      bgColor: 'bg-amber-500/10'
    },
    {
      title: 'Active Readers',
      value: overview.activeUsers,
      trend: 'Live updates',
      trendType: 'up',
      chartData: [5, 12, 8, 15, 9, 11, overview.activeUsers],
      icon: Users,
      color: '#10B981', // Emerald
      bgColor: 'bg-emerald-500/10'
    }
  ];

  const quickActions = [
    { label: 'New Article', path: '/admin/articles/new', icon: Plus, color: 'bg-red-600 hover:bg-red-700' },
    { label: 'Weekend Whisper', path: '/admin/whispers', icon: Flame, color: 'bg-amber-600 hover:bg-amber-700' },
    { label: 'Joke/Trivia', path: '/admin/jokes-trivia', icon: Smile, color: 'bg-pink-600 hover:bg-pink-700' },
    { label: 'Create Poll', path: '/admin/polls', icon: HelpCircle, color: 'bg-blue-600 hover:bg-blue-700' }
  ];

  return (
    <>
      <Helmet>
        <title>CMS Dashboard | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
              Dashboard Overview <Sparkles className="text-red-500 ml-2 animate-pulse" size={24} />
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">
              Real-time summary of Dunkrow's editorial operations, newsletter campaigns, and analytics.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {quickActions.map((act, idx) => (
              <Link key={idx} to={act.path}>
                <button className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-900 dark:text-white transition-all active:scale-95 shadow-lg ${act.color}`}>
                  <act.icon size={14} />
                  <span>{act.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="bg-white dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-300 dark:border-neutral-700 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className={`p-2 rounded-xl ${stat.bgColor} text-gray-900 dark:text-white`}>
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {stat.value}
                  </h3>
                  <span className={`text-xs font-semibold ${
                    stat.trendType === 'up' ? 'text-green-500' :
                    stat.trendType === 'down' ? 'text-red-500' : 'text-gray-500 dark:text-neutral-400'
                  }`}>
                    {stat.trend}
                  </span>
                </div>

                {/* Sparkline mini chart */}
                <div className="mt-6 flex justify-end h-10 overflow-hidden">
                  <MiniChart data={stat.chartData} color={stat.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns - Popular Articles & Moderation */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top performing content */}
            <div className="bg-white dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    Top Articles This Week <Sparkles size={16} className="text-red-500 ml-1.5" />
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-neutral-500">Ranked by organic search impressions and page views.</p>
                </div>
                <Link to="/admin/analytics" className="text-xs font-semibold text-red-500 hover:text-red-400">
                  View Full Analytics
                </Link>
              </div>

              <div className="divide-y divide-neutral-800">
                {popularArticles.length > 0 ? (
                  popularArticles.map((art, idx) => (
                    <div key={art.id} className="py-3.5 flex items-center justify-between group">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-semibold text-sm text-neutral-200 group-hover:text-gray-900 dark:text-white truncate transition-colors">
                            {art.title}
                          </h4>
                          <div className="flex items-center space-x-3 text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
                            <span className="bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                              {art.category}
                            </span>
                            <span>{art.avgReadTime}s avg. read</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <span className="block text-sm font-bold text-gray-900 dark:text-white">{art.views}</span>
                          <span className="text-[10px] text-gray-400 dark:text-neutral-500">Views</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-bold text-gray-500 dark:text-neutral-400">{art.shares}</span>
                          <span className="text-[10px] text-gray-400 dark:text-neutral-500">Shares</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-gray-400 dark:text-neutral-500 text-xs">No analytics data recorded yet</p>
                )}
              </div>
            </div>

            {/* Comments needing approval */}
            <div className="bg-white dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    Pending Moderation Queue <Clock size={16} className="text-amber-500 ml-1.5" />
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-neutral-500">Approve comments before they are visible on the website.</p>
                </div>
                <Link to="/admin/comments" className="text-xs font-semibold text-red-500 hover:text-red-400">
                  Manage Moderation
                </Link>
              </div>

              <div className="divide-y divide-neutral-800">
                {pendingComments.length > 0 ? (
                  pendingComments.slice(0, 4).map((comment) => (
                    <div key={comment.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-neutral-200">{comment.username}</span>
                          <span className="text-neutral-600 text-xs">•</span>
                          <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium truncate max-w-[200px]" title={comment.articleTitle}>
                            On: {comment.articleTitle}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-neutral-300 text-xs italic line-clamp-2 pr-6">
                          "{comment.content}"
                        </p>
                      </div>
                      <Link to="/admin/comments">
                        <button className="self-start sm:self-center px-3 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 hover:bg-neutral-700 text-xs font-bold transition-all text-neutral-200">
                          Moderate
                        </button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-gray-400 dark:text-neutral-500 text-xs">Comments queue is fully moderated. Good job!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Live activity and stats */}
          <div className="space-y-8">
            {/* Live activity log */}
            <div className="bg-white dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Real-time System Logs
              </h2>
              
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[380px] pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
                {notifications.slice(0, 8).map((notif) => (
                  <div key={notif.id} className="flex space-x-3 text-xs leading-relaxed group">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 dark:text-neutral-400 font-semibold">{notif.title}: </span>
                      <span className="text-gray-700 dark:text-neutral-300">{notif.message}</span>
                      <span className="text-[10px] text-neutral-600 block mt-0.5">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-gray-400 dark:text-neutral-500 text-xs py-8">No recent activity logs</p>
                )}
              </div>
            </div>

            {/* Dynamic editorial ratio */}
            <div className="bg-white dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Editorial Pipeline
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-1.5">
                    <span>Drafts in Progress</span>
                    <span>{draftCount} articles</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-500 h-full transition-all duration-500" 
                      style={{ width: `${(draftCount / Math.max(articles.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-1.5">
                    <span>Scheduled to Publish</span>
                    <span>{scheduledCount} articles</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-500" 
                      style={{ width: `${(scheduledCount / Math.max(articles.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-1.5">
                    <span>Published Articles</span>
                    <span>{publishedCount} articles</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all duration-500" 
                      style={{ width: `${(publishedCount / Math.max(articles.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;