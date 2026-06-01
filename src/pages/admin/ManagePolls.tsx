import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  Pencil,
  X, 
  HelpCircle, 
  Eye, 
  BarChart, 
  Calendar,
  CheckCircle2,
  Trash
} from 'lucide-react';
import { usePollStore } from '../../store/pollStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

interface PollFormData {
  question: string;
  options: { text: string; votes: number }[];
  isActive: boolean;
  expiresAt: string;
}

export const ManagePolls: React.FC = () => {
  const { polls, isLoading, fetchPolls, createPoll, updatePoll, deletePoll } = usePollStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewResultsId, setViewResultsId] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<PollFormData>({
    defaultValues: {
      isActive: true,
      options: [
        { text: 'Option A', votes: 0 },
        { text: 'Option B', votes: 0 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options'
  });

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleEdit = (poll: any) => {
    setSelectedId(poll.id);
    setIsEditing(true);
    setValue('question', poll.question);
    setValue('isActive', poll.isActive);
    setValue('expiresAt', poll.expiresAt ? new Date(poll.expiresAt).toISOString().slice(0, 16) : '');
    
    // Clear and reset field array
    setValue('options', poll.options);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deletePoll(deleteId);
      setDeleteId(null);
    }
  };

  const onSubmit = async (data: PollFormData) => {
    const formattedOptions = data.options.map((opt, index) => ({
      id: `opt-${index}`,
      text: opt.text,
      votes: opt.votes || 0
    }));

    const pollData = {
      question: data.question,
      options: formattedOptions,
      isActive: data.isActive,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined
    };

    if (selectedId) {
      await updatePoll(selectedId, pollData);
    } else {
      await createPoll(pollData);
    }

    reset({
      question: '',
      isActive: true,
      options: [
        { text: 'Option A', votes: 0 },
        { text: 'Option B', votes: 0 }
      ]
    });
    setIsEditing(false);
    setSelectedId(null);
  };

  const selectedPollForResults = polls.find(p => p.id === viewResultsId);
  const totalVotes = selectedPollForResults?.options.reduce((acc, opt) => acc + opt.votes, 0) || 0;

  return (
    <>
      <Helmet>
        <title>Manage Polls | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
              Reader Polls Directory
            </h1>
            <p className="text-neutral-500 text-xs mt-0.5">
              Create and publish interactive reader polls to boost website user engagement.
            </p>
          </div>
          
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Plus size={16} />}>
              Create New Poll
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
                  <span className="text-neutral-500 text-xs">Querying polls...</span>
                </div>
              ) : polls.length > 0 ? (
                <div className="space-y-3">
                  {polls.map((poll) => {
                    const totalPollVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
                    return (
                      <div 
                        key={poll.id}
                        className="p-4 rounded-xl border border-neutral-850 flex items-center justify-between bg-neutral-950/80 hover:border-neutral-700 transition-all group"
                      >
                        <div className="flex items-center space-x-4 overflow-hidden pr-4">
                          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                            <HelpCircle size={20} />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-semibold text-white truncate text-sm">
                              {poll.question}
                            </h4>
                            <div className="flex items-center space-x-3 text-[10px] text-neutral-500 mt-1">
                              <span className="font-bold uppercase tracking-wider">{totalPollVotes} Votes</span>
                              <span>•</span>
                              <span>Expires: {poll.expiresAt ? new Date(poll.expiresAt).toLocaleDateString() : 'Never'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3.5 flex-shrink-0">
                          {poll.isActive ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/10 border border-green-500/20 text-green-500 uppercase tracking-wide">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-500 uppercase tracking-wide">
                              Closed
                            </span>
                          )}

                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-neutral-500 hover:text-white"
                              onClick={() => setViewResultsId(poll.id)}
                              aria-label="View results"
                            >
                              <BarChart size={15} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-neutral-500 hover:text-white"
                              onClick={() => handleEdit(poll)}
                              aria-label="Edit poll"
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-neutral-500 hover:text-red-500"
                              onClick={() => setDeleteId(poll.id)}
                              aria-label="Delete poll"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center space-y-2">
                  <HelpCircle size={40} className="text-neutral-700 mx-auto" />
                  <h3 className="text-sm font-bold text-neutral-400">No Polls Active</h3>
                  <p className="text-neutral-600 text-xs">Create your first public feedback poll using the creation panel.</p>
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
                    {selectedId ? 'Edit Survey Poll' : 'New Survey Poll'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedId(null);
                      reset({
                        question: '',
                        isActive: true,
                        options: [
                          { text: 'Option A', votes: 0 },
                          { text: 'Option B', votes: 0 }
                        ]
                      });
                    }}
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Poll Question"
                    placeholder="Ask readers their thoughts..."
                    error={errors.question?.message}
                    className="bg-neutral-950 border-neutral-850 text-white"
                    {...register('question', { required: 'Question is required' })}
                  />

                  {/* Dynamic choices array */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Response Choices
                    </label>
                    
                    <div className="space-y-2">
                      {fields.map((field, idx) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <input
                            type="text"
                            required
                            placeholder={`Choice ${idx + 1}...`}
                            {...register(`options.${idx}.text` as const)}
                            className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-850 rounded-xl text-xs text-white placeholder-neutral-700 focus:outline-none"
                          />
                          {fields.length > 2 && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => append({ text: '', votes: 0 })}
                      className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center mt-2.5"
                    >
                      <Plus size={14} className="mr-1" />
                      Add Choice
                    </button>
                  </div>

                  <Input
                    type="datetime-local"
                    label="Expiration Date"
                    className="bg-neutral-950 border-neutral-850 text-white"
                    {...register('expiresAt')}
                  />

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register('isActive')}
                      className="rounded border-neutral-800 text-red-600 focus:ring-red-500 bg-neutral-950 w-4.5 h-4.5"
                    />
                    <label htmlFor="isActive" className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                      Accept responses immediately
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
                          question: '',
                          isActive: true,
                          options: [
                            { text: 'Option A', votes: 0 },
                            { text: 'Option B', votes: 0 }
                          ]
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {selectedId ? 'Apply Update' : 'Launch Poll'}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : selectedPollForResults ? (
              /* Results dashboard drawer */
              <Card className="bg-neutral-900/60 border-neutral-850 space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Poll Statistics
                  </h3>
                  <button 
                    onClick={() => setViewResultsId(null)}
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-neutral-200 text-sm leading-snug">
                    {selectedPollForResults.question}
                  </h4>
                  
                  <div className="space-y-3.5 pt-2">
                    {selectedPollForResults.options.map((opt) => {
                      const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                      return (
                        <div key={opt.id} className="space-y-1 text-xs">
                          <div className="flex justify-between font-semibold text-neutral-400">
                            <span>{opt.text}</span>
                            <span>{opt.votes} ({percentage.toFixed(0)}%)</span>
                          </div>
                          
                          <div className="w-full bg-neutral-950 h-2.5 border border-neutral-850 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850 text-neutral-500 text-[10px] uppercase font-bold tracking-wider text-center mt-6">
                    Total votes processed: {totalVotes}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-neutral-900/20 border-neutral-850 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
                <HelpCircle size={36} className="text-neutral-800" />
                <h4 className="font-bold text-neutral-400 text-sm">Engagement Surveys</h4>
                <p className="text-neutral-600 text-xs leading-relaxed max-w-xs">
                  Review metrics breakdown, toggle choices, or launch real-time audience survey scopes.
                </p>
                <Button onClick={() => setIsEditing(true)} size="sm">
                  Launch Poll Builder
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
        title="Delete Poll Survey"
        message="Are you sure you want to permanently delete this engagement poll? Voting metrics will be cleared."
      />
    </>
  );
};

export default ManagePolls;
