import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Layers, 
  X, 
  ChevronUp, 
  ChevronDown,
  Info
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useSectionStore } from '../../store/sectionStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Card from '../../components/ui/Card';
import ColorPicker from '../../components/admin/ColorPicker';
import IconPicker from '../../components/admin/IconPicker';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

interface SectionFormData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  icon: string;
  color: string;
}

export const ManageSections: React.FC = () => {
  const { 
    sections, 
    isLoading, 
    fetchSections, 
    createSection, 
    updateSection, 
    deleteSection, 
    reorderSections 
  } = useSectionStore();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<SectionFormData>({
    defaultValues: {
      isActive: true,
      icon: 'layers',
      color: '#EF4444'
    }
  });

  const sectionName = watch('name');

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Generate slug dynamically from name
  useEffect(() => {
    if (selectedId || !sectionName) return;
    const slug = sectionName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    setValue('slug', slug);
  }, [sectionName, selectedId, setValue]);

  const handleEdit = (sec: any) => {
    setSelectedId(sec.id);
    setIsEditing(true);
    setValue('name', sec.name);
    setValue('slug', sec.slug);
    setValue('description', sec.description || '');
    setValue('isActive', sec.isActive);
    setValue('icon', sec.icon);
    setValue('color', sec.color);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteSection(deleteId);
      setDeleteId(null);
    }
  };

  const moveSection = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const reordered = [...sections];
    // Swap
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    await reorderSections(reordered);
  };

  const onSubmit = async (data: SectionFormData) => {
    if (selectedId) {
      await updateSection(selectedId, {
        name: data.name,
        slug: data.slug,
        description: data.description,
        isActive: data.isActive,
        icon: data.icon,
        color: data.color
      });
    } else {
      await createSection({
        name: data.name,
        slug: data.slug,
        description: data.description,
        displayOrder: sections.length + 1,
        isActive: data.isActive,
        icon: data.icon,
        color: data.color
      });
    }
    
    reset({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      icon: 'layers',
      color: '#EF4444'
    });
    setIsEditing(false);
    setSelectedId(null);
  };

  return (
    <>
      <Helmet>
        <title>Manage Sections | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
              Dynamic Section Builder
            </h1>
            <p className="text-gray-400 dark:text-neutral-500 text-xs mt-0.5">
              Create, configure, and reorder homepage layout modules dynamically without database code updates.
            </p>
          </div>
          
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Plus size={16} />}>
              Create New Section
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-neutral-400 text-xs bg-gray-50 dark:bg-neutral-950 p-3.5 rounded-xl border border-neutral-900 mb-6">
                <Info size={16} className="text-red-500 flex-shrink-0" />
                <span>Adjust displaying sequence with Up/Down keys. These sections automatically populate the homepage dynamic blocks.</span>
              </div>

              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                  <span className="text-gray-400 dark:text-neutral-500 text-xs">Querying dynamic templates...</span>
                </div>
              ) : sections.length > 0 ? (
                <div className="space-y-3">
                  {sections.map((sec, idx) => {
                    // Look up Lucide Icon
                    const IconComponent = (Icons as any)[sec.icon] || Icons.Layers;

                    return (
                      <div 
                        key={sec.id}
                        className={`p-4 rounded-xl border flex items-center justify-between bg-gray-50 dark:bg-neutral-950/80 hover:border-gray-300 dark:border-neutral-700 transition-all ${
                          sec.isActive ? 'border-gray-200 dark:border-neutral-800' : 'border-neutral-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Reordering Controls */}
                          <div className="flex flex-col space-y-1">
                            <button 
                              onClick={() => moveSection(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white disabled:opacity-30 transition-all"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button 
                              onClick={() => moveSection(idx, 'down')}
                              disabled={idx === sections.length - 1}
                              className="p-1 rounded hover:bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white disabled:opacity-30 transition-all"
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>

                          {/* Icon representation */}
                          <div 
                            className="p-2.5 rounded-xl flex items-center justify-center text-gray-900 dark:text-white"
                            style={{ 
                              backgroundColor: `${sec.color}15`,
                              color: sec.color,
                              border: `1px solid ${sec.color}25`
                            }}
                          >
                            <IconComponent size={20} />
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2 text-sm">
                              <span>{sec.name}</span>
                              {!sec.isActive && (
                                <span className="bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide">
                                  Disabled
                                </span>
                              )}
                            </h4>
                            <p className="text-gray-400 dark:text-neutral-500 text-xs mt-0.5 line-clamp-1">{sec.description || 'No description provided'}</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-1.5">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white"
                            onClick={() => handleEdit(sec)}
                            aria-label="Edit section"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-400 dark:text-neutral-500 hover:text-red-500"
                            onClick={() => setDeleteId(sec.id)}
                            aria-label="Delete section"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center space-y-2">
                  <Layers size={40} className="text-neutral-700 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-500 dark:text-neutral-400">No Sections Configured</h3>
                  <p className="text-neutral-600 text-xs">Create your first dynamic page widget using the creation panel.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Builder Panel / Edit Drawer */}
          <div>
            {isEditing ? (
              <Card className="bg-white dark:bg-neutral-900/60 border-gray-200 dark:border-neutral-800 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {selectedId ? 'Edit Section Template' : 'New Section Template'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedId(null);
                      reset({
                        name: '',
                        slug: '',
                        description: '',
                        isActive: true,
                        icon: 'layers',
                        color: '#EF4444'
                      });
                    }}
                    className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Section Name"
                    placeholder="e.g. Startup Stories"
                    error={errors.name?.message}
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white"
                    {...register('name', { required: 'Section name is required' })}
                  />

                  <Input
                    label="URL Slug (Auto-generated)"
                    placeholder="e.g. startup-stories"
                    error={errors.slug?.message}
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white font-mono text-xs"
                    {...register('slug', { required: 'Slug is required' })}
                  />

                  <TextArea
                    label="Description"
                    placeholder="Brief details about what goes in this dynamic block..."
                    rows={2}
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-xs"
                    {...register('description')}
                  />

                  {/* Dynamic picker for color */}
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <ColorPicker value={field.value} onChange={field.onChange} />
                    )}
                  />

                  {/* Dynamic icon selection grid */}
                  <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                      <IconPicker value={field.value} onChange={field.onChange} />
                    )}
                  />

                  {/* Active boolean toggle */}
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register('isActive')}
                      className="rounded border-gray-200 dark:border-neutral-800 text-red-600 focus:ring-red-500 bg-gray-50 dark:bg-neutral-950 w-4.5 h-4.5"
                    />
                    <label htmlFor="isActive" className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wide">
                      Show on homepage navigation
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
                          name: '',
                          slug: '',
                          description: '',
                          isActive: true,
                          icon: 'layers',
                          color: '#EF4444'
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {selectedId ? 'Apply Update' : 'Build Section'}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-neutral-900/20 border-gray-200 dark:border-neutral-800 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                <Layers size={36} className="text-neutral-800" />
                <h4 className="font-bold text-gray-500 dark:text-neutral-400 text-sm">Dynamic Homepage Layout</h4>
                <p className="text-neutral-600 text-xs leading-relaxed max-w-xs">
                  Create sections and assign them custom colors and icons. Sections render automatically as custom grids on your online news platform.
                </p>
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Create Section Builder
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Dynamic Section"
        message="Are you sure you want to delete this dynamic layout section? Existing articles assigned to this section will fallback to default category placement."
      />
    </>
  );
};

export default ManageSections;
