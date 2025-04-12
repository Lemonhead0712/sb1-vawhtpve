import React, { useEffect, useState } from 'react';
import { supabase, getUser } from '../lib/supabase';
import { Loader, Edit2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    birthdate: '',
    bio: '',
  });

  // Get and set the current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const user = await getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);
    };
    fetchUserId();
  }, []);

  // Load profile if it exists
  useEffect(() => {
    const loadProfile = async () => {
      const user = await getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          birthdate: data.birthdate || '',
          bio: data.bio || '',
        });
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  // Save profile with upsert
  const handleSave = async () => {
    if (!userId) return;

    setLoading(true);
    setSuccess(false);

    console.log('Saving with userId:', userId);
    console.log('Sending form data:', form);

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: form.full_name || '',
      email: form.email || '',
      phone: form.phone || '',
      location: form.location || '',
      birthdate: form.birthdate?.trim() || null,
      bio: form.bio || '',
      updated_at: new Date().toISOString(),
    });

    if (!error) {
      setProfile(form);
      setSuccess(true);
      setEditing(false);
    } else {
      console.error('Save failed:', error);
      alert(`Save failed: ${error.message || 'Unknown error'}`);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
            <path d="M6.343 18.657A8 8 0 0112 16a8 8 0 015.657 2.343" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">{form.full_name || 'Your Name'}</h2>
        <p className="text-sm text-white/80">{form.bio || 'Add a short bio'}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-pink-500 hover:text-pink-600 flex items-center"
            >
              <Edit2 className="w-4 h-4 mr-1" /> Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="text-sm text-pink-500 hover:text-pink-600 flex items-center"
            >
              <Save className="w-4 h-4 mr-1" /> Save
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-100 text-green-800 text-sm px-4 py-2 rounded-md border border-green-300">
            Profile saved successfully.
          </div>
        )}

        {Object.entries(form).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium capitalize text-gray-600 mb-1">
              {key.replace('_', ' ')}
            </label>

            {key === 'birthdate' ? (
              <input
                type="date"
                name="birthdate"
                value={value}
                onChange={(e) =>
                  setForm({ ...form, birthdate: e.target.value })
                }
                disabled={!editing}
                className="w-full px-4 py-2 border rounded-md text-sm text-gray-800 bg-gray-50 focus:outline-pink-500"
              />
            ) : (
              <input
                type="text"
                name={key}
                value={value}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2 border rounded-md text-sm text-gray-800 bg-gray-50 focus:outline-pink-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
