import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  Search, 
  Shield, 
  Ban, 
  Check, 
  X, 
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  role: 'admin' | 'editor' | 'reporter' | 'contributor' | 'user';
  banned: boolean;
  bio?: string;
  created_at: string;
}

export const ManageUsers: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [banUserId, setBanUserId] = useState<string | null>(null);
  const [banStatus, setBanStatus] = useState<boolean>(false);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching user profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole as any } : p));
    } catch (err) {
      console.error('Error changing user role:', err);
    }
  };

  const handleBanToggle = async () => {
    if (!banUserId) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banned: banStatus })
        .eq('id', banUserId);

      if (error) throw error;
      
      setProfiles(profiles.map(p => p.id === banUserId ? { ...p, banned: banStatus } : p));
      setBanUserId(null);
    } catch (err) {
      console.error('Error toggling user ban:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 uppercase tracking-wide">
            <Shield size={12} />
            <span>Super Admin</span>
          </span>
        );
      case 'editor':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-500 uppercase tracking-wide">
            <Lock size={12} />
            <span>Editor</span>
          </span>
        );
      case 'reporter':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-500 uppercase tracking-wide">
            <UserCheck size={12} />
            <span>Reporter</span>
          </span>
        );
      case 'contributor':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 uppercase tracking-wide">
            <UserCheck size={12} />
            <span>Contributor</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-400 uppercase tracking-wide">
            <span>Reader</span>
          </span>
        );
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Manage Users | Dunkrow CMS</title>
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
              User Directory & RBAC
            </h1>
            <p className="text-neutral-500 text-xs mt-0.5">
              Review user profiles, assign editorial permissions (RBAC), and manage suspensions.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-neutral-600" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by username..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-300 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* Users Card Table */}
        <Card className="bg-neutral-900/40 border-neutral-850 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
              <span className="text-neutral-500 text-xs">Accessing user directory...</span>
            </div>
          ) : filteredProfiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500 text-xs font-semibold uppercase tracking-wider bg-neutral-900/80">
                    <th className="p-4">User</th>
                    <th className="p-4">Role Badge</th>
                    <th className="p-4">Assign Role Permission</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredProfiles.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-900/50 transition-colors group">
                      <td className="p-4 flex items-center space-x-3.5">
                        <img 
                          src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}&background=random`} 
                          alt="Avatar" 
                          className="w-9 h-9 rounded-full object-cover border border-neutral-800"
                        />
                        <div>
                          <span className="block font-bold text-neutral-200 group-hover:text-white">{p.username}</span>
                          <span className="text-[10px] text-neutral-600 block truncate max-w-[200px]" title={p.bio}>
                            {p.bio || 'No bio written'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(p.role)}
                      </td>
                      <td className="p-4">
                        <select
                          value={p.role}
                          onChange={(e) => handleRoleChange(p.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                        >
                          <option value="user">Reader</option>
                          <option value="contributor">Contributor</option>
                          <option value="reporter">Reporter</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="p-4 text-neutral-400 font-medium">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {p.banned ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-green-500 font-bold text-xs"
                            onClick={() => {
                              setBanUserId(p.id);
                              setBanStatus(false);
                            }}
                          >
                            Unban User
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-neutral-500 hover:text-red-500 font-bold text-xs"
                            onClick={() => {
                              setBanUserId(p.id);
                              setBanStatus(true);
                            }}
                          >
                            Ban User
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center space-y-2">
              <Users size={40} className="text-neutral-700 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-400">No Users Found</h3>
            </div>
          )}
        </Card>
      </div>

      {/* Ban confirm modal */}
      <ConfirmDialog
        isOpen={banUserId !== null}
        onClose={() => setBanUserId(null)}
        onConfirm={handleBanToggle}
        title={banStatus ? 'Ban User Profile' : 'Revoke User Ban'}
        message={
          banStatus 
            ? 'Are you sure you want to suspend this reader account? They will lose publication commenting, bookmarks, and draft access rights.'
            : 'Are you sure you want to revoke the suspension for this reader? They will regain posting and drafting rights.'
        }
      />
    </>
  );
};

export default ManageUsers;