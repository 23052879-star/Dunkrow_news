import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FolderOpen, 
  UploadCloud, 
  Search, 
  Trash2, 
  Grid, 
  List, 
  Copy, 
  Check, 
  Tag as TagIcon,
  X,
  FileImage,
  FileVideo,
  FolderPlus
} from 'lucide-react';
import { useMediaStore } from '../../store/mediaStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export const MediaLibrary: React.FC = () => {
  const { 
    mediaFiles, 
    folders, 
    isLoading, 
    fetchMedia, 
    uploadFile, 
    deleteFile, 
    createFolder, 
    deleteFolder 
  } = useMediaStore();

  const [currentFolder, setCurrentFolder] = useState('uploads');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Selected file inspector
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Upload and Folder Modals
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteUrl, setDeleteUrl] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchMedia(currentFolder);
  }, [fetchMedia, currentFolder]);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  };

  const handleUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i], currentFolder);
    }
    fetchMedia(currentFolder);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      const success = await createFolder(newFolderName.trim());
      if (success) {
        setCurrentFolder(newFolderName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-'));
        setNewFolderName('');
        setShowFolderModal(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteFile(deleteId, deleteUrl);
      setSelectedFile(null);
      setDeleteId(null);
    }
  };

  // Filter files
  const filteredFiles = mediaFiles.filter(item => 
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Media Library | Dunkrow CMS</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
              Media Asset Library
            </h1>
            <p className="text-gray-400 dark:text-neutral-500 text-xs mt-0.5">
              Upload, optimize, folderize, and reuse your images and videos across news publications.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300"
              leftIcon={<FolderPlus size={16} />}
              onClick={() => setShowFolderModal(true)}
            >
              New Folder
            </Button>
            <Button 
              leftIcon={<UploadCloud size={16} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Assets
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*,video/*"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Folder Navigation */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider pl-1">
              Folders
            </h3>
            
            <div className="bg-white dark:bg-neutral-900/40 border border-gray-200 dark:border-neutral-800 rounded-2xl p-3 space-y-1">
              {folders.map(fold => (
                <button
                  key={fold}
                  onClick={() => {
                    setCurrentFolder(fold);
                    setSelectedFile(null);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all ${
                    currentFolder === fold
                      ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-neutral-950'
                  }`}
                >
                  <FolderOpen size={16} />
                  <span className="truncate">{fold.replace('-', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Media grid & listing panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar controls */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 text-neutral-600" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search files in this folder..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-xs text-gray-700 dark:text-neutral-300 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Layout view controls */}
              <div className="flex space-x-1 border border-gray-200 dark:border-neutral-800 rounded-lg p-1 bg-white dark:bg-neutral-900/60 self-start sm:self-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                dragActive 
                  ? 'border-red-500 bg-red-500/5 text-red-500' 
                  : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/20 text-gray-400 dark:text-neutral-500 hover:border-gray-300 dark:border-neutral-700'
              }`}
            >
              <UploadCloud size={32} className="mb-2" />
              <p className="text-xs font-bold text-gray-500 dark:text-neutral-400">Drag and drop assets here, or browse files</p>
              <p className="text-[10px] text-neutral-600 mt-1">Accepts images and video formats up to 15MB</p>
            </div>

            {/* Assets display */}
            <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 p-6 min-h-[400px]">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                  <span className="text-gray-400 dark:text-neutral-500 text-xs">Accessing bucket storage...</span>
                </div>
              ) : filteredFiles.length > 0 ? (
                viewMode === 'grid' ? (
                  /* Grid View */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {filteredFiles.map(file => {
                      const isImage = file.type.startsWith('image/');
                      return (
                        <div
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className={`relative group rounded-xl border overflow-hidden bg-gray-50 dark:bg-neutral-950 aspect-square cursor-pointer hover:border-gray-300 dark:border-neutral-700 transition-all ${
                            selectedFile?.id === file.id ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 dark:border-neutral-800'
                          }`}
                        >
                          {isImage ? (
                            <img 
                              src={file.url} 
                              alt={file.altText || file.filename} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-neutral-500">
                              <FileVideo size={36} />
                              <span className="text-[10px] font-semibold uppercase mt-2">Video</span>
                            </div>
                          )}
                          
                          {/* File info overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gray-50 dark:bg-neutral-950/80 p-2 border-t border-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="block text-[10px] font-bold text-gray-900 dark:text-white truncate">{file.filename}</span>
                            <span className="text-[9px] text-gray-400 dark:text-neutral-500">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* List View */
                  <div className="divide-y divide-neutral-900">
                    {filteredFiles.map(file => (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`py-3 px-2 flex items-center justify-between cursor-pointer rounded-lg hover:bg-gray-50 dark:bg-neutral-950/80 transition-colors ${
                          selectedFile?.id === file.id ? 'bg-gray-50 dark:bg-neutral-950/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          {file.type.startsWith('image/') ? <FileImage size={18} className="text-gray-400 dark:text-neutral-500" /> : <FileVideo size={18} className="text-gray-400 dark:text-neutral-500" />}
                          <span className="font-semibold text-xs text-neutral-200 truncate max-w-xs">{file.filename}</span>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-xs text-gray-400 dark:text-neutral-500">
                          <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="py-20 text-center space-y-2">
                  <FolderOpen size={40} className="text-neutral-700 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-500 dark:text-neutral-400">Folder is Empty</h3>
                  <p className="text-neutral-600 text-xs">Drag and drop assets or select Upload above to add items here.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Asset Inspector Sidebar Modal Overlay */}
      {selectedFile && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 shadow-2xl p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-250">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-4 mb-6">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Asset Details</h4>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {/* Visual preview */}
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden bg-gray-50 dark:bg-neutral-950 aspect-video flex items-center justify-center">
              {selectedFile.type.startsWith('image/') ? (
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.filename} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <video 
                  src={selectedFile.url} 
                  controls 
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Properties */}
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="block text-gray-400 dark:text-neutral-500 uppercase font-semibold text-[10px] tracking-wider mb-1">Filename</span>
                <span className="text-neutral-200 font-bold break-all">{selectedFile.filename}</span>
              </div>
              
              <div>
                <span className="block text-gray-400 dark:text-neutral-500 uppercase font-semibold text-[10px] tracking-wider mb-1">Mime Type</span>
                <span className="text-gray-700 dark:text-neutral-300 font-semibold">{selectedFile.type}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-gray-400 dark:text-neutral-500 uppercase font-semibold text-[10px] tracking-wider mb-1">Size</span>
                  <span className="text-gray-700 dark:text-neutral-300 font-bold">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <div>
                  <span className="block text-gray-400 dark:text-neutral-500 uppercase font-semibold text-[10px] tracking-wider mb-1">Upload Date</span>
                  <span className="text-gray-700 dark:text-neutral-300 font-semibold">{new Date(selectedFile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div>
                <span className="block text-gray-400 dark:text-neutral-500 uppercase font-semibold text-[10px] tracking-wider mb-1">CDN Asset URL</span>
                <div className="flex space-x-1 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={selectedFile.url}
                    className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg text-[10px] text-gray-500 dark:text-neutral-400 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopyUrl(selectedFile.id, selectedFile.url)}
                    className="p-2 rounded-lg bg-neutral-850 border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white"
                  >
                    {copiedId === selectedFile.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-neutral-800 pt-6 flex space-x-2">
              <Button 
                variant="danger" 
                fullWidth
                onClick={() => {
                  setDeleteId(selectedFile.id);
                  setDeleteUrl(selectedFile.url);
                }}
                leftIcon={<Trash2 size={14} />}
              >
                Delete Asset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFolderModal(false)} />
          <div className="relative bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <button 
              onClick={() => setShowFolderModal(false)}
              className="absolute top-4 right-4 text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Create New Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. avatars"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <Button type="submit" fullWidth>Create Folder</Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete file confirm dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Media File"
        message="Are you sure you want to delete this media asset? Existing article image references using this URL will render as broken links."
      />
    </>
  );
};

export default MediaLibrary;
