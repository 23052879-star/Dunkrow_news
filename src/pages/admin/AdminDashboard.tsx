import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Newspaper, Users, MessageSquare, Eye, FileEdit, Trash2, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface DashboardStats {
  articles: number;
  users: number;
  comments: number;
  pendingComments: number;
  whispers: number;
  jokesTrivia: number;
  newsletterSubscriptions: number;
}

interface RecentArticle {
  id: string;
  title: string;
  created_at: string;
  slug: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    articles: 0,
    users: 0,
    comments: 0,
    pendingComments: 0,
    whispers: 0,
    jokesTrivia: 0,
    newsletterSubscriptions: 0
  });
  
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch stats counts
        const [
          articlesRes,
          usersRes,
          commentsRes,
          pendingCommentsRes,
          whispersRes,
          jokesTriviasRes,
          newsletterRes
        ] = await Promise.all([
          supabase.from('articles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('comments').select('id', { count: 'exact', head: true }),
          supabase.from('comments').select('id', { count: 'exact', head: true }).eq('approved', false),
          supabase.from('whispers').select('id', { count: 'exact', head: true }),
          supabase.from('jokes_trivia').select('id', { count: 'exact', head: true }),
          supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }).eq('is_active', true)
        ]);
        
        setStats({
          articles: articlesRes.count || 0,
          users: usersRes.count || 0,
          comments: commentsRes.count || 0,
          pendingComments: pendingCommentsRes.count || 0,
          whispers: whispersRes.count || 0,
          jokesTrivia: jokesTriviasRes.count || 0,
          newsletterSubscriptions: newsletterRes.count || 0
        });
        
        // Fetch recent articles
        const { data: articles } = await supabase
          .from('articles')
          .select('id, title, created_at, slug')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (articles) {
          setRecentArticles(articles);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Dunkrow</title>
      </Helmet>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Admin Dashboard
          </h1>
          
          <Link to="/admin/articles">
            <Button>
              Create New Article
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`${stats.pendingComments > 0 ? 'border-l-4 border-l-yellow-500' : ''}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700">
                <MessageSquare size={24} className="text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Comments
                </p>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {isLoading ? '...' : stats.comments}
                </h3>
                {stats.pendingComments > 0 && (
                  <Link to="/admin/comments" className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    {stats.pendingComments} pending approval
                  </Link>
                )}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700">
                <Newspaper size={24} className="text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Articles
                </p>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {isLoading ? '...' : stats.articles}
                </h3>
                <Link to="/admin/articles" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  Manage
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700">
                <Users size={24} className="text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Users
                </p>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {isLoading ? '...' : stats.users}
                </h3>
                <Link to="/admin/users" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  Manage
                </Link>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700">
                <Mail size={24} className="text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Newsletter
                </p>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {isLoading ? '...' : stats.newsletterSubscriptions}
                </h3>
                <Link to="/admin/newsletter" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  Manage
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Articles */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Recent Articles
            </h2>
            <Link to="/admin/articles" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <div key={article.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {article.title}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(article.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/article/${article.slug}`} target="_blank">
                        <Button size="sm" variant="ghost" aria-label="View">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <Link to={`/admin/articles?edit=${article.id}`}>
                        <Button size="sm" variant="ghost" aria-label="Edit">
                          <FileEdit size={16} />
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" aria-label="Delete">
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-neutral-600 dark:text-neutral-400 text-center">
                  No articles found
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Content Management
            </h2>
            <div className="space-y-2">
              <Link to="/admin/articles">
                <Button fullWidth variant="outline" className="justify-start">
                  <Newspaper size={16} className="mr-2" />
                  Manage Articles
                </Button>
              </Link>
              <Link to="/admin/whispers">
                <Button fullWidth variant="outline" className="justify-start">
                  <Newspaper size={16} className="mr-2" />
                  Manage Weekend Whispers
                </Button>
              </Link>
              <Link to="/admin/jokes-trivia">
                <Button fullWidth variant="outline" className="justify-start">
                  <Newspaper size={16} className="mr-2" />
                  Manage Jokes & Trivia
                </Button>
              </Link>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              User Management
            </h2>
            <div className="space-y-2">
              <Link to="/admin/comments">
                <Button fullWidth variant="outline" className="justify-start">
                  <MessageSquare size={16} className="mr-2" />
                  Manage Comments
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button fullWidth variant="outline" className="justify-start">
                  <Users size={16} className="mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/newsletter">
                <Button fullWidth variant="outline" className="justify-start">
                  <Mail size={16} className="mr-2" />
                  Newsletter Subscriptions
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;