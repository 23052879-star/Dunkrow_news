import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Download, Trash2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { formatDistanceToNow } from 'date-fns';

interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const ManageNewsletterSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(sub => sub.is_active).length || 0;
      const inactive = total - active;
      
      setStats({ total, active, inactive });
    } catch (error) {
      console.error('Error fetching newsletter subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubscriptionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSubscriptions(subscriptions.map(sub => 
        sub.id === id ? { ...sub, is_active: !currentStatus } : sub
      ));

      // Update stats
      const newActive = currentStatus ? stats.active - 1 : stats.active + 1;
      setStats({ ...stats, active: newActive, inactive: stats.total - newActive });
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const deletedSub = subscriptions.find(sub => sub.id === id);
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      
      // Update stats
      const newTotal = stats.total - 1;
      const newActive = deletedSub?.is_active ? stats.active - 1 : stats.active;
      setStats({ total: newTotal, active: newActive, inactive: newTotal - newActive });
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const exportSubscriptions = () => {
    const activeSubscriptions = subscriptions.filter(sub => sub.is_active);
    const emails = activeSubscriptions.map(sub => sub.email).join('\n');
    
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Newsletter Subscriptions | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Newsletter Subscriptions
          </h1>
          <Button 
            onClick={exportSubscriptions}
            leftIcon={<Download size={16} />}
            disabled={stats.active === 0}
          >
            Export Active Emails
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Total Subscriptions
                </p>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {stats.total}
                </h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <Mail size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Active Subscriptions
                </p>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {stats.active}
                </h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <Mail size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Inactive Subscriptions
                </p>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {stats.inactive}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Card>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : subscriptions.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-white">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-white">
                      Subscribed
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr 
                      key={subscription.id}
                      className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Mail size={16} className="text-neutral-400 mr-2" />
                          <span className="text-neutral-900 dark:text-white">
                            {subscription.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {formatDistanceToNow(new Date(subscription.subscribed_at), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          subscription.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {subscription.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSubscriptionStatus(subscription.id, subscription.is_active)}
                          >
                            {subscription.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSubscription(subscription.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
                No newsletter subscriptions found
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default ManageNewsletterSubscriptions;