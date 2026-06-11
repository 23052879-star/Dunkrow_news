import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Smile, 
  X, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useJokeTriviaStore } from '../../store/jokeTriviaStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import TextArea from '../../components/ui/TextArea';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

interface JokeTriviaFormData {
  content: string;
  type: 'joke' | 'trivia';
  published: boolean;
}

export const ManageJokesTrivia: React.FC = () => {
  const { 
    jokesTrivia, 
    isLoading, 
    fetchAllJokesTrivia, 
    createJokeTrivia, 
    updateJokeTrivia, 
    deleteJokeTrivia 
  } = useJokeTriviaStore();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'all' | 'jokes' | 'trivia'>('all');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JokeTriviaFormData>({
    defaultValues: {
      type: 'joke',
      published: true
    }
  });

  useEffect(() => {
    fetchAllJokesTrivia();
  }, [fetchAllJokesTrivia]);

  const handleEdit = (item: any) => {
    setSelectedId(item.id);
    setIsEditing(true);
    setValue('content', item.content);
    setValue('type', item.type);
    setValue('published', item.published);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteJokeTrivia(deleteId);
      setDeleteId(null);
    }
  };

  const onSubmit = async (data: JokeTriviaFormData) => {
    if (selectedId) {
      await updateJokeTrivia(selectedId, data);
    } else {
      await createJokeTrivia(data);
    }
    
    reset({
      content: '',
      type: 'joke',
      published: true
    });
    setIsEditing(false);
    setSelectedId(null);
  };

  // Tab Filtering
  const filteredItems = jokesTrivia.filter(item => {
    if (currentTab === 'jokes') return item.type === 'joke';
    if (currentTab === 'trivia') return item.type === 'trivia';
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Manage Jokes & Trivia | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
              Jokes & Trivia Directory
            </h1>
            <p className="text-gray-400 dark:text-neutral-500 text-xs mt-0.5">
              Create, organize, and publish lighthearted content blocks for readers.
            </p>
          </div>
          
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Plus size={16} />}>
              Create New Block
            </Button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap border-b border-gray-200 dark:border-neutral-800 gap-1">
          {([
            { id: 'all', label: 'All Content' },
            { id: 'jokes', label: 'Jokes Only' },
            { id: 'trivia', label: 'Trivia Scoops' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                currentTab === tab.id
                  ? 'border-red-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white'
              }`}
            >
              {tab.label} ({
                tab.id === 'all' ? jokesTrivia.length : 
                jokesTrivia.filter(j => j.type === (tab.id === 'jokes' ? 'joke' : 'trivia')).length
              })
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                  <span className="text-gray-400 dark:text-neutral-500 text-xs">Querying directories...</span>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-950/80 hover:border-gray-300 dark:border-neutral-700 transition-all group"
                    >
                      <div className="flex items-center space-x-4 overflow-hidden pr-4">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center text-gray-900 dark:text-white ${
                          item.type === 'joke' 
                            ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' 
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {item.type === 'joke' ? <Smile size={18} /> : <HelpCircle size={18} />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-neutral-200 text-xs sm:text-sm line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3.5 flex-shrink-0">
                        {item.published ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/10 border border-green-500/20 text-green-500 uppercase tracking-wide">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-400 dark:text-neutral-500 uppercase tracking-wide">
                            Draft
                          </span>
                        )}

                        <div className="flex items-center space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white"
                            onClick={() => handleEdit(item)}
                            aria-label="Edit block"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 dark:text-neutral-500 hover:text-red-500"
                            onClick={() => setDeleteId(item.id)}
                            aria-label="Delete block"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-2">
                  <Smile size={40} className="text-neutral-700 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-500 dark:text-neutral-400">No Content Found</h3>
                  <p className="text-neutral-600 text-xs">Write your first joke or fact scoop using the builder.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Builder Panel */}
          <div>
            {isEditing ? (
              <Card className="bg-white dark:bg-neutral-900/60 border-gray-200 dark:border-neutral-800 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {selectedId ? 'Edit Content Block' : 'New Content Block'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedId(null);
                      reset({
                        content: '',
                        type: 'joke',
                        published: true
                      });
                    }}
                    className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                      Block Type
                    </label>
                    <select
                      {...register('type')}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-700 dark:text-neutral-300 focus:outline-none"
                    >
                      <option value="joke">Joke / Riddle</option>
                      <option value="trivia">Fact / Trivia Scoop</option>
                    </select>
                  </div>

                  <TextArea
                    label="Content Text"
                    placeholder="Enter the joke or interesting trivia details..."
                    rows={6}
                    error={errors.content?.message}
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white"
                    {...register('content', { required: 'Content is required' })}
                  />

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="published"
                      {...register('published')}
                      className="rounded border-gray-200 dark:border-neutral-800 text-red-600 focus:ring-red-500 bg-gray-50 dark:bg-neutral-950 w-4.5 h-4.5"
                    />
                    <label htmlFor="published" className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wide">
                      Show immediately in floating scopes
                    </label>
                  </div>

                  <div className="pt-4 flex space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 text-gray-500 dark:text-neutral-400"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedId(null);
                        reset({
                          content: '',
                          type: 'joke',
                          published: true
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {selectedId ? 'Apply Update' : 'Publish Block'}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-neutral-900/20 border-gray-200 dark:border-neutral-800 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                <Smile size={36} className="text-neutral-800" />
                <h4 className="font-bold text-gray-500 dark:text-neutral-400 text-sm">Entertainment CMS</h4>
                <p className="text-neutral-600 text-xs leading-relaxed max-w-xs">
                  Publish jokes and trivia facts which readers access dynamically via bottom floating scopes on pages.
                </p>
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Write Content Block
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Content Block"
        message="Are you sure you want to permanently delete this joke/trivia block?"
      />
    </>
  );
};

export default ManageJokesTrivia;