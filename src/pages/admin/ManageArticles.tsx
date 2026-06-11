import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Pencil, 
  Trash2, 
  Eye,
  Calendar,
  CheckCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useArticleStore } from '../../store/articleStore';
import { useSectionStore } from '../../store/sectionStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const CATEGORIES = [
  'Politics',
  'Technology',
  'Business',
  'Sports',
  'Entertainment',
  'Science',
  'Health'
];

export const ManageArticles: React.FC = () => {
  const { articles, isLoading, fetchAllArticles, deleteArticle } = useArticleStore();
  const { sections, fetchSections } = useSectionStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [currentTab, setCurrentTab] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'archived'>('all');
  
  // Modals state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllArticles();
    fetchSections();
  }, [fetchAllArticles, fetchSections]);

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteArticle(deleteId);
      setDeleteId(null);
    }
  };

  // Filter logic
  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSection = selectedSection === 'All' || art.sectionId === selectedSection;
    
    const matchesTab = currentTab === 'all' || art.status === currentTab;

    return matchesSearch && matchesCategory && matchesSection && matchesTab;
  });

  const getStatusBadge = (status: 'draft' | 'published' | 'scheduled' | 'archived') => {
    switch (status) {
      case 'published':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-500 uppercase tracking-wide">
            <CheckCircle size={12} />
            <span>Published</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-500 uppercase tracking-wide">
            <Calendar size={12} />
            <span>Scheduled</span>
          </span>
        );
      case 'archived':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wide">
            <AlertTriangle size={12} />
            <span>Archived</span>
          </span>
        );
      default: // Draft
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-500 uppercase tracking-wide">
            <FileText size={12} />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Articles | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Articles Directory
            </h1>
            <p className="text-gray-400 dark:text-neutral-500 text-xs mt-0.5">
              Create, schedule, edit and moderate news articles across all categories and sections.
            </p>
          </div>
          
          <Link to="/admin/articles/new">
            <Button leftIcon={<Plus size={16} />}>
              Create New Article
            </Button>
          </Link>
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap border-b border-gray-200 dark:border-neutral-800 gap-1">
          {([
            { id: 'all', label: 'All Articles' },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'archived', label: 'Archived' }
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
                tab.id === 'all' ? articles.length : articles.filter(a => a.status === tab.id).length
              })
            </button>
          ))}
        </div>

        {/* Search and Filters panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 text-neutral-600" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles by title, excerpt..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-700 dark:text-neutral-300 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-500 dark:text-neutral-400 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-500 dark:text-neutral-400 focus:outline-none"
            >
              <option value="All">All CMS Sections</option>
              {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
            </select>
          </div>
        </div>

        {/* Articles Table Card */}
        <Card className="bg-white dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
              <span className="text-gray-400 dark:text-neutral-500 text-xs">Querying database...</span>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-neutral-500 text-xs font-semibold uppercase tracking-wider bg-white dark:bg-neutral-900/80">
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Section</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Published Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredArticles.map(article => {
                    const matchedSection = sections.find(s => s.id === article.sectionId);
                    
                    return (
                      <tr key={article.id} className="hover:bg-white dark:bg-neutral-900/50 transition-colors group">
                        <td className="p-4 max-w-sm truncate font-semibold text-neutral-200 group-hover:text-gray-900 dark:text-white">
                          {article.title}
                        </td>
                        <td className="p-4 text-gray-500 dark:text-neutral-400 font-medium">
                          {article.category}
                        </td>
                        <td className="p-4 text-gray-500 dark:text-neutral-400 font-medium">
                          {matchedSection ? (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] uppercase font-bold" 
                              style={{ 
                                backgroundColor: `${matchedSection.color}20`,
                                color: matchedSection.color,
                                border: `1px solid ${matchedSection.color}30`
                              }}
                            >
                              {matchedSection.name}
                            </span>
                          ) : (
                            <span className="text-neutral-600 text-xs italic">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(article.status)}
                        </td>
                        <td className="p-4 text-gray-500 dark:text-neutral-400">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end space-x-1.5">
                            <Link to={`/article/${article.slug}`} target="_blank">
                              <Button size="sm" variant="ghost" className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white" aria-label="View article on site">
                                <Eye size={15} />
                              </Button>
                            </Link>
                            <Link to={`/admin/articles/edit/${article.id}`}>
                              <Button size="sm" variant="ghost" className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-white" aria-label="Edit article">
                                <Pencil size={15} />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-gray-400 dark:text-neutral-500 hover:text-red-500"
                              onClick={() => setDeleteId(article.id)}
                              aria-label="Delete article"
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
              <FileText size={40} className="text-neutral-700 mx-auto" />
              <h3 className="text-sm font-bold text-gray-500 dark:text-neutral-400">No Articles Found</h3>
              <p className="text-neutral-600 text-xs">Try relaxing search terms or selecting a different status filter tab.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Article"
        message="Are you sure you want to permanently delete this news article? This action is irreversible."
      />
    </>
  );
};

export default ManageArticles;