import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { User, Shield, Ban } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface Profile {
  id: string;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
  banned?: boolean;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banned: !currentBanStatus })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, banned: !currentBanStatus } : user
      ));
    } catch (error) {
      console.error('Error toggling user ban status:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Users | Dunkrow Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Manage Users
          </h1>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {users.length} total users
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-24 animate-pulse" />
              ))}
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <Card key={user.id}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                      <User size={20} className="text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {user.username}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                      className={user.role === 'admin' ? 'text-primary-600' : ''}
                      aria-label={`Make ${user.role === 'admin' ? 'user' : 'admin'}`}
                    >
                      <Shield size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => toggleUserBan(user.id, user.banned || false)}
                      className={user.banned ? 'text-red-600' : ''}
                      aria-label={user.banned ? 'Unban user' : 'Ban user'}
                    >
                      <Ban size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-center text-neutral-600 dark:text-neutral-400">
                No users found
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageUsers;