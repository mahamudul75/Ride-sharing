import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, BookOpen, Car, Save, ShieldCheck, CheckCircle2, Camera, Upload, Trash2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);

  const presetAvatars = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=150"
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setProfileImage(user.profile_image || '');
      setVehicleName(user.vehicle_name || '');
      setVehicleNumber(user.vehicle_number || '');
      setVehicleType(user.vehicle_type || 'Car');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) { // 8MB limit
      setUploadError('Image size must be less than 8MB.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Target resolution: 200x200 square pixel avatar is highly detailed yet optimized
        const targetSize = 200;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Calculate source cropping region to keep it perfectly centered and square
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;

        ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, targetSize, targetSize);

        // Compress and encode to high-performance JPEG data URL
        const base64Image = canvas.toDataURL('image/jpeg', 0.85);
        setProfileImage(base64Image);
      };
      img.onerror = () => {
        setUploadError('Could not process this image file. Please try another one.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileImage('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMsg(null);
      const res = await axios.put('/api/users/profile', {
        name,
        phone,
        department,
        profile_image: profileImage,
        vehicle_name: vehicleName,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <User className="w-7 h-7 text-emerald-400" />
            <span>Manage Account Profile</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Update your contact details, academic department, and vehicle registration.
          </p>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="hover:underline">Dismiss</button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          {/* Professional Avatar Upload Section */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border-b border-slate-800 pb-8">
            {/* Interactive Avatar Wrapper */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-24 h-24 rounded-full cursor-pointer overflow-hidden border-2 border-slate-700 hover:border-emerald-500 shadow-lg transition-all duration-300 flex-shrink-0"
              title="Click to upload profile picture"
            >
              <img
                src={profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                alt={user.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">Update</span>
              </div>
            </div>

            {/* Profile Meta & Actions */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                <p className="text-xs text-emerald-400 font-semibold capitalize flex items-center justify-center sm:justify-start space-x-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{user.role} • {user.email}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-100 transition-all flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </button>
                
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 border border-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>

              {uploadError && (
                <p className="text-[11px] text-rose-400 font-medium">{uploadError}</p>
              )}
            </div>

            {/* Hidden Input File - works for both computers & mobile gallery/camera */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Quick Preset Avatars Picker */}
          <div className="border-b border-slate-800 pb-6">
            <label className="block text-xs font-bold text-slate-400 mb-2.5">Or choose a stylized placeholder profile picture:</label>
            <div className="flex flex-wrap gap-3.5 justify-center sm:justify-start">
              {presetAvatars.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setProfileImage(url);
                    setUploadError(null);
                  }}
                  className={`relative w-11 h-11 rounded-full overflow-hidden transition-all duration-200 border-2 cursor-pointer ${
                    profileImage === url 
                      ? 'border-emerald-500 scale-105 ring-2 ring-emerald-500/20 shadow-md' 
                      : 'border-slate-800 hover:border-slate-600 hover:scale-105'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  {profileImage === url && (
                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 bg-slate-950 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Profile Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar Image URL (Optional Fallback)</label>
                <input
                  type="text"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                  placeholder="Paste external image URL if preferred"
                />
              </div>

            </div>

            {/* Vehicle Details for Drivers */}
            {(user.role === 'driver' || user.role === 'admin') && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 pt-4">
                <h4 className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                  <Car className="w-4 h-4" />
                  <span>Driver Vehicle Info</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Vehicle Name</label>
                    <input
                      type="text"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Registration No</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="Car">Car</option>
                      <option value="Bike">Bike / Motorcycle</option>
                      <option value="Microbus">Microbus</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
