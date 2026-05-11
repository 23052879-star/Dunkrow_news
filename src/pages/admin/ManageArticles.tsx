import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { useArticleStore } from '../../store/articleStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Card from '../../components/ui/Card';

interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  slug: string;
  published: boolean;
}

const ManageArticles: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const { articles, isLoading, fetchArticles, createArticle, updateArticle, deleteArticle } = useArticleStore();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ArticleFormData>();

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleEdit = (article: any) => {
    setSelectedArticle(article.id);
    setIsEditing(true);
    setValue('title', article.title);
    setValue('content', article.content);
    setValue('excerpt', article.excerpt);
    setValue('featuredImage', article.featuredImage);
    setValue('category', article.category);
    setValue('slug', article.slug);
    setValue('published', article.published);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await deleteArticle(id);
    }
  };

  const onSubmit = async (data: ArticleFormData) => {
    if (selectedArticle) {
      await updateArticle(selectedArticle, data);
    } else {
      await createArticle({
        ...data,
        authorId: 'current-user-id', // Replace with actual user ID
      });
    }
    reset();
    setIsEditing(false);
    setSelectedArticle(null);
  };

  return (
    <>
      <Helmet>
        <title>Manage Articles | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Manage Articles
          </h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Plus size={16} />}>
              New Article
            </Button>
          )}
        </div>

        {isEditing ? (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {selectedArticle ? 'Edit Article' : 'New Article'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedArticle(null);
                  reset();
                }}
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Title"
                error={errors.title?.message}
                {...register('title', { required: 'Title is required' })}
              />

              <TextArea
                label="Content"
                rows={10}
                error={errors.content?.message}
                {...register('content', { required: 'Content is required' })}
              />

              <TextArea
                label="Excerpt"
                rows={3}
                error={errors.excerpt?.message}
                {...register('excerpt', { required: 'Excerpt is required' })}
              />

              <Input
                label="Featured Image URL"
                error={errors.featuredImage?.message}
                {...register('featuredImage', { required: 'Featured image is required' })}
              />

              <Input
                label="Category"
                error={errors.category?.message}
                {...register('category', { required: 'Category is required' })}
              />

              <Input
                label="Slug"
                error={errors.slug?.message}
                {...register('slug', { required: 'Slug is required' })}
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  {...register('published')}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="published" className="text-sm text-neutral-700 dark:text-neutral-300">
                  Published
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedArticle(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedArticle ? 'Update Article' : 'Create Article'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="h-24 animate-pulse" />
                ))}
              </div>
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <Card key={article.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                      {article.title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(article)}
                      aria-label="Edit article"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(article.id)}
                      aria-label="Delete article"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-center text-neutral-600 dark:text-neutral-400">
                  No articles found
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ManageArticles;