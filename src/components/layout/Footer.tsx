import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Instagram, Twitter, Facebook, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-slate-50 to-white dark:from-neutral-900 dark:to-black text-slate-900 dark:text-white pt-20 pb-8 overflow-hidden transition-colors duration-500 border-t border-slate-200 dark:border-transparent">
      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-80"></div>
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative container mx-auto px-4 max-w-screen-2xl z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <motion.div 
            className="col-span-1 md:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="flex items-center group">
              <img 
                src="/logo.jpg" 
                alt="Dunkrow Logo" 
                className="h-10 w-10 object-contain rounded-lg"
              />
              <span className="ml-3 text-2xl font-bold tracking-wide font-display text-slate-900 dark:text-white">DUNKROW</span>
            </Link>
            <p className="mt-4 text-slate-600 dark:text-neutral-400 text-sm">
              Dunkrow stands as the world's leading digital news platform, delivering award-winning investigative journalism, real-time breaking news coverage, and expert analysis across global affairs. Our commitment to factual reporting, editorial independence, and journalistic excellence has earned the trust of millions of readers worldwide. From political developments and economic trends to technological innovations and cultural shifts, we provide comprehensive coverage that informs, educates, and empowers our global audience.
            </p>
            <div className="mt-6 flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-white hover:bg-red-600 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-white hover:bg-red-600 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-white hover:bg-red-600 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </motion.div>
          
          {/* About Us */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4 font-display text-slate-900 dark:text-white">About Dunkrow</h3>
            <p className="text-slate-600 dark:text-neutral-400 text-sm mb-4">
              Founded on principles of journalistic integrity and editorial independence, Dunkrow represents the evolution of modern news media. Our award-winning newsroom combines traditional investigative journalism with cutting-edge digital technology to deliver unparalleled news coverage. We specialize in breaking news alerts, in-depth political analysis, technology reporting, business intelligence, sports coverage, entertainment news, health journalism, and scientific discoveries. Our global network of correspondents and expert analysts ensures comprehensive coverage of international affairs, local news, and trending stories that shape our world.
            </p>
            <p className="text-slate-600 dark:text-neutral-400 text-sm">
              With real-time news updates, fact-checked reporting, and expert commentary, Dunkrow serves as your essential source for credible journalism in an era of information overload. Our commitment to truth, transparency, and public service journalism drives everything we do.
            </p>
          </motion.div>
          
          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4 font-display text-slate-900 dark:text-white">News Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/category/politics" className="text-slate-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Politics
                </Link>
              </li>
              <li>
                <Link to="/category/technology" className="text-slate-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/category/business" className="text-slate-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Business
                </Link>
              </li>
              <li>
                <Link to="/category/sports" className="text-slate-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/category/entertainment" className="text-slate-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Entertainment
                </Link>
              </li>
              <li>
                <Link to="/category/health" className="text-slate-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Health
                </Link>
              </li>
              <li>
                <Link to="/whispers" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  Investigative Reports
                </Link>
              </li>
              <li>
                <Link to="/jokes-trivia" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                  News Analysis
                </Link>
              </li>
            </ul>
          </motion.div>
          
          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4 font-display text-slate-900 dark:text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-slate-600 dark:text-neutral-400 group">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center mr-3 group-hover:bg-red-600/20 group-hover:text-red-500 transition-colors">
                  <Mail size={14} />
                </div>
                <a href="mailto:dunkrow21@gmail.com" className="hover:text-white transition-colors">
                  dunkrow21@gmail.com
                </a>
              </li>
              <li className="flex items-center text-slate-600 dark:text-neutral-400 group">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center mr-3 group-hover:bg-red-600/20 group-hover:text-red-500 transition-colors">
                  <Phone size={14} />
                </div>
                <a href="tel:+917633880806" className="hover:text-white transition-colors">
                  +91 76338 80806
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-slate-500 dark:text-neutral-400 text-sm">
                For press inquiries, news tips, editorial submissions, partnership opportunities, or technical support, our dedicated team is available 24/7 to assist you.
              </p>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-12 pt-8 border-t border-slate-200 dark:border-neutral-800 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-slate-500 dark:text-neutral-500 text-sm">
            © {currentYear} Dunkrow Global News Platform. All rights reserved.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400 dark:text-neutral-600">
            <a href="#" className="hover:text-red-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-red-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-red-500 transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-red-500 transition-colors">Editorial Guidelines</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;