import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { JokeTrivia } from '../../types';
import { Share2, ThumbsUp } from 'lucide-react';

interface JokeTriviaCardProps {
  jokeTrivia: JokeTrivia;
}

const JokeTriviaCard: React.FC<JokeTriviaCardProps> = ({ jokeTrivia }) => {
  const isJoke = jokeTrivia.type === 'joke';
  const themeColors = isJoke 
    ? 'from-amber-400 to-orange-600' 
    : 'from-blue-400 to-indigo-600';
  const badgeColor = isJoke
    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';

  return (
    <motion.div 
      className="group relative h-full flex flex-col bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden"
      whileHover={{ y: -5 }}
    >
      {/* Decorative gradient border top */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${themeColors}`} />
      
      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${themeColors} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${badgeColor}`}>
          {jokeTrivia.type}
        </span>
        <span className="text-xs text-neutral-400 font-medium">
          {new Date(jokeTrivia.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="flex-grow relative z-10">
        <p className={`text-xl md:text-2xl font-display leading-tight mb-6 ${isJoke ? 'font-medium' : 'font-semibold'} text-neutral-800 dark:text-neutral-100`}>
          "{jokeTrivia.content}"
        </p>
        {jokeTrivia.author_name && (
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            — Submitted by <span className="text-neutral-700 dark:text-neutral-300">{jokeTrivia.author_name}</span>
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-700/50 flex justify-between items-center relative z-10">
        <button className="flex items-center text-sm font-medium text-neutral-500 hover:text-red-500 transition-colors">
          <ThumbsUp size={16} className="mr-1.5" />
          <span>Helpful</span>
        </button>
        <button className="flex items-center text-sm font-medium text-neutral-500 hover:text-blue-500 transition-colors">
          <Share2 size={16} className="mr-1.5" />
          <span>Share</span>
        </button>
      </div>
    </motion.div>
  );
};

export default JokeTriviaCard;