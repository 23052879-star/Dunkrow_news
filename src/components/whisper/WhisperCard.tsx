import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Fingerprint, Eye, Share2 } from 'lucide-react';
import { Whisper as WhisperType } from '../../types';
import { motion } from 'framer-motion';

interface WhisperCardProps {
  whisper: WhisperType;
}

const WhisperCard: React.FC<WhisperCardProps> = ({ whisper }) => {
  return (
    <motion.div 
      className="group relative h-full flex flex-col bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 overflow-hidden border border-neutral-800"
      whileHover={{ y: -5 }}
    >
      {/* Cinematic Top Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-900 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] group-hover:bg-red-600/10 transition-colors duration-500" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-black/50 border border-neutral-800 rounded-full text-red-500 shadow-inner">
            <Fingerprint size={20} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-0.5">Classified</div>
            <div className="text-xs text-neutral-500 font-medium">
              {formatDistanceToNow(new Date(whisper.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="font-display font-black text-2xl text-white mb-4 group-hover:text-red-400 transition-colors duration-300 relative z-10">
        {whisper.title}
      </h3>
      
      {whisper.featuredImage && (
        <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-6 z-10 border border-neutral-800 group-hover:border-neutral-700 transition-colors">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <motion.div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${whisper.featuredImage})` }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.7 }}
          />
        </div>
      )}
      
      <div className="relative z-10 flex-grow">
        <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors duration-300 relative">
          <span className="absolute -left-4 -top-2 text-4xl text-neutral-800 font-serif opacity-50">"</span>
          {whisper.content}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-neutral-800 flex justify-between items-center relative z-10">
        <button className="flex items-center text-sm font-medium text-neutral-500 hover:text-white transition-colors group/btn">
          <Eye size={16} className="mr-2 group-hover/btn:text-red-500 transition-colors" />
          <span>Read Dossier</span>
        </button>
        <button className="flex items-center text-sm font-medium text-neutral-500 hover:text-white transition-colors">
          <Share2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default WhisperCard;