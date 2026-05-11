import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useWhisperStore } from '../store/whisperStore';
import WhisperCard from '../components/whisper/WhisperCard';
import { ShieldAlert, Radar, Fingerprint } from 'lucide-react';

const WhispersPage: React.FC = () => {
  const { whispers, isLoading, fetchWhispers } = useWhisperStore();
  
  useEffect(() => {
    fetchWhispers();
  }, [fetchWhispers]);

  return (
    <>
      <Helmet>
        <title>Weekend Whispers | Dunkrow</title>
        <meta name="description" content="Uncover the most intriguing rumors and insider information from around the world." />
      </Helmet>

      <div className="min-h-screen pb-20 bg-black">
        {/* Cinematic Hero Section */}
        <div className="relative w-full overflow-hidden bg-neutral-950 border-b border-neutral-900 mb-16 shadow-2xl">
          {/* Decorative Grid Pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          {/* Radial Red Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[150px] pointer-events-none"></div>

          {/* Floating Particles/Radar sweeps */}
          <motion.div 
            className="absolute top-20 left-20 text-red-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Radar size={120} />
          </motion.div>

          <div className="relative z-10 px-6 py-24 md:py-36 max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            >
              <div className="inline-flex items-center justify-center p-3 bg-red-950/50 backdrop-blur-md rounded-2xl mb-8 border border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <ShieldAlert className="text-red-500 mr-2" size={20} />
                <span className="text-red-400 font-bold tracking-widest uppercase text-sm">Classified Intelligence</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-300 to-neutral-600 mb-6 tracking-tighter font-display uppercase">
                Weekend Whispers
              </h1>
              <p className="text-lg md:text-2xl text-neutral-400 font-medium max-w-3xl mx-auto leading-relaxed border-l-2 border-red-600 pl-6 text-left">
                Uncover the most intriguing rumors, leaked documents, and insider information from around the world.
                <span className="block mt-2 text-red-500/80 font-mono text-sm tracking-widest">&gt;&gt; ACCESS RESTRICTED_ </span>
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12 pb-6 border-b border-neutral-900">
            <div className="flex items-center">
              <Fingerprint className="text-red-600 mr-4" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Latest Intercepts</h2>
                <p className="text-neutral-500 text-sm mt-1 font-mono">Decrypted and verified sources</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-neutral-600 font-mono text-sm">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span>LIVE FEED SECURE</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-neutral-900 rounded-3xl animate-pulse border border-neutral-800"></div>
              ))}
            </div>
          ) : (
            <>
              {whispers.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {whispers.map((whisper, index) => (
                    <motion.div
                      key={whisper.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true, margin: "-50px" }}
                    >
                      <WhisperCard whisper={whisper} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <ShieldAlert className="mx-auto text-neutral-600 mb-6" size={64} />
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">NO INTELLIGENCE FOUND</h3>
                  <p className="text-neutral-500 font-mono max-w-md mx-auto">
                    The network is currently silent. Check back this weekend for new drops and classified information.
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default WhispersPage;