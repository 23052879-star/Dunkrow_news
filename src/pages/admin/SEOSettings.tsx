import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { 
  Globe, 
  Save, 
  FileCode, 
  Download, 
  Check, 
  Info,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Card from '../../components/ui/Card';

interface SEOPanelData {
  defaultTitleTemplate: string;
  defaultMetaDescription: string;
  siteKeywords: string;
  canonicalBaseUrl: string;
  defaultOgImage: string;
  googleSearchConsoleVerification: string;
}

export const SEOSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SEOPanelData>({
    defaultValues: {
      defaultTitleTemplate: '%title% | Dunkrow Newspaper',
      defaultMetaDescription: 'The premium online newspaper presenting student scoops, Placement diaries, Campus insights and Technology trends.',
      siteKeywords: 'dunkrow, university news, student newspaper, placement diaries, campus gossip, tech insights',
      canonicalBaseUrl: 'https://dunkrow-news.netlify.app',
      defaultOgImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'
    }
  });

  const onSubmit = (data: SEOPanelData) => {
    setIsSaving(true);
    // Simulate API save
    setTimeout(() => {
      setIsSaving(false);
      alert('Global SEO settings applied successfully.');
    }, 1000);
  };

  const handleGenerateSitemap = async () => {
    try {
      const { data: articles } = await supabase
        .from('articles')
        .select('slug, updated_at')
        .eq('published', true);

      if (!articles) return;

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dunkrow-news.netlify.app/</loc>
    <priority>1.0</priority>
  </url>
  ${articles.map(art => `  <url>
    <loc>https://dunkrow-news.netlify.app/article/${art.slug}</loc>
    <lastmod>${new Date(art.updated_at).toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

      const blob = new Blob([sitemapXml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating sitemap:', err);
    }
  };

  const structuredDataSample = `{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Article Headline",
  "image": [
    "https://example.com/photos/1x1/photo.jpg"
  ],
  "datePublished": "2026-06-01T08:00:00+08:00",
  "dateModified": "2026-06-01T09:20:00+08:00",
  "author": [{
    "@type": "Person",
    "name": "Reporter Name",
    "url": "https://dunkrow-news.netlify.app/profile"
  }]
}`;

  return (
    <>
      <Helmet>
        <title>SEO Settings | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
              Global SEO Optimization Module <Globe className="text-red-500 ml-2" size={22} />
            </h1>
            <p className="text-gray-400 dark:text-neutral-500 text-xs mt-0.5">
              Configure search engine index definitions, meta descriptions, sitemaps and structured JSON-LD schema markup templates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main settings panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Title Tag Template"
                  placeholder="%title% | Dunkrow News"
                  error={errors.defaultTitleTemplate?.message}
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs font-mono"
                  {...register('defaultTitleTemplate', { required: 'Template title is required' })}
                />
                
                <TextArea
                  label="Default Meta Description"
                  placeholder="Summarize the core theme of your news platform..."
                  rows={3}
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs"
                  error={errors.defaultMetaDescription?.message}
                  {...register('defaultMetaDescription', { required: 'Meta description is required' })}
                />

                <Input
                  label="Meta Keywords (Comma separated)"
                  placeholder="campus news, placement stories..."
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs"
                  {...register('siteKeywords')}
                />

                <Input
                  label="Canonical Host Address"
                  placeholder="https://dunkrow-news.netlify.app"
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs font-mono"
                  {...register('canonicalBaseUrl')}
                />

                <Input
                  label="Default Social Share Image (OG:Image)"
                  placeholder="https://cdn.dunkrow.in/og.jpg"
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs"
                  {...register('defaultOgImage')}
                />

                <Input
                  label="Google Search Console ID"
                  placeholder="google-verification-code"
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs font-mono"
                  {...register('googleSearchConsoleVerification')}
                />

                <div className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex justify-end">
                  <Button type="submit" isLoading={isSaving} leftIcon={<Save size={16} />}>
                    Apply Global Config
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sitemap & Schemas */}
          <div className="space-y-6">
            {/* Sitemap card */}
            <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-200 dark:border-neutral-800 pb-2">
                <FileCode size={16} className="text-red-500 mr-2" /> XML Sitemap Generator
              </h3>
              <p className="text-gray-400 dark:text-neutral-500 text-xs leading-relaxed">
                Generate an XML sitemap of all active published news articles to submit to Google Search Console or Bing Webmaster.
              </p>
              
              <Button 
                variant="outline" 
                fullWidth
                className="border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:bg-neutral-950 flex justify-center"
                onClick={handleGenerateSitemap}
                leftIcon={<Download size={14} />}
              >
                Download sitemap.xml
              </Button>
            </Card>

            {/* JSON-LD card */}
            <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center border-b border-gray-200 dark:border-neutral-800 pb-2">
                <Info size={16} className="text-red-500 mr-2" /> Structured JSON-LD Templates
              </h3>
              <p className="text-gray-400 dark:text-neutral-500 text-xs leading-relaxed">
                Google uses JSON-LD schemas to display rich results in search results, including thumbnails, authors, and ratings.
              </p>
              
              <div className="relative">
                <pre className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 p-3.5 rounded-xl text-[9px] text-gray-500 dark:text-neutral-400 font-mono overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-neutral-800 leading-normal">
                  {structuredDataSample}
                </pre>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SEOSettings;
