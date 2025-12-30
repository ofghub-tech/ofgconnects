import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop'; 
import Modal from '../components/Modal';
import Avatar from '../components/Avatar'; 
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; // Using HeroIcon for Logout

// --- CROP UTILS ---
const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => { canvas.toBlob((blob) => resolve(blob), 'image/jpeg'); });
};

// --- SUB-COMPONENTS ---
const SettingsButton = ({ children, isLoading, variant = 'primary', ...props }) => {
    const baseStyle = "flex items-center justify-center rounded-md py-2.5 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200";
    const variants = {
        primary: "border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500",
        danger: "border border-red-300 bg-white text-red-700 hover:bg-red-50 dark:bg-transparent dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 focus:ring-red-500"
    };
    return (
        <button className={`${baseStyle} ${variants[variant]}`} disabled={isLoading} {...props}>
            {isLoading ? 'Processing...' : children}
        </button>
    );
};

const SettingsPage = () => {
    const { user, uploadProfileImage, deleteAccount, logoutUser } = useAuth(); 
    const navigate = useNavigate();

    // Image State
    const [selectedImg, setSelectedImg] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imgUploading, setImgUploading] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    // --- AVATAR HANDLERS ---
    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => { setSelectedImg(reader.result); setShowCropModal(true); });
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);
    
    const handleUploadAvatar = async () => {
        try {
            setImgUploading(true);
            const croppedBlob = await getCroppedImg(selectedImg, croppedAreaPixels);
            const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
            await uploadProfileImage(file);
            setShowCropModal(false); setSelectedImg(null);
        } catch (error) { alert(error.message); } finally { setImgUploading(false); }
    };

    // --- LOGOUT HANDLER ---
    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/'); // Send back to Login/Landing page
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // --- DELETE ACCOUNT HANDLER ---
    const handleDeleteAccount = async () => {
        if (deleteInput !== 'DELETE') return;
        setDeleteLoading(true);
        try {
            await deleteAccount();
            navigate('/');
        } catch (error) {
            alert("Failed to delete account: " + error.message);
        }
        setDeleteLoading(false);
    };

    return (
        <div className="w-full p-4 py-8 sm:p-12 min-h-screen">
            <div className="mx-auto max-w-xl space-y-6">
                <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">Settings</h1>

                {/* --- 1. PROFILE PICTURE --- */}
                <div className="glass-panel p-8 text-center relative overflow-hidden shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Profile Picture</h2>
                    
                    <div className="relative inline-block group mx-auto">
                        <Avatar 
                            url={user?.prefs?.avatar} 
                            name={user?.name} 
                            size="xl" // 120px
                            className="ring-4 ring-blue-500/20 shadow-lg" 
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                        </label>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Click image to change</p>
                </div>

                {/* --- 2. SESSION (LOGOUT) --- */}
                <div className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Session</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Log out of your account on this device.
                        </p>
                    </div>
                    <SettingsButton variant="secondary" onClick={handleLogout} className="w-full sm:w-auto">
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                        Log Out
                    </SettingsButton>
                </div>

                {/* --- 3. DANGER ZONE --- */}
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/10 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Delete Account</h2>
                            <p className="mt-1 text-sm text-red-600/80 dark:text-red-300/70 max-w-sm">
                                Permanently remove your profile and content.
                            </p>
                        </div>
                        <SettingsButton variant="danger" onClick={() => setShowDeleteModal(true)} className="w-full sm:w-auto">
                            Delete Account
                        </SettingsButton>
                    </div>
                </div>
            </div>

            {/* --- CROP MODAL --- */}
            {showCropModal && (
                <Modal onClose={() => setShowCropModal(false)}>
                    <div className="p-4">
                        <h3 className="text-lg font-medium text-center mb-4 text-gray-900 dark:text-gray-100">Adjust Picture</h3>
                        <div className="h-64 w-full relative bg-black rounded-lg overflow-hidden">
                            <Cropper image={selectedImg} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} cropShape="round" />
                        </div>
                        <div className="mt-4 flex flex-col gap-4">
                            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(e.target.value)} className="w-full" />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowCropModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                                <button onClick={handleUploadAvatar} disabled={imgUploading} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50">{imgUploading ? 'Saving...' : 'Set Picture'}</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {showDeleteModal && (
                <Modal onClose={() => setShowDeleteModal(false)}>
                    <div className="p-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-gray-100">Are you absolutely sure?</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            This action will permanently delete your account.
                        </p>
                        
                        <div className="mt-4">
                            <label className="block text-xs text-left text-gray-500 mb-1 ml-1">Type <span className="font-bold">DELETE</span> to confirm</label>
                            <input 
                                type="text" 
                                className="w-full rounded-md border border-gray-300 p-2 text-center uppercase focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="DELETE"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                            />
                        </div>

                        <div className="mt-6 flex justify-center gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                            <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETE' || deleteLoading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-all">{deleteLoading ? 'Deleting...' : 'Confirm Delete'}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SettingsPage;