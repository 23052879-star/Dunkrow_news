import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  MessageSquare, 
  Check, 
  Trash2, 
  Clock, 
  Search,
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { useCommentStore } from '../../store/commentStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export const ManageComments: React.FC = () => {
  const { 
    comments, 
    pendingComments, 
    isLoading, 
    fetchAllComments, 
    approveComment, 
    deleteComment, 
    bulkApprove, 
    bulkDelete 
  } = useCommentStore();

  const [currentTab, setCurrentTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<'approve' | 'delete' | null>(null);

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  // Reset checkboxes on tab change
  useEffect(() => {
    setSelectedIds([]);
  }, [currentTab]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>, items: any[]) => {
    if (e.target.checked) {
      setSelectedIds(items.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSingleApprove = async (id: string) => {
    await approveComment(id);
    fetchAllComments();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteComment(deleteId);
      setDeleteId(null);
      fetchAllComments();
    }
  };

  const handleBulkActionConfirm = async () => {
    if (bulkAction === 'approve') {
      await bulkApprove(selectedIds);
    } else if (bulkAction === 'delete') {
      await bulkDelete(selectedIds);
    }
    setSelectedIds([]);
    setBulkAction(null);
    fetchAllComments();
  };

  // Determine active dataset
  const activeDataset = currentTab === 'pending' ? pendingComments :
                        currentTab === 'approved' ? comments.filter(c => c.approved) :
                        comments;

  // Search filter
  const filteredComments = activeDataset.filter(c => 
    c.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Manage Comments | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
              Comment Moderation Queue
            </h1>
            <p className="text-gray-400 dark:text-neutral-500 text-xs mt-0.5">
              Review reader feedback, approve comments for display, and purge toxic postings.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap border-b border-gray-200 dark:border-neutral-800 gap-1">
          {([
            { id: 'pending', label: 'Pending Moderation' },
            { id: 'approved', label: 'Approved Feedback' },
            { id: 'all', label: 'All Postings' }
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
                tab.id === 'pending' ? pendingComments.length : 
                tab.id === 'approved' ? comments.filter(c => c.approved).length : comments.length
              })
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 text-neutral-600" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comments, usernames..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-xs text-gray-700 dark:text-neutral-300 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end animate-in fade-in slide-in-from-right duration-150">
              <span className="text-xs text-gray-500 dark:text-neutral-400 font-bold mr-2">
                {selectedIds.length} comments selected
              </span>
              
              {currentTab === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white"
                  onClick={() => setBulkAction('approve')}
                  leftIcon={<CheckCheck size={14} className="text-green-500" />}
                >
                  Bulk Approve
                </Button>
              )}
              
              <Button
                size="sm"
                variant="danger"
                onClick={() => setBulkAction('delete')}
                leftIcon={<Trash2 size={14} />}
              >
                Bulk Purge
              </Button>
            </div>
          )}
        </div>

        {/* Comments Listing Card */}
        <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
              <span className="text-gray-400 dark:text-neutral-500 text-xs">Accessing queue...</span>
            </div>
          ) : filteredComments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-neutral-500 text-xs font-semibold uppercase tracking-wider bg-white dark:bg-neutral-900/80">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={filteredComments.length > 0 && selectedIds.length === filteredComments.length}
                        onChange={(e) => handleSelectAll(e, filteredComments)}
                        className="rounded border-gray-200 dark:border-neutral-800 text-red-650 focus:ring-red-500 bg-gray-50 dark:bg-neutral-950 w-4 h-4"
                      />
                    </th>
                    <th className="p-4 w-44">User</th>
                    <th className="p-4">Comment Content</th>
                    <th className="p-4 w-44">Source Article</th>
                    <th className="p-4 w-32 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredComments.map(c => {
                    const isSelected = selectedIds.includes(c.id);
                    return (
                      <tr key={c.id} className={`hover:bg-white dark:bg-neutral-900/40 transition-colors group ${
                        isSelected ? 'bg-white dark:bg-neutral-900/20' : ''
                      }`}>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(c.id)}
                            className="rounded border-gray-200 dark:border-neutral-800 text-red-650 focus:ring-red-500 bg-gray-50 dark:bg-neutral-950 w-4 h-4"
                          />
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-neutral-200 block truncate w-36">{c.username}</span>
                          <span className="text-[9px] text-neutral-600 block mt-0.5">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4 text-gray-700 dark:text-neutral-300 text-xs italic font-medium max-w-md break-words">
                          "{c.content}"
                        </td>
                        <td className="p-4 text-gray-500 dark:text-neutral-400 font-semibold text-xs truncate max-w-xs" title={c.articleTitle}>
                          {c.articleTitle}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {!c.approved && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-500 hover:bg-green-500/10 p-1.5"
                                onClick={() => handleSingleApprove(c.id)}
                                aria-label="Approve comment"
                              >
                                <Check size={15} />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 dark:text-neutral-500 hover:text-red-500 p-1.5"
                              onClick={() => setDeleteId(c.id)}
                              aria-label="Delete comment"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center space-y-2">
              <MessageSquare size={40} className="text-neutral-700 mx-auto" />
              <h3 className="text-sm font-bold text-gray-500 dark:text-neutral-400">Comments Queue Clear</h3>
              <p className="text-neutral-600 text-xs">Everything has been successfully moderated.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Delete comment confirm modal */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Purge Reader Feedback"
        message="Are you sure you want to permanently delete this comment posting?"
      />

      {/* Bulk action confirm modal */}
      <ConfirmDialog
        isOpen={bulkAction !== null}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkActionConfirm}
        title={bulkAction === 'approve' ? 'Bulk Approve Postings' : 'Bulk Purge Postings'}
        message={
          bulkAction === 'approve'
            ? `Are you sure you want to approve all ${selectedIds.length} selected reader comments?`
            : `Are you sure you want to permanently purge all ${selectedIds.length} selected reader comments?`
        }
      />
    </>
  );
};

export default ManageComments;