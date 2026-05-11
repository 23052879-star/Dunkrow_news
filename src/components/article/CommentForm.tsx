import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCommentStore } from '../../store/commentStore';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';

interface CommentFormProps {
  articleId: string;
}

interface CommentFormValues {
  content: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ articleId }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const { addComment } = useCommentStore();

  const onSubmit = async (data: CommentFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const comment = await addComment({
        articleId,
        userId: user.id,
        content: data.content,
        approved: false
      });
      
      if (comment) {
        reset();
        setSuccessMessage('Your comment has been submitted and is awaiting approval.');
      } else {
        setErrorMessage('Failed to submit your comment. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-md">
        <p className="text-center text-neutral-600 dark:text-neutral-300">
          Please <a href="/login" className="text-primary-600 hover:underline">login</a> to leave a comment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Leave a Comment</h3>
      
      {successMessage && (
        <div className="p-3 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 mb-4">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextArea
          placeholder="Share your thoughts..."
          fullWidth
          rows={4}
          error={errors.content?.message}
          {...register('content', { 
            required: 'Comment cannot be empty',
            minLength: {
              value: 3,
              message: 'Comment must have at least 3 characters'
            },
            maxLength: {
              value: 1000,
              message: 'Comment cannot exceed 1000 characters'
            }
          })}
        />
        
        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Note: Comments will be visible after approval.
        </div>
        
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          Submit Comment
        </Button>
      </form>
    </div>
  );
};

export default CommentForm;