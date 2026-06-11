import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Flame, 
  X, 
  CheckCircle, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useWhisperStore } from '../../store/whisperStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import RichTextEditor from '../../components/admin/RichTextEditor';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

interface WhisperFormData {
  title: string;
  content: string;
  featuredImage: string;
  published: boolean;
}

export const ManageWhispers: React.FC = () => {
  const { whispers, isLoading, fetchAllWhispers, createWhisper, updateWhisper, deleteWhisper } = useWhisperStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<WhisperFormData>({
    defaultValues: {
      published: true,
      featuredImage: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=1200&q=80'
    }
  });

  useEffect(() => {
    fetchAllWhispers();
  }, [fetchAllWhispers]);

  const handleEdit = (whisper: any) => {
    setSelectedId(whisper.id);
    setIsEditing(true);
    setValue('title', whisper.title);
    setValue('content', whisper.content);
    setValue('featuredImage', whisper.featuredImage);
    setValue('published', whisper.published);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteWhisper(deleteId);
      setDeleteId(null);
    }
  };

  const isWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const onSubmit = async (data: WhisperFormData) => {
    if (selectedId) {
      await updateWhisper(selectedId, data);
    } else {
      await createWhisper(data);
    }
    
    reset({
      title: '',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=1200&q=80',
      published: true
    });
    setIsEditing(false);
    setSelectedId(null);
  };

  return (
    <>
      <Helmet>
        <title>Weekend Whispers CMS | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
              Weekend Whispers <Flame className="text-amber-500 ml-2 animate-pulse" size={22} />
            </h1>
            <p className="text-gray-400 dark:text-neutral-500 text-xs mt-0.5">
              Draft gossip columns, social rumours and placements scoops which appear only on weekends.
            </p>
          </div>
          
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Plus size={16} />}>
              New Whisper Post
            </Button>
          )}
        </div>

        {/* Weekend Notification Alert */}
        {!isWeekend() && (
          <div className="flex items-center space-x-3 text-xs bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-500">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="font-semibold">Weekend Whispers columns are scheduled for weekend releases only and remain hidden from index pages during weekdays.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                  <span className="text-gray-400 dark:text-neutral-500 text-xs">Querying scoops...</span>
                </div>
              ) : whispers.length > 0 ? (
                <div className="space-y-3">
                  {whispers.map((whisper) => (
                    <div 
                      key={whisper.id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-950/80 hover:border-gray-300 dark:border-neutral-700 transition-all group"
                    >
                      <div className="flex items-center space-x-4 overflow-hidden">
                        <img 
                          src={whisper.featuredImage} 
                          alt={whisper.title} 
                          className="w-14 h-14 rounded-lg object-cover border border-neutral-900 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                            {whisper.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 dark:text-neutral-500 block mt-1">
                            {new Date(whisper.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3.5">
                        {whisper.published ? (
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
                            onClick={() => handleEdit(whisper)}
                            aria-label="Edit scoop"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 dark:text-neutral-500 hover:text-red-500"
                            onClick={() => setDeleteId(whisper.id)}
                            aria-label="Delete scoop"
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
                  <Flame size={40} className="text-neutral-700 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-500 dark:text-neutral-400">No Scoops Found</h3>
                  <p className="text-neutral-600 text-xs">Create your first scoop using the creation panel.</p>
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
                    {selectedId ? 'Edit Scoop Post' : 'New Scoop Post'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedId(null);
                      reset({
                        title: '',
                        content: '',
                        featuredImage: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=1200&q=80',
                        published: true
                      });
                    }}
                    className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Scoop Title"
                    placeholder="Enter an intriguing caption title..."
                    error={errors.title?.message}
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white"
                    {...register('title', { required: 'Scoop title is required' })}
                  />

                  <Input
                    label="Cover Image Link"
                    placeholder="Featured scoop image URL..."
                    error={errors.featuredImage?.message}
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs"
                    {...register('featuredImage', { required: 'Cover image is required' })}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-500 dark:text-neutral-400 mb-1">
                      Content Body
                    </label>
                    <Controller
                      name="content"
                      control={control}
                      rules={{ required: 'Scoop body is required' }}
                      render={({ field }) => (
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Reveal the secret scoops..."
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="published"
                      {...register('published')}
                      className="rounded border-gray-200 dark:border-neutral-800 text-red-600 focus:ring-red-500 bg-gray-50 dark:bg-neutral-950 w-4.5 h-4.5"
                    />
                    <label htmlFor="published" className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wide">
                      Show in Weekend release
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
                          title: '',
                          content: '',
                          featuredImage: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=1200&q=80',
                          published: true
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {selectedId ? 'Apply Update' : 'Post Scoop'}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-neutral-900/20 border-gray-200 dark:border-neutral-800 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                <Flame size={36} className="text-neutral-800" />
                <h4 className="font-bold text-gray-500 dark:text-neutral-400 text-sm">Weekend Scope CMS</h4>
                <p className="text-neutral-600 text-xs leading-relaxed max-w-xs">
                  Create columns, rumors, gossip and scoops which render automatically as floating dynamic items during weekends.
                </p>
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Write Scoop Column
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
        title="Delete Weekend Scoop"
        message="Are you sure you want to delete this Weekend scoop? It will be permanently removed from reader logs."
      />
    </>
  );
};

export default ManageWhispers;