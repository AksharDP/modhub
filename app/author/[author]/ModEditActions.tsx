"use client";
import { useState } from "react";
import { trpc } from "@/app/lib/trpc";
import ModEditModal from "@/app/admin/components/ModEditModal";
import type { Mod } from "@/app/db/schema";

interface AuthorModActionsProps {
    mod: Mod;
    onModUpdated: () => void;
    onModDeleted: () => void;
}

export default function AuthorModActions({ mod, onModUpdated, onModDeleted }: AuthorModActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [isVisibilityPending, setIsVisibilityPending] = useState(false);
    const [isDeletePending, setIsDeletePending] = useState(false);
    const updateModStatus = trpc.admin.updateModStatus.useMutation();
    const deleteMod = trpc.admin.deleteMod.useMutation();

    const handleToggleVisibility = async () => {
        setIsVisibilityPending(true);
        await updateModStatus.mutateAsync({
            modId: mod.id,
            isActive: !mod.isActive,
        });
        setIsVisibilityPending(false);
        onModUpdated();
    };

    const handleDelete = async () => {
        setIsDeletePending(true);
        await deleteMod.mutateAsync({ modId: mod.id });
        setIsDeletePending(false);
        setIsDeleteConfirm(false);
        onModDeleted();
    };

    return (
        <>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs" onClick={() => setIsEditOpen(true)}>
                Edit
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs" onClick={handleToggleVisibility} disabled={isVisibilityPending}>
                {mod.isActive ? "Hide" : "Show"}
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs" onClick={() => setIsDeleteConfirm(true)}>
                Delete
            </button>
            {isEditOpen && (
                <ModEditModal
                    modId={mod.id}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={onModUpdated}
                />
            )}
            {isDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4">Confirm Delete</h3>
                        <p className="text-gray-300 mb-6">Are you sure you want to delete this mod? This action cannot be undone.</p>
                        <div className="flex gap-4 justify-end">
                            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onClick={() => setIsDeleteConfirm(false)} disabled={isDeletePending}>Cancel</button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500" onClick={handleDelete} disabled={isDeletePending}>{isDeletePending ? "Deleting..." : "Delete"}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
