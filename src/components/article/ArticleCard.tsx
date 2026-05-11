import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { Article } from '../../types';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  return (
    <Link to={`/article/${article.slug}`} className="block h-full">
      <motion.div 
        className={`group h-full flex flex-col ${featured ? 'md:flex-row' : ''} bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 border border-slate-100 dark:border-slate-700 relative`}
        whileHover={{ y: -5 }}
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-colors duration-500 z-0"></div>

        <div
          className={`relative overflow-hidden z-10 ${
            featured ? 'h-64 md:h-auto md:w-[55%]' : 'h-52'
          }`}
        >
          <motion.div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${article.featuredImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
          
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <ArrowUpRight className="text-white" size={18} />
          </div>

          <div className="absolute bottom-4 left-4">
            <div className="inline-block px-3 py-1 bg-red-600/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg border border-white/20">
              {article.category}
            </div>
          </div>
        </div>

        <div className={`p-6 flex flex-col justify-between z-10 flex-grow ${featured ? 'md:w-[45%] md:p-10' : ''}`}>
          <div>
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
              <span>
                {article.createdAt ? (() => {
                  try {
                    return formatDistanceToNow(new Date(article.createdAt), { addSuffix: true });
                  } catch (e) {
                    return 'Recently';
                  }
                })() : 'Recently'}
              </span>
              <span className="mx-2">•</span>
              <span>{article.authorName || 'Editorial Team'}</span>
            </div>
            
            <h3 className={`font-display font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 ${featured ? 'text-2xl md:text-4xl' : 'text-lg md:text-xl'}`}>
              {article.title}
            </h3>
            
            <p className={`text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed ${featured ? 'text-base md:text-lg' : 'text-sm'}`}>
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <span className="text-sm font-semibold text-red-600 dark:text-red-400 group-hover:underline decoration-2 underline-offset-4">
              Read Full Story
            </span>
            
            {article.commentCount !== undefined && (
              <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                <MessageSquare size={14} className="mr-1.5" />
                {article.commentCount}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ArticleCard;