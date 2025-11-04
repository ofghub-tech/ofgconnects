// src/pages/SettingsPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// --- Reusable UI Components ---
const SettingsInput = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
        </label>
        <input
            id={id}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            {...props}
        />
    </div>
);

const SettingsButton = ({ children, isLoading, ...props }) => (
    <button
        className="flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
        disabled={isLoading}
        {...props}
    >
        {isLoading ? 'Saving...' : children}
    </button>
);

const Message = ({ text, type }) => {
    const baseClasses = "text-sm font-medium p-3 rounded-md my-2";
    const typeClasses = {
        success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`}>
            {text}
        </div>
    );
};
// --- End UI Components ---

// --- NEW ICONS FOR THEME ---
const SunIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12a2.25 2.25 0 00-2.25 2.25v.01c0 .317.031.63.09 1.15a3.744 3.744 0 01-1.31 3.298 3.744 3.744 0 01-4.903-1.085 3.744 3.744 0 01-1.085-4.903A3.745 3.745 0 016.6 6.6a3.745 3.745 0 013.298-1.31c.52.059 1.033.09 1.15.09v.01A2.25 2.25 0 0012 3z" />
    </svg>
);
const MoonIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);
const ComputerIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0115 18.257V17.25m-6 0V3m6 0v14.25m-6 0h6m-7.5-3h9M3 12h18M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
    </svg>
);
// --- END NEW ICONS ---

// --- NEW THEME OPTION COMPONENT ---
const ThemeOption = ({ value, label, icon, currentTheme, setTheme }) => {
    const isChecked = currentTheme === value;
    return (
        <label className={`flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 transition-all ${isChecked ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
            <input
                type="radio"
                name="theme"
                value={value}
                checked={isChecked}
                onChange={(e) => setTheme(e.target.value)}
                className="sr-only" // Hide the actual radio button
            />
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </label>
    );
};
// --- END NEW COMPONENT ---


const SettingsPage = () => {
    const { user, updateUserName, updateUserPassword, theme, setTheme } = useAuth(); // <-- Get theme state

    // State for forms
    const [name, setName] = useState(user?.name || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for UI feedback
    const [nameLoading, setNameLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [nameMessage, setNameMessage] = useState(null); // { type: 'success' | 'error', text: '...' }
    const [passMessage, setPassMessage] = useState(null);

    // Sync state if user object changes
    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);

    const handleUpdateName = async (e) => {
        e.preventDefault();
        setNameLoading(true);
        setNameMessage(null);
        try {
            await updateUserName(name);
            setNameMessage({ type: 'success', text: 'Name updated successfully!' });
        } catch (error) {
            setNameMessage({ type: 'error', text: error.message || 'Failed to update name.' });
        }
        setNameLoading(false);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPassLoading(true);
        setPassMessage(null);

        if (newPassword !== confirmPassword) {
            setPassMessage({ type: 'error', text: 'New passwords do not match.' });
            setPassLoading(false);
            return;
        }

        try {
            await updateUserPassword(newPassword, oldPassword);
            setPassMessage({ type: 'success', text: 'Password updated successfully!' });
            // Clear password fields
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPassMessage({ type: 'error', text: error.message || 'Failed to update password. Check your old password.' });
        }
        setPassLoading(false);
    };


    return (
        <div className="w-full p-4 py-8 sm:p-12">
            <div className="mx-auto max-w-3xl space-y-8">
                
                <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Account Settings
                </h1>

                {/* --- NEW THEME CARD --- */}
                <div className="overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
                    <div className="p-8">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Appearance</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Choose how OfgConnects looks to you.</p>

                        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                            <ThemeOption
                                value="light"
                                label="Light"
                                icon={<SunIcon className="h-8 w-8 text-gray-700 dark:text-gray-300" />}
                                currentTheme={theme}
                                setTheme={setTheme}
                            />
                            <ThemeOption
                                value="dark"
                                label="Dark"
                                icon={<MoonIcon className="h-8 w-8 text-gray-700 dark:text-gray-300" />}
                                currentTheme={theme}
                                setTheme={setTheme}
                            />
                            <ThemeOption
                                value="system"
                                label="System"
                                icon={<ComputerIcon className="h-8 w-8 text-gray-700 dark:text-gray-300" />}
                                currentTheme={theme}
                                setTheme={setTheme}
                            />
                        </div>
                    </div>
                </div>
                {/* --- END NEW THEME CARD --- */}


                {/* --- Settings Card (Added dark mode classes) --- */}
                <div className="overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
                    
                    {/* --- Update Name Form --- */}
                    <form onSubmit={handleUpdateName} className="space-y-6 p-8">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Profile Information</h2>

                        {nameMessage && <Message type={nameMessage.type} text={nameMessage.text} />}

                        <SettingsInput
                            label="Email"
                            id="email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm dark:bg-gray-700 dark:text-gray-300"
                        />

                        <SettingsInput
                            label="Full Name"
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div className="flex justify-end">
                            <SettingsButton type="submit" isLoading={nameLoading}>
                                Save Name
                            </SettingsButton>
                        </div>
                    </form>

                    <hr className="dark:border-gray-700" />

                    {/* --- Update Password Form --- */}
                    <form onSubmit={handleUpdatePassword} className="space-y-6 p-8">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Change Password</h2>

                        {passMessage && <Message type={passMessage.type} text={passMessage.text} />}

                        <SettingsInput
                            label="Old Password"
                            id="oldPassword"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />

                        <SettingsInput
                            label="New Password"
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />

                        <SettingsInput
                            label="Confirm New Password"
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <div className="flex justify-end">
                            <SettingsButton type="submit" isLoading={passLoading}>
                                Change Password
                            </SettingsButton>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;