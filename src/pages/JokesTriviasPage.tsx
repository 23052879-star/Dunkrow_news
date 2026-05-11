import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useJokeTriviaStore } from '../store/jokeTriviaStore';
import JokeTriviaCard from '../components/joke-trivia/JokeTriviaCard';
import { SmilePlus, Lightbulb, Sparkles, Zap, MessageSquareQuote } from 'lucide-react';

const JokesTriviasPage: React.FC = () => {
  const { jokes, trivia, isLoading, fetchJokesTrivia } = useJokeTriviaStore();
  
  useEffect(() => {
    fetchJokesTrivia();
  }, [fetchJokesTrivia]);

  return (
    <>
      <Helmet>
        <title>Daily Jokes & Trivia | Dunkrow</title>
        <meta name="description" content="Brighten your day with our collection of jokes and expand your knowledge with interesting trivia." />
      </Helmet>

      <div className="min-h-screen pb-20">
        {/* Dynamic Hero Section */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 rounded-3xl mb-16 shadow-2xl">
          {/* Decorative Background Patterns */}
          <div className="absolute inset-0 opacity-10">
            <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                  <polygon points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2" fill="none" stroke="#fff" strokeWidth="1"/>
                  <polygon points="49.8,7.5 62.3,14.8 62.3,29.2 49.8,36.4 37.3,29.2 37.3,14.8" fill="none" stroke="#fff" strokeWidth="1"/>
                  <polygon points="-0.2,7.5 12.3,14.8 12.3,29.2 -0.2,36.4 -12.7,29.2 -12.7,14.8" fill="none" stroke="#fff" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
            </svg>
          </div>

          <div className="relative z-10 px-6 py-20 md:py-32 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            >
              <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
                <Sparkles className="text-yellow-400 mr-2" size={20} />
                <span className="text-white font-medium tracking-wide uppercase text-sm">Lighten Up Your Day</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-purple-200 mb-6 tracking-tight font-display drop-shadow-sm">
                News Digest & Analysis
              </h1>
              <p className="text-lg md:text-xl text-purple-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
                Take a break from the heavy headlines. Dive into our curated collection of witty jokes and mind-expanding trivia.
              </p>
            </motion.div>
          </div>
          
          {/* Wave transition at bottom of hero */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
            <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,115.15,198.81,104.9,240.59,98.66,281.8,77.22,321.39,56.44Z" className="fill-slate-50 dark:fill-slate-900"></path>
            </svg>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-24">
          
          {/* Daily Jokes Section */}
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center mb-10">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg mr-4 transform -rotate-6">
                <SmilePlus size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white font-display">
                  Daily Jokes
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">Guaranteed to make you smile.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : jokes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jokes.map((joke, index) => (
                  <motion.div
                    key={joke.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="h-full"
                  >
                    <JokeTriviaCard jokeTrivia={joke} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                <p className="text-lg text-neutral-500 dark:text-neutral-400">No jokes found today. Check back tomorrow!</p>
              </div>
            )}
          </motion.section>

          {/* Daily Trivia Section */}
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center mb-10">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl shadow-lg mr-4 transform rotate-6">
                <Lightbulb size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white font-display">
                  Daily Trivia
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">Expand your mind with fascinating facts.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : trivia.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trivia.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="h-full"
                  >
                    <JokeTriviaCard jokeTrivia={item} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                <p className="text-lg text-neutral-500 dark:text-neutral-400">No trivia found today. Check back tomorrow!</p>
              </div>
            )}
          </motion.section>

          {/* Premium Submission Form */}
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-neutral-900 dark:from-neutral-900 dark:to-black shadow-2xl"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-12 p-8 md:p-12 lg:p-16">
              <div className="flex-1 space-y-6 lg:pr-8">
                <div className="inline-flex p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-2">
                  <MessageSquareQuote className="text-red-400" size={32} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white font-display tracking-tight">
                  Have something to share?
                </h2>
                <p className="text-lg text-neutral-400 leading-relaxed">
                  Got a hilarious joke or a mind-blowing piece of trivia? Submit it to our editorial team! The best submissions get featured right here on Dunkrow.
                </p>
                
                <ul className="space-y-4 mt-8">
                  <li className="flex items-center text-neutral-300">
                    <Zap className="text-red-400 mr-3" size={20} />
                    Original content is preferred
                  </li>
                  <li className="flex items-center text-neutral-300">
                    <Zap className="text-red-400 mr-3" size={20} />
                    Keep it clean and family-friendly
                  </li>
                  <li className="flex items-center text-neutral-300">
                    <Zap className="text-red-400 mr-3" size={20} />
                    Provide a source for trivia if possible
                  </li>
                </ul>
              </div>

              <div className="flex-1">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                  <form className="space-y-5">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-neutral-300 mb-2">
                        Submission Type
                      </label>
                      <select 
                        id="type"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                      >
                        <option value="joke" className="bg-neutral-900">Joke</option>
                        <option value="trivia" className="bg-neutral-900">Trivia</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-neutral-300 mb-2">
                        Your Content
                      </label>
                      <textarea
                        id="content"
                        rows={4}
                        placeholder="Type your joke or trivia here..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        id="name"
                        placeholder="How should we credit you?"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    
                    <motion.button 
                      type="submit"
                      className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Submit for Review
                    </motion.button>
                  </form>
                </div>
              </div>
            </div>
          </motion.section>

        </div>
      </div>
    </>
  );
};

export default JokesTriviasPage;