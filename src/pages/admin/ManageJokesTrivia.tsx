import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Pencil, Trash2, Plus, X, SmilePlus, Lightbulb } from 'lucide-react';
import { useJokeTriviaStore } from '../../store/jokeTriviaStore';
import Button from '../../components/ui/Button';
import TextArea from '../../components/ui/TextArea';
import Card from '../../components/ui/Card';

interface JokeTriviaFormData {
  content: string;
  type: 'joke' | 'trivia';
  published: boolean;
}

const ManageJokesTrivia: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { jokesTrivia, isLoading, fetchJokesTrivia, createJokeTrivia, updateJokeTrivia, deleteJokeTrivia } = useJokeTriviaStore();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JokeTriviaFormData>();

  useEffect(() => {
    fetchJokesTrivia();
  }, [fetchJokesTrivia]);

  const handleEdit = (item: any) => {
    setSelectedItem(item.id);
    setIsEditing(true);
    setValue('content', item.content);
    setValue('type', item.type);
    setValue('published', item.published);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteJokeTrivia(id);
    }
  };

  const onSubmit = async (data: JokeTriviaFormData) => {
    if (selectedItem) {
      await updateJokeTrivia(selectedItem, data);
    } else {
      await createJokeTrivia(data);
    }
    reset();
    setIsEditing(false);
    setSelectedItem(null);
  };

  return (
    <>
      <Helmet>
        <title>Manage Jokes & Trivia | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Manage Jokes & Trivia
          </h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Plus size={16} />}>
              New Entry
            </Button>
          )}
        </div>

        {isEditing ? (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {selectedItem ? 'Edit Entry' : 'New Entry'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedItem(null);
                  reset();
                }}
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Type
                </label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="block w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white"
                >
                  <option value="joke">Joke</option>
                  <option value="trivia">Trivia</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <TextArea
                label="Content"
                rows={6}
                error={errors.content?.message}
                {...register('content', { required: 'Content is required' })}
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
                    setSelectedItem(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedItem ? 'Update Entry' : 'Create Entry'}
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
            ) : jokesTrivia.length > 0 ? (
              jokesTrivia.map((item) => (
                <Card key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      item.type === 'joke'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                    }`}>
                      {item.type === 'joke' ? <SmilePlus size={20} /> : <Lightbulb size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </p>
                      <p className="text-neutral-900 dark:text-white line-clamp-1">
                        {item.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                      aria-label="Edit entry"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete entry"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-center text-neutral-600 dark:text-neutral-400">
                  No entries found
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ManageJokesTrivia;