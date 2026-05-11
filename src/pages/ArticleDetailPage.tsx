import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow } from 'date-fns';
import { User, Calendar, MessageSquare, ArrowLeft, Loader2, Share2, Bookmark, Clock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useArticleStore } from '../store/articleStore';
import { useCommentStore } from '../store/commentStore';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentArticle: article, isLoading, fetchArticleBySlug } = useArticleStore();
  const { comments, fetchComments, addComment, isSubmitting } = useCommentStore();
  const { user } = useAuth();
  
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (slug) {
      fetchArticleBySlug(slug);
    }
  }, [slug, fetchArticleBySlug]);

  useEffect(() => {
    if (article) {
      fetchComments(article.id);
    }
  }, [article, fetchComments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !article || !user) return;
    
    await addComment(article.id, user.id, newComment);
    setNewComment('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-red-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Article Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Dunkrow</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20">
        {/* Full-width Hero Image Header */}
        <div className="relative w-full h-[60vh] min-h-[400px] max-h-[700px] bg-neutral-900">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${article.featuredImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:px-24">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="inline-block px-4 py-1.5 bg-red-600 backdrop-blur-md text-white text-sm font-bold uppercase tracking-widest rounded-lg shadow-lg border border-red-500/50 mb-6">
                  {article.category}
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-display leading-tight tracking-tight mb-6 drop-shadow-lg">
                  {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center text-slate-300 font-medium space-x-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center mr-3">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <span>{article.authorName || 'Editorial Team'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-2 text-red-400" />
                    <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-red-400" />
                    <span>{formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sticky Sidebar Actions */}
            <div className="hidden lg:block w-16 flex-shrink-0">
              <div className="sticky top-32 flex flex-col items-center space-y-4">
                <button className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-600 hover:shadow-lg transition-all duration-300 group">
                  <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                <button className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-600 hover:shadow-lg transition-all duration-300 group">
                  <Bookmark size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Main Article Content */}
            <motion.div 
              className="lg:w-2/3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                {/* Decorative quote mark in background */}
                <div className="absolute top-8 right-8 text-slate-100 dark:text-slate-700/50 font-serif text-9xl pointer-events-none select-none">
                  "
                </div>

                <div 
                  className="prose prose-lg dark:prose-invert max-w-none relative z-10 prose-headings:font-display prose-headings:font-bold prose-a:text-red-600 hover:prose-a:text-red-700 prose-img:rounded-2xl prose-img:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: article.content }} 
                />
              </div>

              {/* Comments Section */}
              <div className="mt-12 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 font-display">
                  Discussion ({comments.length})
                </h3>

                {user ? (
                  <form onSubmit={handleCommentSubmit} className="mb-10">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <User size={20} className="text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts on this article..."
                          className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none min-h-[100px]"
                          required
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50"
                          >
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-6 text-center mb-10 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Join the conversation to share your perspective.</p>
                    <Link
                      to="/login"
                      className="inline-block px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                      Login to Comment
                    </Link>
                  </div>
                )}

                <div className="space-y-6">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-600">
                          {comment.user.avatarUrl ? (
                            <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <User size={20} className="text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 group-hover:border-slate-200 dark:group-hover:border-slate-600 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-slate-900 dark:text-white">
                                {comment.user.username}
                              </h4>
                              <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500 dark:text-slate-400">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Sidebar Recommendations */}
            <div className="lg:w-1/3">
              <div className="sticky top-32">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <span className="w-2 h-6 bg-red-600 rounded-full mr-3"></span>
                  More like this
                </h3>
                <div className="space-y-6">
                  {/* Placeholder for related articles */}
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="group flex gap-4 cursor-pointer">
                      <div className="w-24 h-24 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                        <img src={article.featuredImage} alt="Related" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                          {article.category}
                        </span>
                        <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {article.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Newsletter Box in Sidebar */}
                <div className="mt-10 bg-gradient-to-br from-slate-900 to-neutral-900 rounded-3xl p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-[40px]"></div>
                  <Mail className="mx-auto text-white mb-3" size={32} />
                  <h4 className="text-xl font-bold text-white mb-2">Stay Informed</h4>
                  <p className="text-slate-400 text-sm mb-4">Get the latest updates delivered directly to your inbox.</p>
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors relative z-10">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleDetailPage;