import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Megaphone, 
  X, 
  Eye, 
  MousePointer, 
  Percent,
  Calendar
} from 'lucide-react';
import { useAdStore } from '../../store/adStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

interface AdFormData {
  title: string;
  type: 'banner' | 'sidebar' | 'in-article' | 'sponsored';
  imageUrl: string;
  targetUrl: string;
  position: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export const ManageAds: React.FC = () => {
  const { ads, isLoading, fetchAds, createAd, updateAd, deleteAd } = useAdStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AdFormData>({
    defaultValues: {
      type: 'banner',
      isActive: true,
      position: 'homepage-top',
      imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80'
    }
  });

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleEdit = (ad: any) => {
    setSelectedId(ad.id);
    setIsEditing(true);
    setValue('title', ad.title);
    setValue('type', ad.type);
    setValue('imageUrl', ad.imageUrl);
    setValue('targetUrl', ad.targetUrl);
    setValue('position', ad.position);
    setValue('isActive', ad.isActive);
    setValue('startDate', ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 16) : '');
    setValue('endDate', ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 16) : '');
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteAd(deleteId);
      setDeleteId(null);
    }
  };

  const onSubmit = async (data: AdFormData) => {
    const adData = {
      title: data.title,
      type: data.type,
      imageUrl: data.imageUrl,
      targetUrl: data.targetUrl,
      position: data.position,
      isActive: data.isActive,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined
    };

    if (selectedId) {
      await updateAd(selectedId, adData);
    } else {
      await createAd(adData);
    }

    reset({
      title: '',
      type: 'banner',
      position: 'homepage-top',
      imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
      isActive: true
    });
    setIsEditing(false);
    setSelectedId(null);
  };

  return (
    <>
      <Helmet>
        <title>Ad Server CMS | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
              Ad Campaign Server
            </h1>
            <p className="text-neutral-500 text-xs mt-0.5">
              Serve display banner ads, sidebar campaigns, sponsored postings and track conversions.
            </p>
          </div>
          
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Plus size={16} />}>
              Add Ad Campaign
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-neutral-900/40 border-neutral-850">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                  <span className="text-neutral-500 text-xs">Querying server channels...</span>
                </div>
              ) : ads.length > 0 ? (
                <div className="space-y-3">
                  {ads.map((ad) => {
                    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0.0;
                    return (
                      <div 
                        key={ad.id}
                        className="p-4 rounded-xl border border-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-950/80 hover:border-neutral-700 transition-all group"
                      >
                        <div className="flex items-center space-x-4 overflow-hidden pr-2">
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.title} 
                            className="w-16 h-10 rounded object-cover border border-neutral-900 flex-shrink-0"
                          />
                          <div className="overflow-hidden">
                            <h4 className="font-semibold text-white truncate text-sm">
                              {ad.title}
                            </h4>
                            <div className="flex items-center space-x-3 text-[10px] text-neutral-500 mt-1 uppercase font-bold tracking-wider">
                              <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded text-[8px]">
                                {ad.type}
                              </span>
                              <span>Position: {ad.position}</span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics representation */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-neutral-900 sm:border-t-0 pt-3 sm:pt-0">
                          <div className="flex space-x-4 text-center">
                            <div>
                              <span className="block text-xs font-bold text-white flex items-center justify-center">
                                <Eye size={12} className="mr-0.5 text-neutral-500" />
                                {ad.impressions}
                              </span>
                              <span className="text-[9px] font-bold text-neutral-600 uppercase">Views</span>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-neutral-400 flex items-center justify-center">
                                <MousePointer size={12} className="mr-0.5 text-neutral-500" />
                                {ad.clicks}
                              </span>
                              <span className="text-[9px] font-bold text-neutral-600 uppercase">Clicks</span>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-blue-400 flex items-center justify-center">
                                <Percent size={12} className="mr-0.5 text-blue-500" />
                                {ctr.toFixed(1)}%
                              </span>
                              <span className="text-[9px] font-bold text-neutral-600 uppercase">CTR</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 ml-2.5">
                            {ad.isActive ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/10 border border-green-500/20 text-green-500 uppercase tracking-wide">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-500 uppercase tracking-wide">
                                Paused
                              </span>
                            )}

                            <div className="flex items-center space-x-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-neutral-500 hover:text-white"
                                onClick={() => handleEdit(ad)}
                                aria-label="Edit campaign"
                              >
                                <Pencil size={15} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-neutral-500 hover:text-red-500"
                                onClick={() => setDeleteId(ad.id)}
                                aria-label="Delete campaign"
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center space-y-2">
                  <Megaphone size={40} className="text-neutral-700 mx-auto" />
                  <h3 className="text-sm font-bold text-neutral-400">No Ads Active</h3>
                  <p className="text-neutral-600 text-xs">Serve your first advertiser display campaign using the builder.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Builder Panel */}
          <div>
            {isEditing ? (
              <Card className="bg-neutral-900/60 border-neutral-850 space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {selectedId ? 'Edit Ad Campaign' : 'New Ad Campaign'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedId(null);
                      reset({
                        title: '',
                        type: 'banner',
                        position: 'homepage-top',
                        imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
                        isActive: true
                      });
                    }}
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Campaign Title"
                    placeholder="e.g. Internshala Summer Ads"
                    error={errors.title?.message}
                    className="bg-neutral-950 border-neutral-850 text-white"
                    {...register('title', { required: 'Title is required' })}
                  />

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Ad Banner Layout Type
                    </label>
                    <select
                      {...register('type')}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none"
                    >
                      <option value="banner">Display Horizontal Banner</option>
                      <option value="sidebar">Sidebar Widget Ad</option>
                      <option value="in-article">In-Article Content Ad</option>
                      <option value="sponsored">Sponsored SCOOP Post</option>
                    </select>
                  </div>

                  <Input
                    label="Position Code"
                    placeholder="e.g. homepage-top, sidebar-middle"
                    className="bg-neutral-950 border-neutral-850 text-white"
                    {...register('position')}
                  />

                  <Input
                    label="Creative Image Link"
                    placeholder="Public CDN banner URL..."
                    error={errors.imageUrl?.message}
                    className="bg-neutral-950 border-neutral-850 text-white text-xs"
                    {...register('imageUrl', { required: 'Image URL is required' })}
                  />

                  <Input
                    label="Target Link (Click redirect)"
                    placeholder="https://advertiser-site.com/campaign"
                    error={errors.targetUrl?.message}
                    className="bg-neutral-950 border-neutral-850 text-white text-xs font-mono"
                    {...register('targetUrl', { required: 'Redirect link is required' })}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="datetime-local"
                      label="Start Date"
                      className="bg-neutral-950 border-neutral-850 text-white text-xs"
                      {...register('startDate')}
                    />
                    <Input
                      type="datetime-local"
                      label="End Date"
                      className="bg-neutral-950 border-neutral-850 text-white text-xs"
                      {...register('endDate')}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register('isActive')}
                      className="rounded border-neutral-800 text-red-600 focus:ring-red-500 bg-neutral-950 w-4.5 h-4.5"
                    />
                    <label htmlFor="isActive" className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                      Serve campaign immediately
                    </label>
                  </div>

                  <div className="pt-4 flex space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 text-neutral-400"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedId(null);
                        reset({
                          title: '',
                          type: 'banner',
                          position: 'homepage-top',
                          imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
                          isActive: true
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {selectedId ? 'Update Campaign' : 'Serve Ad'}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="bg-neutral-900/20 border-neutral-850 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                <Megaphone size={36} className="text-neutral-800" />
                <h4 className="font-bold text-neutral-400 text-sm">Ad Placement Engine</h4>
                <p className="text-neutral-600 text-xs leading-relaxed max-w-xs">
                  Upload horizontal banners, sidebar frames, sponsored listings, and review click stats live.
                </p>
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Serve Campaign Ad
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
        title="Delete Ad Campaign"
        message="Are you sure you want to permanently delete this ad? Campaign history and click impressions statistics will be wiped."
      />
    </>
  );
};

export default ManageAds;
