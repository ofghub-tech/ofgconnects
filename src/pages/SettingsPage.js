import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop'; 
import Modal from '../components/Modal';
import Avatar from '../components/Avatar'; 
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import './SettingsPage.css';

// --- CROP UTILS (UNCHANGED) ---
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

// --- BUTTON ---
const SettingsButton = ({ children, isLoading, variant = 'primary', ...props }) => {
    return (
        <button className={`btn ${variant}`} disabled={isLoading} {...props}>
            {isLoading ? 'Processing...' : children}
        </button>
    );
};

const SettingsPage = () => {
    const { user, uploadProfileImage, deleteAccount, logoutUser } = useAuth(); 
    const navigate = useNavigate();

    const [selectedImg, setSelectedImg] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imgUploading, setImgUploading] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const onFileChange = (e) => {
        if (e.target.files?.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImg(reader.result);
                setShowCropModal(true);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

    const handleUploadAvatar = async () => {
        try {
            setImgUploading(true);
            const blob = await getCroppedImg(selectedImg, croppedAreaPixels);
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            await uploadProfileImage(file);
            setShowCropModal(false);
        } catch (e) {}
        setImgUploading(false);
    };

    const handleLogout = async () => {
        await logoutUser();
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (deleteInput !== 'DELETE') return;
        setDeleteLoading(true);
        await deleteAccount();
        navigate('/');
    };

    return (
        <div className="settings-page">
            <div className="settings-container">

                <h1 className="title">Settings</h1>

                {/* PROFILE */}
                <div className="card center">
                    <h2>Profile Picture</h2>

                    <div className="avatar-wrapper">
                        <Avatar url={user?.prefs?.avatar} name={user?.name} />

                        <label className="avatar-overlay">
                            <input type="file" hidden onChange={onFileChange} />
                            Change
                        </label>
                    </div>

                    <p>Click image to change</p>
                </div>

                {/* SESSION */}
                <div className="card row">
                    <div>
                        <h2>Session</h2>
                        <p>Log out of your account.</p>
                    </div>

                    <SettingsButton variant="secondary" onClick={handleLogout}>
                        <ArrowRightOnRectangleIcon className="icon" />
                        Log Out
                    </SettingsButton>
                </div>

                {/* DELETE */}
                <div className="danger-box">
                    <div className="row">
                        <div>
                            <h2>Delete Account</h2>
                            <p>Permanently remove your account.</p>
                        </div>

                        <SettingsButton variant="danger" onClick={() => setShowDeleteModal(true)}>
                            Delete
                        </SettingsButton>
                    </div>
                </div>
            </div>

            {/* MODALS (UNCHANGED STRUCTURE) */}
            {showCropModal && (
                <Modal onClose={() => setShowCropModal(false)}>
                    <div className="modal-box">
                        <h3>Adjust Picture</h3>

                        <div className="crop-area">
                            <Cropper image={selectedImg} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                        </div>

                        <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(e.target.value)} />

                        <div className="modal-actions">
                            <button onClick={() => setShowCropModal(false)}>Cancel</button>
                            <button onClick={handleUploadAvatar}>
                                {imgUploading ? 'Saving...' : 'Set Picture'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showDeleteModal && (
                <Modal onClose={() => setShowDeleteModal(false)}>
                    <div className="modal-box center">
                        <h3>Are you sure?</h3>

                        <input
                            placeholder="DELETE"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button onClick={handleDeleteAccount}>
                                {deleteLoading ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SettingsPage;