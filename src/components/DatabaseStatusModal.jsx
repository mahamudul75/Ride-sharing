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
    const inputUrl = dbUrlInput.trim();
    if (!inputUrl) {
      setError('Please paste your Supabase PostgreSQL Connection String.');
      return;
    }

    if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
      setError('You pasted an HTTP/HTTPS Web URL. Supabase databases require a PostgreSQL connection URI starting with "postgresql://" or "postgres://". Please go to your Supabase Dashboard > Project Settings > Database > Connection string > URI, copy the Connection URI, and paste it here.');
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      setMessage(null);

      const res = await axios.post('/api/db-config', {
        databaseUrl: inputUrl
      });

      if (res.data.success) {
        localStorage.setItem('saved_supabase_db_url', dbUrlInput.trim());
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
                {dbStatus?.mode === 'cloud' && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('saved_supabase_db_url');
                      window.location.reload();
                    }}
                    className="mt-2 text-xs text-rose-400 hover:text-rose-300 hover:underline font-bold block cursor-pointer transition-colors"
                  >
                    Disconnect &amp; Switch back to Local SQLite
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Invalid Config Warning Banner */}
        {dbStatus?.hasInvalidEnvUrl && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-amber-200">
            <div className="flex items-start space-x-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>
                <span className="block uppercase tracking-wider">Incorrect DATABASE_URL in Settings</span>
                <span className="font-normal text-[11px] text-slate-300 normal-case block mt-0.5">
                  The URL configured in your Settings ends up falling back to SQLite because it is not a database connection string.
                </span>
              </div>
            </div>
            <div className="text-xs space-y-2 pt-1 border-t border-amber-500/10">
              <p className="leading-relaxed">
                Your current settings URL is: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-rose-400 text-[10px] break-all">{dbStatus.envUrl}</code>
              </p>
              <p className="leading-relaxed text-slate-300">
                This is a Web API URL (HTTP/HTTPS) or is not a valid PostgreSQL URI. Supabase has two different URLs:
              </p>
              <ul className="text-[11px] list-disc pl-5 space-y-1 text-slate-300">
                <li><strong className="text-white">Project URL</strong> (starts with <code className="text-rose-400">https://</code>): Incorrect for database connection. Used for frontend APIs.</li>
                <li><strong className="text-white">PostgreSQL URI</strong> (starts with <code className="text-emerald-400">postgresql://</code>): <strong>Correct Connection String</strong>. Used for backend database.</li>
              </ul>
              <p className="text-[11px] text-slate-400">
                Please copy the <strong className="text-white">PostgreSQL Connection String</strong> from your <strong className="text-white">Supabase Dashboard &gt; Project Settings &gt; Database &gt; Connection string &gt; URI</strong>, replace the password placeholder, and paste it below or update the App Settings.
              </p>
            </div>
          </div>
        )}

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
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3.5 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 flex items-center space-x-1.5 border-b border-slate-800 pb-1.5">
            <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-sm font-bold text-slate-200">কীভাবে কাজ করে ও সমাধান (বাংলা গাইড)</span>
          </div>
          
          <div className="space-y-2 text-[11px] leading-relaxed">
            <p>
              🚦 <strong className="text-amber-400">লগইন ও ডেটা স্টোরিং সমস্যা সমাধান:</strong> আপনার অ্যাপটি বর্তমানে <strong className="text-white">Local SQLite</strong> ডেটাবেজে কাজ করছে। তাই অ্যাপে নতুন অ্যাকাউন্ট তৈরি ও লগইন করা যাচ্ছে, কিন্তু সেই ডেটা আপনার <strong className="text-emerald-400">Supabase Dashboard</strong>-এ স্টোর হচ্ছে না।
            </p>
            <p>
              Supabase-এ সরাসরি ডেটা সেভ করতে চাইলে নিচে আপনার সঠিক <strong className="text-white">PostgreSQL Connection URI</strong> দিয়ে কানেক্ট করতে হবে।
            </p>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5 text-slate-300">
              <span className="font-bold text-emerald-400 block">কানেকশন ফেইল হওয়ার সাধারণ কারণ ও সমাধান:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong className="text-white">ভুল পাসওয়ার্ড (Password Error):</strong> আপনার পাসওয়ার্ডে যদি স্পেশাল ক্যারেক্টার থাকে (যেমন <code className="text-rose-400">@</code> বা <code className="text-rose-400">$</code>), তবে কানেকশন স্ট্রিং সঠিকমত কানেক্ট নাও হতে পারে।
                </li>
                <li>
                  <strong className="text-white">সমাধান:</strong> Supabase Dashboard-এ যান &gt; <strong className="text-white">Project Settings &gt; Database &gt; Database Password</strong>-এ গিয়ে একটি নতুন সহজ পাসওয়ার্ড সেট করুন (যেটিতে <code className="text-rose-400">@</code> ক্যারেক্টার নেই)। এরপর নতুন পাসওয়ার্ড দিয়ে নিচের মত করে কানেকশন স্ট্রিংটি এখানে পেস্ট করুন:
                  <code className="block bg-slate-950 p-1.5 rounded text-purple-300 font-mono text-[10px] break-all mt-1">
                    postgresql://postgres:[YOUR_NEW_PASSWORD]@db.gcwqhpybbquvbikzbiho.supabase.co:5432/postgres
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions footer English */}
        <div className="p-3 bg-slate-950/40 border border-slate-800/50 rounded-xl space-y-1.5 text-[10px] text-slate-500">
          <div className="font-semibold text-slate-400 flex items-center space-x-1">
            <span>How Data Persistence Works (English):</span>
          </div>
          <p>
            1. <strong>Local Mode:</strong> Registration, ride postings, and requests are saved locally in <code className="text-slate-400">campus_ride_sharing.sqlite</code>.
          </p>
          <p>
            2. <strong>Supabase Mode:</strong> Once successfully connected, all database transactions run directly on your live Supabase cloud database.
          </p>
        </div>

      </div>
    </div>
  );
};
