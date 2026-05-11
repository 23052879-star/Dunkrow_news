import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import ArticleCard from '../components/article/ArticleCard';
import LoadingScreen from '../components/ui/LoadingScreen';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Article } from '../types';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const fetchCategoryAndArticles = async () => {
      setIsLoading(true);
      
      try {
        // Find category name from slug
        const { data: categoryData } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', slug)
          .single();

        const name = categoryData?.name || slug?.charAt(0).toUpperCase() + slug?.slice(1);
        setCategoryName(name);

        // Fetch articles for this category
        const { data: articlesData } = await supabase
          .from('articles')
          .select('*')
          .eq('category', name)
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (articlesData) {
          // Transform keys to match Article type
          const transformedArticles = articlesData.map(item => ({
            id: item.id,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            title: item.title,
            content: item.content,
            excerpt: item.excerpt,
            featuredImage: item.featured_image,
            category: item.category,
            authorId: item.author_id,
            authorName: item.author_name,
            published: item.published,
            slug: item.slug,
            commentCount: item.comment_count || 0
          })) as Article[];
          
          setArticles(transformedArticles);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchCategoryAndArticles();
    }
  }, [slug]);

  // Determine a color theme based on category slug (for visual interest)
  const getCategoryTheme = () => {
    const themes: Record<string, { bg: string, text: string }> = {
      politics: { bg: 'from-blue-600 to-indigo-800', text: 'text-blue-100' },
      technology: { bg: 'from-cyan-500 to-blue-700', text: 'text-cyan-100' },
      sports: { bg: 'from-green-500 to-emerald-700', text: 'text-green-100' },
      entertainment: { bg: 'from-fuchsia-500 to-purple-800', text: 'text-fuchsia-100' },
      business: { bg: 'from-amber-500 to-orange-700', text: 'text-amber-100' },
      health: { bg: 'from-rose-500 to-red-700', text: 'text-rose-100' },
      science: { bg: 'from-violet-500 to-purple-800', text: 'text-violet-100' }
    };
    return themes[slug || ''] || { bg: 'from-red-600 to-red-800', text: 'text-red-100' };
  };

  const theme = getCategoryTheme();

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title>{categoryName} News | Dunkrow</title>
        <meta name="description" content={`Latest news and updates about ${categoryName}`} />
      </Helmet>

      <div className="min-h-screen pb-16">
        {/* Dynamic Category Header */}
        <motion.div 
          className={`relative w-full rounded-3xl overflow-hidden mb-12 shadow-2xl bg-gradient-to-br ${theme.bg}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 opacity-20">
            <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 px-8 py-16 md:py-24 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-black text-white font-display tracking-tight mb-4 uppercase">
                {categoryName}
              </h1>
              <p className={`text-lg md:text-xl font-medium ${theme.text}`}>
                Stay updated with the latest stories in {categoryName}.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Content Section */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center text-neutral-500 hover:text-red-600 dark:hover:text-red-400 mb-8 transition-colors font-medium">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>

          {articles.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
                  }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <FileQuestion size={64} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-6" />
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No Articles Found</h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                We're currently gathering the latest news for this category. Check back soon for updates.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
