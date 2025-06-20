"use client";

import { useState } from 'react';

interface DeleteModConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (deleteFiles: boolean) => void;
    modTitle: string;
    isPending: boolean;
}

export default function DeleteModConfirmationModal({ isOpen, onClose, onConfirm, modTitle, isPending }: DeleteModConfirmationModalProps) {
    const [deleteFiles, setDeleteFiles] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">Delete Mod</h2>
                <p className="text-gray-300 mb-4">
                    Are you sure you want to delete the mod <span className="font-semibold text-purple-400">{modTitle}</span>?
                </p>
                <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
                    <p className="font-bold">Warning!</p>
                    <p>This action cannot be undone. Please choose carefully how to handle associated files.</p>
                </div>
                <div className="flex items-center mb-6">
                    <input
                        id="deleteFilesCheckbox"
                        type="checkbox"
                        checked={deleteFiles}
                        onChange={(e) => setDeleteFiles(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="deleteFilesCheckbox" className="ml-2 text-sm font-medium text-gray-300">
                        Permanently delete all associated files (images, mod files) from storage.
                    </label>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                    If you don&apos;t check this box, the files will be moved to an archive folder instead of being permanently deleted.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(deleteFiles)}
                        disabled={isPending}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Deleting...' : `Delete Mod`}
                    </button>
                </div>
            </div>
        </div>
    );
}
