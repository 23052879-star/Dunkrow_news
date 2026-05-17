import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useArticleStore } from '../store/articleStore';
import ArticleCard from '../components/article/ArticleCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import NewsletterForm from '../components/newsletter/NewsletterForm';
import { ArrowRight, Zap, Briefcase, Award as Football, Film, Activity as Flask, Heart, ChevronDown, Globe, Users, TrendingUp, Play, BarChart3, Clock, Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Category {
  name: string;
  slug: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Politics': <img src="/logo-removebg-preview.png" alt="Politics" className="w-6 h-6 object-contain dark:filter dark:brightness-0 dark:invert" />,
  'Technology': <Zap size={24} />,
  'Business': <Briefcase size={24} />,
  'Sports': <Football size={24} />,
  'Entertainment': <Film size={24} />,
  'Science': <Flask size={24} />,
  'Health': <Heart size={24} />
};

// Removed RevolvingLogo and FloatingElement for a cleaner editorial layout

const HomePage: React.FC = () => {
  const { articles, featuredArticles, isLoading, fetchArticles, fetchFeaturedArticles } = useArticleStore();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoryArticles, setCategoryArticles] = React.useState<Record<string, any[]>>({});
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const ySpring = useSpring(y, springConfig);
  const opacitySpring = useSpring(opacity, springConfig);
  const scaleSpring = useSpring(scale, springConfig);
  
  useEffect(() => {
    fetchFeaturedArticles();
    fetchArticles(6);
    fetchCategories();
  }, [fetchFeaturedArticles, fetchArticles]);

  const fetchCategories = async () => {
    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL.includes('undefined')) {
      console.warn('Supabase not configured, using demo categories');
      const demoCategories = [
        { name: 'Politics', slug: 'politics' },
        { name: 'Technology', slug: 'technology' },
        { name: 'Business', slug: 'business' },
        { name: 'Sports', slug: 'sports' },
        { name: 'Entertainment', slug: 'entertainment' },
        { name: 'Science', slug: 'science' },
        { name: 'Health', slug: 'health' }
      ];
      setCategories(demoCategories);
      return;
    }

    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('name, slug')
        .order('name');
      
      if (categories) {
        setCategories(categories);
        fetchCategoryArticles(categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use demo categories as fallback
      const demoCategories = [
        { name: 'Politics', slug: 'politics' },
        { name: 'Technology', slug: 'technology' },
        { name: 'Business', slug: 'business' },
        { name: 'Sports', slug: 'sports' },
        { name: 'Entertainment', slug: 'entertainment' },
        { name: 'Science', slug: 'science' },
        { name: 'Health', slug: 'health' }
      ];
      setCategories(demoCategories);
    }
  };

  const fetchCategoryArticles = async (categories: Category[]) => {
    const articlesByCategory: Record<string, any[]> = {};
    
    try {
      await Promise.all(categories.map(async (category) => {
        const { data } = await supabase
          .from('articles')
          .select('*')
          .eq('category', category.name)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (data) {
          // Transform keys to match Article type
          const transformedArticles = data.map(item => ({
            id: item.id,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            title: item.title,
            content: item.content,
            excerpt: item.excerpt,
            featuredImage: item.featured_image,
            category: item.category,
            authorId: item.author_id,
            published: item.published,
            slug: item.slug
          }));
          articlesByCategory[category.slug] = transformedArticles;
        }
      }));

      setCategoryArticles(articlesByCategory);
    } catch (error) {
      console.error('Error fetching category articles:', error);
    }
  };

  const scrollToContent = () => {
    const element = document.getElementById('main-content');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Dunkrow - Global Breaking News, Real-Time Updates & Investigative Journalism | Premier Digital News Platform</title>
        <meta name="description" content="Dunkrow delivers award-winning journalism with real-time breaking news, in-depth investigative reporting, live coverage, and expert analysis across politics, technology, business, sports, entertainment, health, and global affairs. Your trusted source for credible news." />
        <meta name="keywords" content="breaking news today, live news updates, investigative journalism, real-time news alerts, global news coverage, political analysis, technology news, business reports, sports updates, entertainment news, health journalism, fact-checked news, credible news source, digital newspaper, news website, current events, world news, trending stories, news analysis, expert commentary" />
        <meta property="og:title" content="Dunkrow - Premier Global News Platform | Breaking News & Investigative Journalism" />
        <meta property="og:description" content="Award-winning digital journalism platform delivering real-time breaking news, investigative reports, and expert analysis from around the world. Trusted by millions for credible, fact-checked news coverage." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dunkrow.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dunkrow - Global Breaking News & Investigative Journalism" />
        <meta name="twitter:description" content="Premier digital news platform delivering real-time updates, investigative reports, and expert analysis from trusted journalists worldwide." />
      </Helmet>

      {/* Hero Section */}
      <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-black transition-colors duration-500">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 z-0 opacity-10 text-white pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
        
        {/* Crazy Professional Aurora Background */}
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
          style={{ y: ySpring, opacity: opacitySpring, scale: scaleSpring }}
        >
          {/* Drifting Stars / Particles */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                background: Math.random() > 0.5 ? '#ef4444' : '#ffffff',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
              }}
              animate={{
                y: [0, -1000],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 10,
              }}
            />
          ))}

          {/* Flowing Red/Black Aurora Shapes */}
          <motion.div
            className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[80px] mix-blend-screen"
            style={{
              background: 'radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, rgba(153, 27, 27, 0.2) 50%, rgba(0,0,0,0) 70%)',
            }}
            animate={{
              x: [0, 200, -100, 0],
              y: [0, -100, 200, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-[20%] right-[20%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-screen"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(220, 38, 38, 0.4) 40%, rgba(0,0,0,0) 70%)',
            }}
            animate={{
              x: [0, -300, 100, 0],
              y: [0, 200, -200, 0],
              scale: [1, 0.8, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-[60%] left-[40%] w-[30vw] h-[30vw] rounded-full blur-[60px] mix-blend-screen"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.5) 0%, rgba(0,0,0,0) 70%)',
            }}
            animate={{
              x: [0, 100, -200, 0],
              y: [0, 150, -100, 0],
              scale: [1.2, 1, 1.5, 1.2],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Main Hero Content */}
        <div className="relative z-10 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col justify-center min-h-screen items-center pt-32 pb-48 lg:pt-32 lg:pb-32 text-center">
            {/* Center Content */}
            <motion.p 
              className="text-xs sm:text-sm text-red-600 dark:text-red-500 mb-4 font-semibold tracking-[0.2em] uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Premier Global News Platform
            </motion.p>
            
            <motion.h1 
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium text-slate-900 dark:text-white mb-6 font-['Playfair_Display'] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Dunkrow <span className="italic text-slate-500 dark:text-slate-400">News.</span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Award-winning digital journalism delivering real-time breaking news, investigative reports, and expert analysis from trusted correspondents worldwide.
            </motion.p>

            {/* Clean minimal Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center w-full sm:w-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <motion.button
                onClick={scrollToContent}
                className="px-8 py-3.5 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg shadow-black/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore Breaking News
              </motion.button>

              <Link to="/whispers" className="w-full sm:w-auto">
                <motion.button
                  className="w-full px-8 py-3.5 text-sm font-medium text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700 rounded-full hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Investigative Reports
                </motion.button>
              </Link>
            </motion.div>

            {/* Minimal Stats */}
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-['Playfair_Display'] italic text-slate-900 dark:text-white">1.2M+</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Readers</span>
              </div>
              <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-neutral-800"></div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-['Playfair_Display'] italic text-slate-900 dark:text-white">24/7</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Coverage</span>
              </div>
              <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-neutral-800"></div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-['Playfair_Display'] italic text-slate-900 dark:text-white">250+</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Daily</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-16 lg:bottom-20 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          onClick={scrollToContent}
        >
          <div className="flex flex-col items-center text-red-200 dark:text-red-200 hover:text-white dark:hover:text-white transition-colors">
            <span className="text-xs lg:text-sm mb-2 lg:mb-3 font-medium">Discover More</span>
            <div className="p-2 rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/20">
              <ChevronDown size={20} />
            </div>
          </div>
        </motion.div>

        {/* Sharp Red Divider */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 z-20"></div>
      </div>

      {/* Main Content */}
      <div id="main-content" className="bg-black relative z-20">
        <motion.div 
          className="max-w-screen-2xl mx-auto px-6 pt-12 pb-24 space-y-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Featured Article */}
          {!isLoading && featuredArticles.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-1.5 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight uppercase italic">Featured Investigation</h2>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow hidden sm:block mx-8"></div>
              </div>
              <div className="max-w-6xl mx-auto">
                <ArticleCard article={featuredArticles[0]} featured />
              </div>
            </motion.section>
          )}

          {/* Categories Grid */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-1.5 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight uppercase italic">Explore by Category</h2>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow hidden sm:block mx-8"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
              {categories.map((category, index) => {
                return (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <Link
                      to={`/category/${category.slug}`}
                      className="group block h-full"
                    >
                      <motion.div
                        className="bg-white dark:bg-neutral-900 rounded-xl p-6 transition-all duration-300 border border-slate-200 dark:border-neutral-800 hover:border-red-600 dark:hover:border-red-600 shadow-sm hover:shadow-xl h-full relative overflow-hidden"
                        whileHover={{ y: -5 }}
                      >
                        <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300" />
                        
                        <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10 h-full">
                          <motion.div 
                            className="p-4 rounded-full bg-slate-50 dark:bg-black border border-slate-100 dark:border-neutral-800 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300"
                            whileHover={{ rotate: 10, scale: 1.1 }}
                          >
                            <div className="text-slate-600 dark:text-slate-300 group-hover:text-white group-hover:invert-0 transition-colors">
                              {categoryIcons[category.name] || <ChevronDown size={24} className="text-current" />}
                            </div>
                          </motion.div>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors text-sm uppercase tracking-widest">
                            {category.name}
                          </h3>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Category Sections */}
          {categories.slice(0, 3).map((category, sectionIndex) => (
            <motion.section 
              key={category.slug}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="p-2.5 rounded-xl bg-red-600 shadow-lg text-white"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    {categoryIcons[category.name]}
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight uppercase italic">{category.name}</h2>
                </div>
                <Link to={`/category/${category.slug}`}>
                  <motion.button
                    className="group flex items-center text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    View All {category.name} News
                    <ArrowRight size={16} className="ml-2" />
                  </motion.button>
                </Link>
              </div>

              {categoryArticles[category.slug]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryArticles[category.slug].map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <ArticleCard article={article} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <p className="text-center py-8 text-neutral-600 dark:text-neutral-400">
                    No articles in this category yet.
                  </p>
                </Card>
              )}
            </motion.section>
          ))}

          {/* Latest Stories Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-1.5 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight uppercase italic">Latest Stories</h2>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow hidden sm:block mx-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {articles.slice(0, 8).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/whispers">
                <motion.button
                  className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All News Stories
                </motion.button>
              </Link>
            </div>
          </motion.section>

          {/* Weekend Whispers & Jokes Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.section 
              className="bg-white dark:bg-black rounded-xl p-8 border border-slate-200 dark:border-neutral-800 hover:border-red-600 dark:hover:border-red-600 transition-colors shadow-sm"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-1 bg-red-600"></div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Playfair_Display'] tracking-tight italic">
                  Investigative Reports
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6 font-light">
                Deep-dive investigations and exclusive reports that uncover the stories behind the headlines.
              </p>
              <Link to="/whispers">
                <motion.button
                  className="px-6 py-2.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest border border-slate-200 dark:border-neutral-800 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors flex items-center group"
                  whileHover={{ x: 5 }}
                >
                  Read Investigations
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </motion.section>

            <motion.section 
              className="bg-white dark:bg-black rounded-xl p-8 border border-slate-200 dark:border-neutral-800 hover:border-red-600 dark:hover:border-red-600 transition-colors shadow-sm"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-1 bg-red-600"></div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Playfair_Display'] tracking-tight italic">
                  News Digest & Analysis
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6 font-light">
                Daily news summaries, expert analysis, and thought-provoking commentary on current events.
              </p>
              <Link to="/jokes-trivia">
                <motion.button
                  className="px-6 py-2.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest border border-slate-200 dark:border-neutral-800 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors flex items-center group"
                  whileHover={{ x: 5 }}
                >
                  Read Analysis
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </motion.section>
          </div>

          {/* Newsletter */}
          <motion.section 
            className="relative overflow-hidden border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative p-12 md:p-16 lg:p-20 overflow-hidden">
              {/* Background Glows (Red only) */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 dark:bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
              
              <div className="relative text-center max-w-4xl mx-auto z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center p-3 border border-red-600/20 bg-red-600/5 rounded-full mb-8"
                >
                  <Mail className="text-red-600 mr-3" size={20} />
                  <span className="text-red-600 font-bold tracking-widest uppercase text-xs">Join The Inner Circle</span>
                </motion.div>

                <motion.h2 
                  className="text-4xl md:text-5xl lg:text-6xl font-['Playfair_Display'] italic text-slate-900 dark:text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Never Miss Breaking News
                </motion.h2>
                <motion.p 
                  className="mb-12 text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Join over 500,000 subscribers who trust Dunkrow for daily news briefings, exclusive investigations, and real-time alerts.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="max-w-md mx-auto"
                >
                  <NewsletterForm />
                </motion.div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </>
  );
};

export default HomePage;