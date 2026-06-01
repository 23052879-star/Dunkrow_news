import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Check, 
  Calendar, 
  Globe, 
  Sliders, 
  Tag as TagIcon,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useArticleStore } from '../../store/articleStore';
import { useSectionStore } from '../../store/sectionStore';
import { useAuth } from '../../contexts/AuthContext';
import RichTextEditor from '../../components/admin/RichTextEditor';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Card from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';

interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  sectionId: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledAt: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
}

const CATEGORIES = [
  'Politics',
  'Technology',
  'Business',
  'Sports',
  'Entertainment',
  'Science',
  'Health'
];

export const ArticleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sections, fetchSections } = useSectionStore();
  const { createArticle, updateArticle, fetchArticleBySlug, autoSaveArticle, error: storeError } = useArticleStore();

  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving' | 'error'>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<ArticleFormData>({
    defaultValues: {
      status: 'draft',
      featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
      category: 'Technology'
    }
  });

  const articleTitle = watch('title');
  const articleContent = watch('content');
  const articleStatus = watch('status');

  // Load categories and sections
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Load article if editing
  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      
      try {
        const { data: art, error } = await supabase
          .from('articles')
          .select('*, profiles(username)')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (art) {
          setValue('title', art.title);
          setValue('content', art.content);
          setValue('excerpt', art.excerpt);
          setValue('featuredImage', art.featured_image);
          setValue('category', art.category);
          setValue('slug', art.slug);
          setValue('sectionId', art.section_id || '');
          setValue('status', art.status || 'draft');
          setValue('scheduledAt', art.scheduled_at ? new Date(art.scheduled_at).toISOString().slice(0, 16) : '');
          setValue('seoTitle', art.seo_title || '');
          setValue('metaDescription', art.meta_description || '');
          setValue('canonicalUrl', art.canonical_url || '');

          // Fetch tags
          const { data: tagsData } = await supabase
            .from('article_tags')
            .select('tags(name)')
            .eq('article_id', id);
            
          if (tagsData) {
            setTags(tagsData.map((t: any) => t.tags.name));
          }
        }
      } catch (err) {
        console.error('Error loading article:', err);
      }
    };
    loadArticle();
  }, [id, setValue]);

  // Auto-save setup (every 30 seconds for drafts)
  useEffect(() => {
    if (!id || articleStatus !== 'draft' || !articleContent) return;

    autoSaveTimerRef.current = setInterval(async () => {
      setSaveStatus('saving');
      const success = await autoSaveArticle(id, articleContent);
      setSaveStatus(success ? 'saved' : 'error');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [id, articleContent, articleStatus, autoSaveArticle]);

  // Auto-generate slug from title
  useEffect(() => {
    if (id || !articleTitle) return;
    const generatedSlug = articleTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setValue('slug', generatedSlug);
  }, [articleTitle, id, setValue]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const saveArticleTags = async (articleId: string) => {
    // 1. Clear existing tags
    await supabase.from('article_tags').delete().eq('article_id', articleId);
    
    // 2. Insert new tags
    for (const tagName of tags) {
      const slug = tagName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Upsert tag
      let { data: tagRow } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (!tagRow) {
        const { data: insertedTag } = await supabase
          .from('tags')
          .insert({ name: tagName, slug })
          .select('id')
          .single();
        tagRow = insertedTag;
      }

      if (tagRow) {
        await supabase
          .from('article_tags')
          .insert({ article_id: articleId, tag_id: tagRow.id });
      }
    }
  };

  const onSubmit = async (data: ArticleFormData) => {
    setIsSaving(true);
    setSaveStatus('saving');
    setErrorText(null);
    
    try {
      const dbArticle = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage,
        category: data.category,
        slug: data.slug,
        sectionId: data.sectionId || undefined,
        status: data.status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
        seoTitle: data.seoTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        canonicalUrl: data.canonicalUrl || undefined,
        authorId: user?.id || 'current-user-id'
      };

      let savedArticleId = id;

      if (id) {
        const updated = await updateArticle(id, dbArticle);
        if (!updated) throw new Error(storeError || 'Failed to update article');
      } else {
        const created = await createArticle(dbArticle);
        if (!created) throw new Error(storeError || 'Failed to create article');
        savedArticleId = created.id;
      }

      if (savedArticleId) {
        await saveArticleTags(savedArticleId);
      }

      setSaveStatus('saved');
      setTimeout(() => {
        navigate('/admin/articles');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'An unexpected database error occurred while saving the article.');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{id ? 'Edit Article' : 'New Article'} | Dunkrow Editor</title>
      </Helmet>

      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link to="/admin/articles" className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {id ? 'Edit Article' : 'New Article'}
              </h1>
              <p className="text-neutral-500 text-xs mt-0.5">
                {saveStatus === 'saving' && 'Saving draft...'}
                {saveStatus === 'saved' && 'All changes saved to database'}
                {saveStatus === 'error' && 'Failed to save changes'}
                {saveStatus === 'idle' && id && 'Autosave active'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-900"
              leftIcon={<Eye size={16} />}
            >
              {isPreview ? 'Back to Editor' : 'Preview Mode'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const currentStatus = watch('status');
                if (!id && currentStatus === 'draft') {
                  setValue('status', 'published');
                }
                handleSubmit(onSubmit)();
              }}
              isLoading={isSaving}
              leftIcon={<Save size={16} />}
            >
              {id ? 'Save Updates' : 'Publish Article'}
            </Button>
          </div>
        </div>

        {errorText && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Error Saving Article</h4>
              <p className="mt-1 text-xs opacity-90">{errorText}</p>
            </div>
          </div>
        )}

        {isPreview ? (
          /* Preview Canvas */
          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-6 sm:p-12 max-w-4xl mx-auto space-y-6 min-h-[500px]">
            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
              {watch('category')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {watch('title') || 'Untitled Article'}
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed italic border-l-2 border-neutral-700 pl-4">
              {watch('excerpt') || 'No excerpt written yet.'}
            </p>
            {watch('featuredImage') && (
              <img 
                src={watch('featuredImage')} 
                alt="Featured preview" 
                className="w-full h-80 object-cover rounded-xl border border-neutral-850"
              />
            )}
            <div 
              className="prose prose-invert max-w-none text-neutral-300 leading-relaxed text-sm pt-4"
              dangerouslySetInnerHTML={{ __html: watch('content') || '<i>No body content written yet.</i>' }}
            />
          </div>
        ) : (
          /* Editing Panel */
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editor main panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-neutral-900/40 border-neutral-850">
                <div className="space-y-4">
                  <Input
                    label="Article Title"
                    placeholder="Enter an attention-grabbing headline..."
                    error={errors.title?.message}
                    className="bg-neutral-950 border-neutral-850 text-white placeholder-neutral-600 text-lg font-bold"
                    {...register('title', { required: 'Title is required' })}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-neutral-400 mb-1">
                      Body Content
                    </label>
                    <Controller
                      name="content"
                      control={control}
                      rules={{ required: 'Body content is required' }}
                      render={({ field }) => (
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Compose your news story..."
                        />
                      )}
                    />
                    {errors.content && (
                      <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
                    )}
                  </div>

                  <TextArea
                    label="Article Excerpt / Summary"
                    rows={3}
                    placeholder="Write a brief, compelling introduction summary for the homepage card..."
                    className="bg-neutral-950 border-neutral-850 text-white text-sm"
                    error={errors.excerpt?.message}
                    {...register('excerpt', { required: 'Excerpt is required' })}
                  />
                </div>
              </Card>
            </div>

            {/* Sidebar metadata panel */}
            <div className="space-y-6">
              {/* Publication controls */}
              <Card className="bg-neutral-900/40 border-neutral-850">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center border-b border-neutral-800 pb-2">
                  <Sliders size={16} className="text-red-500 mr-2" /> Publication Info
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {articleStatus === 'scheduled' && (
                    <Input
                      type="datetime-local"
                      label="Publish Schedule Date"
                      error={errors.scheduledAt?.message}
                      className="bg-neutral-950 border-neutral-850 text-white"
                      {...register('scheduledAt', { required: 'Schedule time is required for scheduled posts' })}
                    />
                  )}

                  <Input
                    label="Slug (URL Path)"
                    placeholder="article-url-path"
                    error={errors.slug?.message}
                    className="bg-neutral-950 border-neutral-850 text-white font-mono text-xs"
                    {...register('slug', { required: 'Slug is required' })}
                  />

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      CMS Section (Dynamic Layout)
                    </label>
                    <select
                      {...register('sectionId')}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none"
                    >
                      <option value="">No Custom Section (Default)</option>
                      {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                    </select>
                  </div>
                </div>
              </Card>

              {/* Media & Tags */}
              <Card className="bg-neutral-900/40 border-neutral-850">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center border-b border-neutral-800 pb-2">
                  <TagIcon size={16} className="text-red-500 mr-2" /> Media & Tags
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Featured Image URL"
                    placeholder="https://unsplash.com/..."
                    error={errors.featuredImage?.message}
                    className="bg-neutral-950 border-neutral-850 text-white text-xs"
                    {...register('featuredImage', { required: 'Featured image URL is required' })}
                  />

                  {/* Tags module */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Article Tags (Press Enter)
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      placeholder="Add tag and hit Enter..."
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map(tag => (
                        <span key={tag} className="flex items-center space-x-1 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
                          <span>{tag}</span>
                          <button 
                            type="button" 
                            onClick={() => removeTag(tag)}
                            className="text-neutral-500 hover:text-red-500 text-[10px] font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* SEO Module */}
              <Card className="bg-neutral-900/40 border-neutral-850">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center border-b border-neutral-800 pb-2">
                  <Globe size={16} className="text-red-500 mr-2" /> SEO Optimization
                </h3>

                <div className="space-y-4">
                  <Input
                    label="SEO Search Title"
                    placeholder="Custom Google result title..."
                    className="bg-neutral-950 border-neutral-850 text-white text-xs"
                    {...register('seoTitle')}
                  />

                  <TextArea
                    label="Meta Description"
                    placeholder="Custom snippet description for search engine summary index..."
                    rows={3}
                    className="bg-neutral-950 border-neutral-850 text-white text-xs"
                    {...register('metaDescription')}
                  />

                  <Input
                    label="Canonical Link"
                    placeholder="https://dunkrow.in/..."
                    className="bg-neutral-950 border-neutral-850 text-white text-xs font-mono"
                    {...register('canonicalUrl')}
                  />
                </div>
              </Card>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default ArticleEditor;
