'use client';

import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SettingsPage() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPlan, setCurrentPlan] = useState({
    name: 'Free Plan',
    renewalDate: 'N/A',
    usageQuota: 'Limited',
  });

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  // Handle photo upload
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile photo must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        setError(null);
        setShowPhotoOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input
  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  // Update profile
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  // Change password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    try {
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to change password. Please try again.');
    }
  };

  // Toggle theme
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          Settings
        </h1>

        {/* Profile Section */}
        <section className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Photo */}
            <div className="flex justify-center items-center md:justify-start">
              <div className="relative">
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer"
                  onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                >
                  {profilePhoto ? (
                    <Image src={profilePhoto} alt="Profile" fill className="object-cover" />
                  ) : (
                    <span className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      No Photo
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {showPhotoOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-24 left-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-md p-2 z-10"
                    >
                      <button
                        onClick={() => {
                          if (profilePhoto) setViewPhoto(true);
                          setShowPhotoOptions(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        disabled={!profilePhoto}
                      >
                        View Photo
                      </button>
                      <button
                        onClick={handleChangePhoto}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Change Photo
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name and Email */}
            <div className="flex-1">
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </form>
            </div>

            {/* Current Plan */}
            <div className="flex-1 bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Current Plan</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Plan:</span> {currentPlan.name}
                </p>
                <p>
                  <span className="font-medium">Renewal Date:</span> {currentPlan.renewalDate}
                </p>
                <p>
                  <span className="font-medium">Usage Quota:</span> {currentPlan.usageQuota}
                </p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  Manage Plan
                </Button>
              </div>
            </div>
          </div>

          {/* Full-size Photo */}
          <AnimatePresence>
            {viewPhoto && profilePhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setViewPhoto(false)}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="relative max-w-md w-full"
                >
                  <Image
                    src={profilePhoto}
                    alt="Full-size Profile"
                    width={400}
                    height={400}
                    className="rounded-lg object-cover w-full h-auto"
                  />
                  <button
                    onClick={() => setViewPhoto(false)}
                    className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2"
                  >
                    ✕
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Change Password */}
        <section className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Change Password
            </Button>
          </form>
        </section>

        {/* Theme */}
        <section className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Theme</h2>
          <div className="flex items-center gap-4">
            <Label htmlFor="theme-toggle">Dark Mode</Label>
            <Switch
              id="theme-toggle"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </section>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-xl"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-xl"
          >
            {success}
          </motion.div>
        )}
      </div>
    </main>
  );
}