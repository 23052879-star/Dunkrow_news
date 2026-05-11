import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Check, X } from 'lucide-react';
import { useCommentStore } from '../../store/commentStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const ManageComments: React.FC = () => {
  const { pendingComments, isLoading, fetchPendingComments, approveComment, deleteComment } = useCommentStore();

  useEffect(() => {
    fetchPendingComments();
  }, [fetchPendingComments]);

  const handleApprove = async (id: string) => {
    await approveComment(id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(id);
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Comments | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Manage Comments
          </h1>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {pendingComments.length} pending comments
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-24 animate-pulse" />
              ))}
            </div>
          ) : pendingComments.length > 0 ? (
            pendingComments.map((comment) => (
              <Card key={comment.id}>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {comment.username || 'Anonymous'}
                      </span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {comment.content}
                    </p>
                    {comment.articleTitle && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        On article: {comment.articleTitle}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleApprove(comment.id)}
                      className="text-green-600"
                      aria-label="Approve comment"
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600"
                      aria-label="Delete comment"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-center text-neutral-600 dark:text-neutral-400">
                No pending comments
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageComments;