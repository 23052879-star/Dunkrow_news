import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  BarChart3, 
  Eye, 
  Users, 
  Clock, 
  Percent, 
  TrendingUp, 
  FileText,
  User
} from 'lucide-react';
import { useAnalyticsStore } from '../../store/analyticsStore';
import Card from '../../components/ui/Card';
import MiniChart from '../../components/admin/MiniChart';

export const AnalyticsDashboard: React.FC = () => {
  const { 
    overview, 
    popularArticles, 
    categoryPerformance, 
    authorPerformance, 
    trafficTrends, 
    isLoading, 
    fetchAnalytics 
  } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const cards = [
    {
      title: 'Gross Page Views',
      value: overview.totalViews.toLocaleString(),
      trend: `+${overview.totalViewsTrend}%`,
      sub: 'vs last 7 days',
      icon: Eye,
      color: '#EF4444',
      bgColor: 'bg-red-500/10',
      chartData: trafficTrends.map(t => t.views)
    },
    {
      title: 'Organic Visitors',
      value: Math.floor(overview.totalViews * 0.73).toLocaleString(),
      trend: '+18.2%',
      sub: 'vs last 7 days',
      icon: Users,
      color: '#3B82F6',
      bgColor: 'bg-blue-500/10',
      chartData: trafficTrends.map(t => t.visitors)
    },
    {
      title: 'Avg. Retention Time',
      value: `${Math.floor(overview.avgReadTime / 60)}m ${overview.avgReadTime % 60}s`,
      trend: `+${overview.avgReadTimeTrend}%`,
      sub: 'Read time per article',
      icon: Clock,
      color: '#10B981',
      bgColor: 'bg-emerald-500/10',
      chartData: [120, 132, 125, 140, 138, 142, overview.avgReadTime]
    },
    {
      title: 'Bounce Rate',
      value: `${overview.bounceRate}%`,
      trend: '-2.4%',
      sub: 'Exit single page rates',
      icon: Percent,
      color: '#F59E0B',
      bgColor: 'bg-amber-500/10',
      chartData: [42, 45, 41, 39, 43, 40, overview.bounceRate]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Audience Analytics | Dunkrow CMS</title>
      </Helmet>

      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-neutral-800 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
            Traffic & Audience Analytics <BarChart3 className="text-red-500 ml-2" size={22} />
          </h1>
          <p className="text-gray-400 dark:text-neutral-500 text-xs mt-0.5">
            Monitor article views, reader retention, category performance and individual author achievements.
          </p>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
            <span className="text-gray-400 dark:text-neutral-500 text-xs font-semibold">Generating metrics ledger...</span>
          </div>
        ) : (
          <>
            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <Card key={idx} className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 p-5 flex flex-col justify-between group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">{card.title}</span>
                      <div className={`p-2 rounded-xl ${card.bgColor} text-gray-900 dark:text-white`}>
                        <Icon size={16} style={{ color: card.color }} />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-baseline space-x-2">
                      <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{card.value}</h3>
                      <span className="text-xs font-bold text-green-500 flex items-center">
                        <TrendingUp size={12} className="mr-0.5" />
                        {card.trend}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-600 font-semibold block mt-0.5">{card.sub}</span>

                    {/* Sparkline */}
                    <div className="mt-6 flex justify-end h-10 overflow-hidden">
                      <MiniChart data={card.chartData.length ? card.chartData : [10, 20, 15, 30]} color={card.color} />
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Traffic trend chart */}
            <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Traffic Trends (Past 7 Days)</h3>
              <div className="h-64 flex items-end justify-between gap-2 overflow-x-auto pr-2">
                {trafficTrends.map((t, idx) => {
                  const maxViews = Math.max(...trafficTrends.map(x => x.views), 1);
                  const heightPercentage = (t.views / maxViews) * 100;
                  return (
                    <div key={idx} className="flex-1 min-w-[50px] flex flex-col items-center group">
                      <div className="w-full relative flex items-end justify-center h-48">
                        {/* Tooltip */}
                        <span className="absolute -top-6 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-[10px] font-bold text-gray-900 dark:text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.views} views
                        </span>
                        
                        {/* Bar */}
                        <div 
                          className="w-8 rounded-t-lg bg-red-600/80 group-hover:bg-red-500 transition-all origin-bottom scale-y-0 animate-[grow-y_0.6s_ease-out_forwards] relative shadow-lg shadow-red-950/20"
                          style={{ 
                            height: `${heightPercentage}%`,
                            animationDelay: `${idx * 60}ms`
                          }}
                        >
                          {/* Inner visitor line */}
                          <div 
                            className="absolute inset-x-1.5 bottom-0 bg-blue-500 rounded-t-sm"
                            style={{ height: `${(t.visitors / t.views) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 mt-3">{t.date}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center space-x-6 mt-6 border-t border-neutral-900 pt-4 text-xs font-semibold text-gray-400 dark:text-neutral-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-sm mr-2" />
                  <span>Gross Page Views</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2" />
                  <span>Unique Visitors</span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Performance */}
              <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Category performance</h3>
                <div className="space-y-4">
                  {categoryPerformance.map((c, idx) => {
                    const maxCatViews = Math.max(...categoryPerformance.map(x => x.views), 1);
                    const percentage = (c.views / maxCatViews) * 100;
                    return (
                      <div key={idx} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between text-gray-500 dark:text-neutral-400">
                          <span className="text-neutral-200">{c.category} ({c.articlesCount} posts)</span>
                          <span>{c.views} Views</span>
                        </div>
                        <div className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 h-3 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Author performance */}
              <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 p-6 overflow-hidden">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Author leaderboard</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-neutral-500 font-semibold uppercase tracking-wider pb-3">
                        <th className="pb-3 text-left">Author</th>
                        <th className="pb-3 text-center">Published</th>
                        <th className="pb-3 text-center">Total Views</th>
                        <th className="pb-3 text-right">Avg. Read Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {authorPerformance.map((auth, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:bg-neutral-950/40 transition-colors group">
                          <td className="py-3 flex items-center space-x-2 font-bold text-neutral-200 group-hover:text-gray-900 dark:text-white">
                            <div className="p-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500">
                              <User size={12} />
                            </div>
                            <span>{auth.authorName}</span>
                          </td>
                          <td className="py-3 text-center text-gray-500 dark:text-neutral-400 font-medium">{auth.articlesCount}</td>
                          <td className="py-3 text-center text-gray-700 dark:text-neutral-300 font-bold">{auth.totalViews}</td>
                          <td className="py-3 text-right text-gray-500 dark:text-neutral-400 font-medium">
                            {Math.floor(auth.avgReadTime / 60)}m {auth.avgReadTime % 60}s
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AnalyticsDashboard;
