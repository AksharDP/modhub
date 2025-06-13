"use client";

import React from "react";
import { produce } from "immer";

export interface FormField {
    id: string;
    type: "text" | "textarea" | "select" | "checkbox" | "file" | "static-text";
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    content?: string;
    color?: string;
    order: number;
}

interface FormBuilderProps {
    schema: FormField[];
    onChange: (newSchema: FormField[]) => void;
}

const FieldEditor: React.FC<{
    field: FormField;
    onChange: (updatedField: FormField) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
}> = ({
    field,
    onChange,
    onRemove,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
}) => {
    return (
        <div className="bg-gray-700 p-4 rounded-md space-y-3 border-l-4 border-orange-500">
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase text-orange-400">
                    {field.type}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={!canMoveUp}
                        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs p-1 cursor-pointer"
                        title="Move up"
                    >
                        ↑
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={!canMoveDown}
                        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs p-1 cursor-pointer"
                        title="Move down"
                    >
                        ↓
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-900/20 rounded cursor-pointer"
                    >
                        Remove
                    </button>
                </div>
            </div>

            {field.type !== "static-text" ? (
                <>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">
                            Label / Title
                        </label>
                        <input
                            type="text"
                            value={field.label}
                            onChange={(e) =>
                                onChange({ ...field, label: e.target.value })
                            }
                            className="w-full bg-gray-800 text-sm p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                            placeholder="Field label"
                        />
                    </div>

                    {(field.type === "text" || field.type === "textarea") && (
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">
                                Placeholder
                            </label>
                            <input
                                type="text"
                                value={field.placeholder || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...field,
                                        placeholder: e.target.value,
                                    })
                                }
                                className="w-full bg-gray-800 text-sm p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                                placeholder="Field placeholder"
                            />
                        </div>
                    )}

                    {field.type === "select" && (
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">
                                Options (one per line)
                            </label>
                            <textarea
                                value={field.options?.join("\n") || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...field,
                                        options: e.target.value
                                            .split("\n")
                                            .filter((opt) => opt.trim()),
                                    })
                                }
                                className="w-full bg-gray-800 text-sm p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none h-20"
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                        </div>
                    )}

                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                                onChange({
                                    ...field,
                                    required: e.target.checked,
                                })
                            }
                            className="rounded text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                        />
                        <span className="text-gray-300">Required field</span>
                    </label>
                </>
            ) : (
                <>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">
                            Text Content
                        </label>
                        <textarea
                            value={field.content || field.label}
                            onChange={(e) =>
                                onChange({
                                    ...field,
                                    content: e.target.value,
                                    label: e.target.value,
                                })
                            }
                            className="w-full bg-gray-800 text-sm p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none h-20"
                            placeholder="Enter text content (supports basic HTML)"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-xs text-gray-400">
                            Text Color
                        </label>
                        <input
                            type="color"
                            value={field.color || "#FFFFFF"}
                            onChange={(e) =>
                                onChange({ ...field, color: e.target.value })
                            }
                            className="bg-gray-800 w-10 h-8 rounded border border-gray-600 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400">
                            {field.color || "#FFFFFF"}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default function FormBuilder({ schema, onChange }: FormBuilderProps) {
    const [previewValues, setPreviewValues] = React.useState<
        Record<string, string | boolean | File | null>
    >({});

    const updatePreviewValue = (
        fieldId: string,
        value: string | boolean | File | null
    ) => {
        setPreviewValues((prev) => ({ ...prev, [fieldId]: value }));
    };
    const handlePreviewSubmit = () => {
        console.log("Preview form submitted with values:", previewValues);
        alert(
            "This is just a preview! Form submission is not connected to anything."
        );
    };

    const addField = (type: FormField["type"]) => {
        const newField: FormField = {
            id: crypto.randomUUID(),
            type,
            label:
                type === "static-text"
                    ? "Enter your text here"
                    : `New ${type} field`,
            required: type === "static-text" ? false : false,
            order: schema.length,
        };

        if (type === "text" || type === "textarea") {
            newField.placeholder = `Enter ${
                type === "text" ? "text" : "description"
            }...`;
        }

        if (type === "select") {
            newField.options = ["Option 1", "Option 2", "Option 3"];
        }

        if (type === "static-text") {
            newField.color = "#FFFFFF";
            newField.content = "Enter your text here";
        }

        onChange([...schema, newField]);
    };

    const updateField = (index: number, updatedField: FormField) => {
        onChange(
            produce(schema, (draft) => {
                draft[index] = updatedField;
            })
        );
    };

    const removeField = (index: number) => {
        onChange(
            produce(schema, (draft) => {
                draft.splice(index, 1);
            })
        );
    };

    const moveField = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= schema.length) return;

        onChange(
            produce(schema, (draft) => {
                const [removed] = draft.splice(index, 1);
                draft.splice(newIndex, 0, removed);
            })
        );
    };

    return (
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg space-y-6">
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => addField("text")}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
                >
                    + Text Input
                </button>
                <button
                    type="button"
                    onClick={() => addField("textarea")}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
                >
                    + Text Area
                </button>
                <button
                    type="button"
                    onClick={() => addField("select")}
                    className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors cursor-pointer"
                >
                    + Dropdown
                </button>
                <button
                    type="button"
                    onClick={() => addField("checkbox")}
                    className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors cursor-pointer"
                >
                    + Checkbox
                </button>
                <button
                    type="button"
                    onClick={() => addField("file")}
                    className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors cursor-pointer"
                >
                    + File Upload
                </button>
                <button
                    type="button"
                    onClick={() => addField("static-text")}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors cursor-pointer"
                >
                    + Static Text
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-white text-lg border-b border-gray-700 pb-2">
                        Form Fields Configuration
                    </h4>
                    <div className="space-y-3">
                        {schema.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p className="mb-2">No fields added yet.</p>
                                <p className="text-sm">
                                    Click the buttons above to start building
                                    your form.
                                </p>
                            </div>
                        )}
                        {schema.map((field, index) => (
                            <FieldEditor
                                key={field.id}
                                field={field}
                                onChange={(updated) =>
                                    updateField(index, updated)
                                }
                                onRemove={() => removeField(index)}
                                onMoveUp={() => moveField(index, "up")}
                                onMoveDown={() => moveField(index, "down")}
                                canMoveUp={index > 0}
                                canMoveDown={index < schema.length - 1}
                            />
                        ))}
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h4 className="font-semibold mb-4 text-white text-lg border-b border-gray-700 pb-2">
                        Live Preview - Upload Form
                    </h4>
                    <div className="space-y-4">
                        {schema.map((field) => (
                            <div key={field.id} className="space-y-2">
                                {field.type === "text" && (
                                    <>
                                        <label className="text-sm font-medium text-gray-300 block">
                                            {field.label}{" "}
                                            {field.required && (
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={field.placeholder}
                                            value={
                                                (previewValues[
                                                    field.id
                                                ] as string) || ""
                                            }
                                            onChange={(e) =>
                                                updatePreviewValue(
                                                    field.id,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:border-orange-500 focus:outline-none"
                                            required={field.required}
                                        />
                                    </>
                                )}
                                {field.type === "textarea" && (
                                    <>
                                        <label className="text-sm font-medium text-gray-300 block">
                                            {field.label}{" "}
                                            {field.required && (
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                        <textarea
                                            placeholder={field.placeholder}
                                            value={
                                                (previewValues[
                                                    field.id
                                                ] as string) || ""
                                            }
                                            onChange={(e) =>
                                                updatePreviewValue(
                                                    field.id,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 h-24 text-white resize-none focus:border-orange-500 focus:outline-none"
                                            required={field.required}
                                        />
                                    </>
                                )}
                                {field.type === "select" && (
                                    <>
                                        <label className="text-sm font-medium text-gray-300 block">
                                            {field.label}{" "}
                                            {field.required && (
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                        <select
                                            value={
                                                (previewValues[
                                                    field.id
                                                ] as string) || ""
                                            }
                                            onChange={(e) =>
                                                updatePreviewValue(
                                                    field.id,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:border-orange-500 focus:outline-none"
                                            required={field.required}
                                        >
                                            <option value="">
                                                Select an option...
                                            </option>
                                            {field.options?.map(
                                                (option, idx) => (
                                                    <option
                                                        key={idx}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </>
                                )}
                                {field.type === "checkbox" && (
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={
                                                (previewValues[
                                                    field.id
                                                ] as boolean) || false
                                            }
                                            onChange={(e) =>
                                                updatePreviewValue(
                                                    field.id,
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-gray-300">
                                            {field.label}{" "}
                                            {field.required && (
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                )}
                                {field.type === "file" && (
                                    <>
                                        <label className="text-sm font-medium text-gray-300 block">
                                            {field.label}{" "}
                                            {field.required && (
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) =>
                                                updatePreviewValue(
                                                    field.id,
                                                    e.target.files?.[0] || null
                                                )
                                            }
                                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 file:cursor-pointer"
                                            required={field.required}
                                        />
                                    </>
                                )}
                                {field.type === "static-text" && (
                                    <div
                                        className="py-2"
                                        style={{
                                            color: field.color || "#FFFFFF",
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                field.content || field.label,
                                        }}
                                    />
                                )}
                            </div>
                        ))}

                        {schema.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>Add fields to see a preview</p>
                            </div>
                        )}
                        {schema.length > 0 && (
                            <div className="pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handlePreviewSubmit}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    Upload Mod
                                </button>
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    This is a preview - the upload button is not
                                    connected to anything
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
