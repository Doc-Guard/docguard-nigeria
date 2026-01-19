import React, { useState } from 'react';
import { Image, Upload } from 'lucide-react';
import { useToast } from './Toast';

interface ProfilePictureUploadProps {
    currentPicture?: string | null;
    onUpload: (imageData: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ currentPicture, onUpload }) => {
    const [preview, setPreview] = useState<string | null>(currentPicture || null);
    const { showToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast('Please upload an image file', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onUpload(result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
                <Image size={16} className="text-emerald-600" />
                Profile Picture
            </label>

            <div className="flex items-center gap-4">
                {preview ? (
                    <img src={preview} alt="Profile" className="w-20 h-20 rounded-xl object-cover shadow-md border-2 border-emerald-100" />
                ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-[#008751] flex items-center justify-center shadow-md">
                        <Image size={32} className="text-white" />
                    </div>
                )}

                <label className="px-4 py-2 bg-emerald-50 text-[#008751] rounded-xl text-sm font-bold cursor-pointer hover:bg-emerald-100 transition-colors flex items-center gap-2">
                    <Upload size={16} />
                    Upload Photo
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            <p className="text-xs text-emerald-600/60">
                Recommended: Square image, at least 400x400px, max 5MB
            </p>
        </div>
    );
};

export default ProfilePictureUpload;
