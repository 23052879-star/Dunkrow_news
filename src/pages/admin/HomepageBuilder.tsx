import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { 
  Sliders, 
  Save, 
  Newspaper, 
  Flame, 
  HelpCircle,
  AlertTriangle,
  Star,
  CheckCircle,
  Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useArticleStore } from '../../store/articleStore';
import { useSectionStore } from '../../store/sectionStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

interface HomepageConfigForm {
  featuredArticleId: string;
  breakingNews: string;
  isBreakingActive: boolean;
  editorsPick1: string;
  editorsPick2: string;
  editorsPick3: string;
}

export const HomepageBuilder: React.FC = () => {
  const { articles, fetchAllArticles } = useArticleStore();
  const { sections, fetchSections } = useSectionStore();
  const [isSaving, setIsSaving] = useState(false);
  const [configId, setConfigId] = useState<string>('00000000-0000-0000-0000-000000000000');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<HomepageConfigForm>();

  useEffect(() => {
    fetchAllArticles();
    fetchSections();
  }, [fetchAllArticles, fetchSections]);

  // Load existing homepage config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_config')
          .select('*')
          .eq('id', configId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setValue('featuredArticleId', data.featured_article_id || '');
          setValue('breakingNews', data.breaking_news || '');
          
          const picks = (typeof data.editors_picks === 'string' ? JSON.parse(data.editors_picks) : data.editors_picks) || [];
          setValue('editorsPick1', picks[0] || '');
          setValue('editorsPick2', picks[1] || '');
          setValue('editorsPick3', picks[2] || '');
        }
      } catch (err) {
        console.error('Error loading homepage config:', err);
      }
    };
    loadConfig();
  }, [setValue, configId]);

  const onSubmit = async (data: HomepageConfigForm) => {
    setIsSaving(true);
    try {
      const picks = [data.editorsPick1, data.editorsPick2, data.editorsPick3].filter(Boolean);
      
      const { error } = await supabase
        .from('homepage_config')
        .upsert({
          id: configId,
          featured_article_id: data.featuredArticleId || null,
          breaking_news: data.breakingNews || null,
          editors_picks: JSON.stringify(picks),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Homepage layout configurations saved successfully.');
    } catch (err) {
      console.error('Error saving homepage builder layout:', err);
      alert('Failed to save configurations.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeArticles = articles.filter(a => a.status === 'published');

  return (
    <>
      <Helmet>
        <title>Homepage Builder | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
              Homepage Layout Builder <Sliders className="text-red-500 ml-2" size={22} />
            </h1>
            <p className="text-neutral-500 text-xs mt-0.5">
              Select key hero features, control breaking news marquee scopes, pin editor picks and manage section segments.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main layouts section */}
          <div className="lg:col-span-2 space-y-6">
            {/* HERO SELECTOR */}
            <Card className="bg-neutral-900/40 border-neutral-850 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center border-b border-neutral-850 pb-2">
                <Star size={16} className="text-amber-500 mr-2" /> Primary Featured Hero Story
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Choose the primary article that will feature as the large visual headline hero element on the top segment of the landing page.
              </p>
              
              <div className="space-y-1">
                <select
                  {...register('featuredArticleId')}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none"
                >
                  <option value="">No Featured Hero (Defaults to latest published)</option>
                  {activeArticles.map(a => (
                    <option key={a.id} value={a.id}>{a.title} ({a.category})</option>
                  ))}
                </select>
              </div>
            </Card>

            {/* BREAKING NEWS MARQUEE */}
            <Card className="bg-neutral-900/40 border-neutral-850 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center border-b border-neutral-850 pb-2">
                <Flame size={16} className="text-red-500 mr-2" /> Live Breaking News Banner
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Add an urgent banner alert at the very top of the homepage to broadcast flash updates. Leave empty to hide the marquee.
              </p>
              
              <Input
                label="Alert Text"
                placeholder="e.g. Breaking: ISRO slated to launch Lunar Sample Return mission Chandrayaan-4 in 2028!"
                className="bg-neutral-950 border-neutral-850 text-white"
                {...register('breakingNews')}
              />
            </Card>

            {/* EDITORS PICKS LIST */}
            <Card className="bg-neutral-900/40 border-neutral-850 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center border-b border-neutral-850 pb-2">
                <CheckCircle size={16} className="text-green-500 mr-2" /> Editor's Picks Curations
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Curate up to three articles that display as highlighted cards on the trending section sidebar of the landing page.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Spotlight Pick 1</label>
                  <select
                    {...register('editorsPick1')}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none"
                  >
                    <option value="">Select pick article...</option>
                    {activeArticles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Spotlight Pick 2</label>
                  <select
                    {...register('editorsPick2')}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none"
                  >
                    <option value="">Select pick article...</option>
                    {activeArticles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Spotlight Pick 3</label>
                  <select
                    {...register('editorsPick3')}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none"
                  >
                    <option value="">Select pick article...</option>
                    {activeArticles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Builder controls */}
          <div className="space-y-6">
            <Card className="bg-neutral-900/60 border-neutral-850 p-6 flex flex-col justify-between min-h-[250px]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-850 pb-2 mb-4">
                  Layout Controls
                </h3>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Apply updates to homepage Hero spotlight configurations, editor picks grids and breaking news channels instantly.
                </p>
              </div>

              <div className="pt-6 border-t border-neutral-800">
                <Button type="submit" isLoading={isSaving} fullWidth leftIcon={<Save size={16} />}>
                  Publish Homepage Layout
                </Button>
              </div>
            </Card>

            <Card className="bg-neutral-900/40 border-neutral-850 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center border-b border-neutral-850 pb-2">
                <Eye size={16} className="text-blue-500 mr-2" /> Sections Sequence
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                To adjust the order in which category sections display on the homepage, go to the 
                <Link to="/admin/sections" className="text-red-500 hover:text-red-400 font-bold ml-1">
                  Dynamic Section Builder
                </Link>.
              </p>
            </Card>
          </div>
        </form>
      </div>
    </>
  );
};

export default HomepageBuilder;
