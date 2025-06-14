import React from "react";

export default function UserTableRowsLoading() {
    return (
        <tr>
            <td colSpan={6} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mb-3"></div>
                    <div className="text-orange-300 text-sm font-medium">
                        Loading users...
                    </div>
                </div>
            </td>
        </tr>
    );
}
