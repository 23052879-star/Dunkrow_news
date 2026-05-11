import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, SmilePlus, Sparkles, X } from 'lucide-react';

const FloatingMenu: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveredWhisper, setIsHoveredWhisper] = useState(false);
  const [isHoveredJokes, setIsHoveredJokes] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Weekend Whispers Button */}
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <Link to="/whispers">
              <motion.div
                className="relative flex items-center gap-3 rounded-2xl cursor-pointer overflow-hidden"
                onMouseEnter={() => setIsHoveredWhisper(true)}
                onMouseLeave={() => setIsHoveredWhisper(false)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(185,28,28,0.95))',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                  padding: isHoveredWhisper ? '12px 20px' : '12px 14px',
                  transition: 'padding 0.3s ease'
                }}
              >
                {/* Animated glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    boxShadow: [
                      '0 0 15px rgba(239,68,68,0.3)',
                      '0 0 30px rgba(239,68,68,0.5)',
                      '0 0 15px rgba(239,68,68,0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <MessageSquare size={20} className="text-white" />
                </motion.div>

                <AnimatePresence>
                  {isHoveredWhisper && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-white text-sm font-bold whitespace-nowrap relative z-10 overflow-hidden"
                    >
                      Weekend Whispers
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Sparkle accent */}
                <motion.div
                  className="absolute -top-1 -right-1 z-20"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles size={12} className="text-yellow-300" />
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Daily Jokes & Trivia Button */}
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Link to="/jokes-trivia">
              <motion.div
                className="relative flex items-center gap-3 rounded-2xl cursor-pointer overflow-hidden"
                onMouseEnter={() => setIsHoveredJokes(true)}
                onMouseLeave={() => setIsHoveredJokes(false)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.9), rgba(234,88,12,0.95))',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                  padding: isHoveredJokes ? '12px 20px' : '12px 14px',
                  transition: 'padding 0.3s ease'
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    boxShadow: [
                      '0 0 15px rgba(249,115,22,0.3)',
                      '0 0 30px rgba(249,115,22,0.5)',
                      '0 0 15px rgba(249,115,22,0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />

                <motion.div
                  animate={{ 
                    y: [0, -3, 0],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <SmilePlus size={20} className="text-white" />
                </motion.div>

                <AnimatePresence>
                  {isHoveredJokes && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-white text-sm font-bold whitespace-nowrap relative z-10 overflow-hidden"
                    >
                      Jokes & Trivia
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Lightning accent */}
                <motion.div
                  className="absolute -top-1 -right-1 z-20 text-lg"
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ⚡
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FloatingMenu;