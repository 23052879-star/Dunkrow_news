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
  'Technology': <Zap size={24} className="text-slate-900 dark:text-white" />,
  'Business': <Briefcase size={24} className="text-slate-900 dark:text-white" />,
  'Sports': <Football size={24} className="text-slate-900 dark:text-white" />,
  'Entertainment': <Film size={24} className="text-slate-900 dark:text-white" />,
  'Science': <Flask size={24} className="text-slate-900 dark:text-white" />,
  'Health': <Heart size={24} className="text-slate-900 dark:text-white" />
};

// 3D Revolving Logo Component
const RevolvingLogo: React.FC = () => {
  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-96 lg:h-96 mx-auto flex items-center justify-center" style={{ perspective: "1000px" }}>
      {/* Glow effect behind logo */}
      <motion.div 
        className="absolute inset-0 bg-red-600/30 rounded-full blur-[80px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* 3D Rotating Logo */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <img 
          src="/logo-removebg-preview.png" 
          alt="Dunkrow Logo 3D" 
          className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] dark:filter dark:brightness-0 dark:invert"
        />
      </motion.div>

      {/* Orbital Rings around Logo */}
      <motion.div
        className="absolute inset-0 border border-white/20 rounded-full"
        animate={{ rotateZ: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transform: "rotateX(70deg)", transformStyle: "preserve-3d" }}
      />
      <motion.div
        className="absolute inset-4 border border-red-400/20 rounded-full"
        animate={{ rotateZ: [360, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ transform: "rotateX(60deg) rotateY(20deg)", transformStyle: "preserve-3d" }}
      />
      
      {/* Floating particles inside orbits */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-red-300 rounded-full shadow-[0_0_10px_rgba(252,165,165,0.8)]"
          style={{
            top: `${30 + Math.random() * 40}%`,
            left: `${30 + Math.random() * 40}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};

const FloatingElement: React.FC<{ children: React.ReactNode; delay?: number; duration?: number; className?: string }> = ({ 
  children, 
  delay = 0, 
  duration = 3,
  className = ""
}) => {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

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
      <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-50 via-slate-50 to-white dark:from-red-950 dark:via-slate-950 dark:to-slate-950 transition-colors duration-500">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: ySpring, opacity: opacitySpring, scale: scaleSpring }}
        >
          {/* Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: Math.random() > 0.5 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.2)',
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `-${Math.random() * 10}s`
              }}
            />
          ))}

          {/* Floating News Icons */}
          <FloatingElement delay={0} duration={4} className="top-20 left-4 lg:left-10 text-red-500/15">
            <BarChart3 size={60} />
          </FloatingElement>

          <FloatingElement delay={1} duration={5} className="top-32 right-4 lg:right-20 text-red-400/10">
            <Clock size={70} />
          </FloatingElement>

          <FloatingElement delay={2} duration={3.5} className="bottom-40 left-4 lg:left-20 text-red-500/12">
            <Shield size={55} />
          </FloatingElement>

          <FloatingElement delay={0.5} duration={4.5} className="top-60 left-1/4 lg:left-1/3 text-red-400/10">
            <Play size={65} />
          </FloatingElement>

          <FloatingElement delay={1.5} duration={3} className="bottom-60 right-4 lg:right-10 text-red-500/15">
            <TrendingUp size={50} />
          </FloatingElement>

          {/* Geometric Shapes with red tones */}
          <FloatingElement delay={0} duration={6} className="top-40 right-1/4 lg:right-1/3">
            <div className="w-16 h-16 bg-red-500/10 rounded-full backdrop-blur-sm"></div>
          </FloatingElement>

          <FloatingElement delay={2} duration={5} className="bottom-32 left-1/6 lg:left-1/4">
            <div className="w-12 h-12 bg-red-600/10 rotate-45 backdrop-blur-sm"></div>
          </FloatingElement>

          <FloatingElement delay={1} duration={4} className="top-1/2 right-8 lg:right-16">
            <div className="w-10 h-10 bg-red-400/8 rounded-lg backdrop-blur-sm"></div>
          </FloatingElement>
        </motion.div>

        {/* Main Hero Content */}
        <div className="relative z-10 min-h-screen">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-screen items-center pt-32 pb-48 lg:pt-32 lg:pb-32">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1 z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8 lg:mb-12"
            >
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-slate-900 dark:text-white mb-6 lg:mb-8 tracking-tight font-display"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <span className="text-shimmer bg-clip-text text-transparent">
                  DUNKROW
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg sm:text-xl md:text-2xl text-red-600 dark:text-blue-100 mb-4 lg:mb-6 font-medium tracking-wide uppercase"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Premier Global News Platform
              </motion.p>
              
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-white/90 mb-8 lg:mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                Award-winning digital journalism delivering real-time breaking news, investigative reports, and expert analysis from trusted correspondents worldwide. Where credibility meets innovation in modern news reporting.
              </motion.p>
            </motion.div>

            {/* Realistic Stats */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-10 lg:mb-12 max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <div className="text-center lg:text-left bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-center lg:justify-start mb-1">
                  <Users size={18} className="text-red-600 dark:text-red-400 mr-2" />
                  <div className="text-2xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">1.2M+</div>
                </div>
                <div className="text-slate-500 dark:text-red-100 text-xs font-bold uppercase tracking-wider">Monthly Readers</div>
              </div>
              <div className="text-center lg:text-left bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-center lg:justify-start mb-1">
                  <Clock size={18} className="text-red-600 dark:text-red-400 mr-2" />
                  <div className="text-2xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">24/7</div>
                </div>
                <div className="text-slate-500 dark:text-red-100 text-xs font-bold uppercase tracking-wider">Global Coverage</div>
              </div>
              <div className="text-center lg:text-left bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-center lg:justify-start mb-1">
                  <BarChart3 size={18} className="text-red-600 dark:text-red-400 mr-2" />
                  <div className="text-2xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">250+</div>
                </div>
                <div className="text-slate-500 dark:text-red-100 text-xs font-bold uppercase tracking-wider">Daily Articles</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              <motion.button
                onClick={scrollToContent}
                className="magnetic-btn relative px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-semibold text-white overflow-hidden group bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl hover:shadow-red-600/50"
                whileHover={{ y: -3 }}
                whileTap={{ y: -1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <span className="relative z-10 flex items-center">
                  Explore Breaking News
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>

              <Link to="/whispers">
                <motion.button
                  className="magnetic-btn relative px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-semibold text-red-600 dark:text-white overflow-hidden group border-2 border-red-400/50 rounded-xl backdrop-blur-sm w-full sm:w-auto hover:border-red-400"
                  whileHover={{ y: -3 }}
                  whileTap={{ y: -1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
                  <span className="relative z-10 text-red-600 dark:text-white group-hover:text-white">Investigative Reports</span>
                </motion.button>
              </Link>
            </motion.div>
            </div>

            {/* Right Content - 3D Revolving Logo */}
            <div className="flex items-center justify-center order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="w-full max-w-sm lg:max-w-md xl:max-w-lg"
              >
                <RevolvingLogo />
              </motion.div>
            </div>
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

        {/* Wave Transition Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
          <svg className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px] lg:h-[150px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,115.15,198.81,104.9,240.59,98.66,281.8,77.22,321.39,56.44Z" className="fill-slate-50 dark:fill-slate-900"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div id="main-content" className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 relative z-20">
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
                const gradients = [
                  'from-blue-500/20 to-indigo-600/20 border-blue-500/30 group-hover:border-blue-500',
                  'from-emerald-500/20 to-teal-600/20 border-emerald-500/30 group-hover:border-emerald-500',
                  'from-amber-500/20 to-orange-600/20 border-amber-500/30 group-hover:border-amber-500',
                  'from-purple-500/20 to-pink-600/20 border-purple-500/30 group-hover:border-purple-500',
                  'from-rose-500/20 to-red-600/20 border-rose-500/30 group-hover:border-rose-500',
                  'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 group-hover:border-cyan-500',
                  'from-fuchsia-500/20 to-purple-600/20 border-fuchsia-500/30 group-hover:border-fuchsia-500'
                ];
                const gradient = gradients[index % gradients.length];
                
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
                        className={`bg-white dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-500 border h-full relative overflow-hidden ${gradient}`}
                        whileHover={{
                          scale: 1.05,
                          y: -5
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                          <motion.div 
                            className="p-4 rounded-2xl bg-white dark:bg-slate-700 shadow-md group-hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-600"
                            whileHover={{ rotate: 10, scale: 1.1 }}
                          >
                            <div className="text-slate-800 dark:text-white">
                              {categoryIcons[category.name] || <ChevronDown size={24} />}
                            </div>
                          </motion.div>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-lg">
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
              className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-8 border border-red-200 dark:border-red-800/30"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-1 bg-red-600 rounded-full"></div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight uppercase italic">
                  Investigative Reports
                </h2>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                Deep-dive investigations and exclusive reports that uncover the stories behind the headlines.
              </p>
              <Link to="/whispers">
                <motion.button
                  className="magnetic-btn relative px-6 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 overflow-hidden group bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <span className="relative z-10 flex items-center text-slate-700 dark:text-neutral-300 group-hover:text-white transition-colors duration-300 font-medium">
                    Read Investigations
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </motion.button>
              </Link>
            </motion.section>

            <motion.section 
              className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-8 border border-red-200 dark:border-red-800/30"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-1 bg-red-600 rounded-full"></div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight uppercase italic">
                  News Digest & Analysis
                </h2>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                Daily news summaries, expert analysis, and thought-provoking commentary on current events.
              </p>
              <Link to="/jokes-trivia">
                <motion.button
                  className="magnetic-btn relative px-6 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 overflow-hidden group bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <span className="relative z-10 flex items-center text-slate-700 dark:text-neutral-300 group-hover:text-white transition-colors duration-300 font-medium">
                    Read Analysis
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </motion.button>
                </Link>
            </motion.section>
          </div>

          {/* Newsletter */}
          <motion.section 
            className="relative overflow-hidden rounded-[2.5rem] p-1 shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-purple-600 opacity-80 animate-gradient-xy"></div>
            
            <div className="relative bg-white/90 dark:bg-neutral-950/90 backdrop-blur-3xl rounded-[2.4rem] p-12 md:p-16 lg:p-20 overflow-hidden shadow-2xl border border-slate-100 dark:border-white/10 transition-colors duration-500">
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="relative text-center max-w-4xl mx-auto z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl mb-8 backdrop-blur-sm"
                >
                  <Mail className="text-red-600 dark:text-red-400 mr-3" size={28} />
                  <span className="text-slate-900 dark:text-white font-bold tracking-widest uppercase text-sm">Join The Inner Circle</span>
                </motion.div>

                <motion.h2 
                  className="text-4xl md:text-6xl font-black mb-6 font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-red-600 to-slate-800 dark:from-white dark:via-red-100 dark:to-slate-300 drop-shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Never Miss Breaking News
                </motion.h2>
                <motion.p 
                  className="mb-12 text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
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
                  className="p-2 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl"
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