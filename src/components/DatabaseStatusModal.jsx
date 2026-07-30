import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, CheckCircle, AlertTriangle, RefreshCw, Server, Globe, Key, HelpCircle, X, ExternalLink } from 'lucide-react';

export const DatabaseStatusModal = ({ isOpen, onClose }) => {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbUrlInput, setDbUrlInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/db-status');
      if (res.data) {
        setDbStatus(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setMessage(null);
      setError(null);
    }
  }, [isOpen]);

  const handleConnectSupabase = async (e) => {
    e.preventDefault();
    if (!dbUrlInput.trim()) {
      setError('Please paste your Supabase PostgreSQL Connection String.');
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      setMessage(null);

      const res = await axios.post('/api/db-config', {
        databaseUrl: dbUrlInput.trim()
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setDbStatus(res.data.status);
        setDbUrlInput('');
      } else {
        setError(res.data.message || 'Failed to connect to Supabase.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Database connection error. Please check your Supabase URL and password.');
    } finally {
      setConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Database Engine & Supabase Sync</h2>
            <p className="text-xs text-slate-400">Configure PostgreSQL or view persistent storage status</p>
          </div>
        </div>

        {/* Current Database Mode Card */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Active Database</label>
          {loading ? (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center space-x-2 text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span className="text-xs">Checking database engine...</span>
            </div>
          ) : (
            <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
              dbStatus?.mode === 'cloud'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              {dbStatus?.mode === 'cloud' ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-white">{dbStatus?.type || 'Database Engine'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    dbStatus?.mode === 'cloud' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {dbStatus?.mode === 'cloud' ? 'Cloud Sync Active' : 'Local Persistence'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {dbStatus?.details}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status Feedback Messages */}
        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Connect External Supabase Form */}
        <form onSubmit={handleConnectSupabase} className="space-y-4 pt-2 border-t border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-200">Connect Your Supabase PostgreSQL URL</label>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Paste your Supabase connection string below (e.g., from <code className="text-purple-300">Project Settings &gt; Database &gt; Connection string &gt; URI</code>).
            </p>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="postgresql://postgres:[PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
                value={dbUrlInput}
                onChange={(e) => setDbUrlInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={connecting || !dbUrlInput.trim()}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
          >
            {connecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Testing &amp; Syncing Supabase...</span>
              </>
            ) : (
              <>
                <Server className="w-4 h-4" />
                <span>Connect &amp; Sync with Supabase Database</span>
              </>
            )}
          </button>
        </form>

        {/* Instructions footer */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>How Registration Data Persistence Works:</span>
          </div>
          <p>
            1. <strong>Local Mode:</strong> Registration, ride postings, and ride requests are immediately saved into the local SQLite file (<code className="text-slate-300">campus_ride_sharing.sqlite</code>).
          </p>
          <p>
            2. <strong>Supabase Mode:</strong> Once connected, registrations and ride data are written directly to your live Supabase cloud database tables in real-time. Sequence numbers are auto-aligned so no duplicate ID collisions occur.
          </p>
        </div>

      </div>
    </div>
  );
};
