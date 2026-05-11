import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { User, Camera, Mail, Calendar, Shield, Link as LinkIcon, Upload, X, Check, MapPin, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileFormData {
  username: string;
  avatarUrl: string;
  bio: string;
  website: string;
  location: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [joinDate, setJoinDate] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileFormData>();
  const avatarUrl = watch('avatarUrl');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setValue('username', data.username);
          setValue('avatarUrl', data.avatar_url || '');
          setValue('bio', data.bio || '');
          setValue('website', data.website || '');
          setValue('location', data.location || '');
          setJoinDate(new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfileData();
  }, [user, setValue]);

  const handleImageUpload = async (file: File) => {
    if (!user?.id) return;

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setValue('avatarUrl', publicUrl);
      setPreviewImage(publicUrl);
      setShowImageOptions(false);
      
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleUrlSubmit = (url: string) => {
    if (url.trim()) {
      setValue('avatarUrl', url.trim());
      setPreviewImage(url.trim());
      setShowImageOptions(false);
    }
  };

  const removeImage = () => {
    setValue('avatarUrl', '');
    setPreviewImage(null);
    setShowImageOptions(false);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          avatar_url: data.avatarUrl,
          bio: data.bio,
          website: data.website,
          location: data.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const currentAvatarUrl = previewImage || avatarUrl || user?.avatarUrl;

  return (
    <>
      <Helmet>
        <title>Profile Settings | Dunkrow</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 pt-10">
        <motion.div 
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight mb-2">
              Account Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your profile, preferences, and security.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 sticky top-32">
                <nav className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-medium ${
                      activeTab === 'profile' 
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <User size={18} className="mr-3" />
                    Public Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-medium ${
                      activeTab === 'security' 
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Shield size={18} className="mr-3" />
                    Account Security
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700"
                  >
                    {/* Alerts */}
                    <AnimatePresence>
                      {successMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="mb-8 p-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-2xl flex items-center font-medium"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center mr-3">
                            <Check size={18} />
                          </div>
                          {successMessage}
                        </motion.div>
                      )}

                      {errorMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="mb-8 p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-2xl flex items-center font-medium"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center mr-3">
                            <X size={18} />
                          </div>
                          {errorMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Profile Header section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-12 pb-12 border-b border-slate-100 dark:border-slate-700">
                      <div className="relative group">
                        <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-red-600 to-purple-600 shadow-lg">
                          <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 overflow-hidden">
                            {currentAvatarUrl ? (
                              <img 
                                src={currentAvatarUrl} 
                                alt={user?.username} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                                <User size={48} className="text-slate-400" />
                              </div>
                            )}
                          </div>
                          {isUploadingImage && (
                            <div className="absolute inset-1 bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowImageOptions(!showImageOptions)}
                          className="absolute bottom-2 right-2 p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:bg-slate-800 transition-colors shadow-lg border-2 border-white dark:border-slate-800"
                          disabled={isUploadingImage}
                        >
                          <Camera size={16} />
                        </motion.button>
                      </div>

                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-2">
                          {watch('username') || user?.username}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2 text-slate-400" />
                            {user?.email}
                          </div>
                          <div className="flex items-center">
                            <Shield size={16} className="mr-2 text-red-500" />
                            <span className="text-red-500">
                              {user?.role === 'admin' ? 'Administrator' : 'Verified Reader'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-slate-400" />
                            Joined {joinDate}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Upload Options */}
                    <AnimatePresence>
                      {showImageOptions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-8 overflow-hidden"
                        >
                          <div className="p-6 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-200 dark:border-slate-600">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex items-center justify-center px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium transition-transform hover:scale-[1.02]"
                                disabled={isUploadingImage}
                              >
                                <Upload size={18} className="mr-2" />
                                Upload New Image
                              </button>
                              
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  placeholder="Or paste image URL..."
                                  className="w-full h-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleUrlSubmit((e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-4 gap-3">
                              {currentAvatarUrl && (
                                <button
                                  onClick={removeImage}
                                  className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  Remove Image
                                </button>
                              )}
                              <button
                                onClick={() => setShowImageOptions(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Username */}
                        <div>
                          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                            Username
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <User className="text-slate-400" size={18} />
                            </div>
                            <input
                              type="text"
                              className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border ${errors.username ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all`}
                              {...register('username', {
                                required: 'Username is required',
                                minLength: { value: 3, message: 'Must be at least 3 characters' },
                                maxLength: { value: 20, message: 'Cannot exceed 20 characters' }
                              })}
                            />
                          </div>
                          {errors.username && <p className="mt-2 text-sm text-red-500">{errors.username.message}</p>}
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                            Location
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <MapPin className="text-slate-400" size={18} />
                            </div>
                            <input
                              type="text"
                              placeholder="City, Country"
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                              {...register('location')}
                            />
                          </div>
                        </div>

                        {/* Website */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                            Website / Social Link
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <LinkIcon className="text-slate-400" size={18} />
                            </div>
                            <input
                              type="url"
                              placeholder="https://yourwebsite.com"
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                              {...register('website')}
                            />
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2 flex justify-between">
                            <span>About Me</span>
                            <span className="text-slate-400 font-normal">{watch('bio')?.length || 0}/500</span>
                          </label>
                          <div className="relative">
                            <div className="absolute top-4 left-4 pointer-events-none">
                              <Edit3 className="text-slate-400" size={18} />
                            </div>
                            <textarea
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                              rows={5}
                              placeholder="Share a bit about yourself, your interests, and what you read..."
                              maxLength={500}
                              {...register('bio')}
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          {isLoading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Saving...
                            </div>
                          ) : (
                            'Save Profile Changes'
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 text-center py-20"
                  >
                    <Shield className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Security</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                      You are currently signed in via Google OAuth. Password changes and security settings are managed through your Google Account.
                    </p>
                    <a 
                      href="https://myaccount.google.com/security" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform"
                    >
                      Manage Google Account
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </>
  );
};

export default ProfilePage;