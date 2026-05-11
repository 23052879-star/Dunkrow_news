import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { useWhisperStore } from '../../store/whisperStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Card from '../../components/ui/Card';

interface WhisperFormData {
  title: string;
  content: string;
  featuredImage: string;
  published: boolean;
}

const ManageWhispers: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWhisper, setSelectedWhisper] = useState<string | null>(null);
  const { whispers, isLoading, fetchWhispers, createWhisper, updateWhisper, deleteWhisper } = useWhisperStore();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<WhisperFormData>();

  useEffect(() => {
    fetchWhispers();
  }, [fetchWhispers]);

  const handleEdit = (whisper: any) => {
    setSelectedWhisper(whisper.id);
    setIsEditing(true);
    setValue('title', whisper.title);
    setValue('content', whisper.content);
    setValue('featuredImage', whisper.featuredImage);
    setValue('published', whisper.published);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this whisper?')) {
      await deleteWhisper(id);
    }
  };

  const onSubmit = async (data: WhisperFormData) => {
    if (selectedWhisper) {
      await updateWhisper(selectedWhisper, data);
    } else {
      await createWhisper(data);
    }
    reset();
    setIsEditing(false);
    setSelectedWhisper(null);
  };

  const isWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  };

  return (
    <>
      <Helmet>
        <title>Manage Weekend Whispers | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Manage Weekend Whispers
          </h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Plus size={16} />}>
              New Whisper
            </Button>
          )}
        </div>

        {!isWeekend() && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
            Note: Weekend Whispers are only visible to users on Saturdays and Sundays
          </div>
        )}

        {isEditing ? (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {selectedWhisper ? 'Edit Whisper' : 'New Whisper'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedWhisper(null);
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

              <Input
                label="Featured Image URL"
                error={errors.featuredImage?.message}
                {...register('featuredImage', { required: 'Featured image is required' })}
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
                    setSelectedWhisper(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedWhisper ? 'Update Whisper' : 'Create Whisper'}
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
            ) : whispers.length > 0 ? (
              whispers.map((whisper) => (
                <Card key={whisper.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                      {whisper.title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {new Date(whisper.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(whisper)}
                      aria-label="Edit whisper"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(whisper.id)}
                      aria-label="Delete whisper"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-center text-neutral-600 dark:text-neutral-400">
                  No whispers found
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ManageWhispers;