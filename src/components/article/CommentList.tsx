import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import { Comment } from '../../types';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="py-6 text-center text-neutral-500 dark:text-neutral-400">
        No comments yet. Be the first to share your thoughts!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div 
          key={comment.id}
          className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center mb-3">
            <div className="flex items-center justify-center w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300">
              <User size={16} />
            </div>
            <div className="ml-3">
              <div className="font-medium text-neutral-900 dark:text-white">
                {comment.username || 'Anonymous'}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
            {comment.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;