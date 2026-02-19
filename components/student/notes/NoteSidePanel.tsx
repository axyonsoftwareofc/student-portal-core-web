// components/student/notes/NoteSidePanel.tsx
'use client';

import { X, StickyNote } from 'lucide-react';
import { NoteEditor } from './NoteEditor';
import { cn } from '@/lib/utils';

interface NoteSidePanelProps {
    isOpen: boolean;
    lessonTitle: string;
    noteContent: string;
    isSaving: boolean;
    isLoading: boolean;
    lastSavedAt: string | null;
    onContentChange: (content: string) => void;
    onDelete: () => void;
    onClose: () => void;
}

export function NoteSidePanel({
                                  isOpen,
                                  lessonTitle,
                                  noteContent,
                                  isSaving,
                                  isLoading,
                                  lastSavedAt,
                                  onContentChange,
                                  onDelete,
                                  onClose,
                              }: NoteSidePanelProps) {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div
                className={cn(
                    'fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-900 border-l border-gray-800/50 z-50',
                    'flex flex-col transition-transform duration-300 ease-in-out',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <StickyNote className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white">Anotações</h3>
                            <p className="text-xs text-gray-500 truncate">{lessonTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="h-6 w-6 border-2 border-gray-700 border-t-sky-400 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <NoteEditor
                            initialContent={noteContent}
                            isSaving={isSaving}
                            lastSavedAt={lastSavedAt}
                            onContentChange={onContentChange}
                            onDelete={onDelete}
                            placeholder="Escreva suas anotações sobre esta aula..."
                        />
                    )}
                </div>
            </div>
        </>
    );
}