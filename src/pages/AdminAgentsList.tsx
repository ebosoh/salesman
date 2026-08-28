import React, { useState, useEffect } from 'react';
import { api } from '../services/supabase';
import type { Profile, ClientVisit } from '../types';
import { Users, UserPlus, Phone, Shield, CheckCircle2, XCircle, Search, Edit2 } from 'lucide-react';

export const AdminAgentsList: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [visits, setVisits] = useState<ClientVisit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentPin, setNewAgentPin] = useState('1234');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, v] = await Promise.all([api.getProfiles(), api.getVisits()]);
      setProfiles(p);
      setVisits(v);
    } catch (err) {
      console.error('Failed to load agents list', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !newAgentPhone) return;

    const newProfile: Profile = {
      id: `agent-${Date.now()}`,
      full_name: newAgentName.trim(),
      phone_number: newAgentPhone.trim(),
      role: 'field_agent',
      device_fingerprint: `FP-${Math.random().toString(36).substr(2, 6).toUpperCase()}-KE`,
      pin: newAgentPin || '1234',
      is_active: true
    };

    await api.saveProfile(newProfile);
    setProfiles((prev) => [...prev, newProfile]);
    setIsAddModalOpen(false);
    setNewAgentName('');
    setNewAgentPhone('');
    setNewAgentPin('1234');
  };

  const toggleAgentActive = async (profile: Profile) => {
    const updated = { ...profile, is_active: !profile.is_active };
    await api.saveProfile(updated);
    setProfiles((prev) => prev.map((p) => (p.id === profile.id ? updated : p)));
  };

  const filteredAgents = profiles.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.full_name.toLowerCase().includes(q) || p.phone_number.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Representatives Roster</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage field agents, device bindings, and authorization PINs
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition active:scale-95 min-h-[44px]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Field Agent</span>
        </button>
      </div>

      {/* Agents Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[40px]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Agent Name</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Device Fingerprint</th>
                <th className="py-3.5 px-4">Total Visits</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAgents.map((profile) => {
                const agentVisits = visits.filter((v) => v.agent_id === profile.id);
                return (
                  <tr key={profile.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                          {profile.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{profile.full_name}</p>
                          <p className="text-[10px] text-slate-400">PIN: {profile.pin || '1234'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{profile.phone_number}</td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                        {profile.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {profile.device_fingerprint || 'FP-UNASSIGNED'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{agentVisits.length} visits</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          profile.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleAgentActive(profile)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${
                          profile.is_active
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {profile.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-extrabold text-lg text-slate-900">Add New Field Sales Agent</h3>
            <form onSubmit={handleAddAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paul Otieno"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (Kenya)</label>
                <input
                  type="tel"
                  required
                  placeholder="07XXXXXXXX"
                  value={newAgentPhone}
                  onChange={(e) => setNewAgentPhone(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Authorization PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newAgentPin}
                  onChange={(e) => setNewAgentPin(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-bold text-xs shadow min-h-[44px]"
                >
                  Create Profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
