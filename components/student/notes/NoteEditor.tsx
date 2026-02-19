// components/student/notes/NoteEditor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
    initialContent: string;
    isSaving: boolean;
    lastSavedAt: string | null;
    onContentChange: (content: string) => void;
    onDelete?: () => void;
    placeholder?: string;
}

export function NoteEditor({
                               initialContent,
                               isSaving,
                               lastSavedAt,
                               onContentChange,
                               onDelete,
                               placeholder = 'Escreva suas anotações aqui...',
                           }: NoteEditorProps) {
    const [content, setContent] = useState<string>(initialContent);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [content]);

    const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const newContent = event.target.value;
        setContent(newContent);
        onContentChange(newContent);
    };

    const formatLastSaved = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 10) return 'agora mesmo';
        if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full">
      <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder={placeholder}
          className={cn(
              'flex-1 w-full bg-transparent text-gray-200 text-sm leading-relaxed',
              'placeholder-gray-600 resize-none focus:outline-none',
              'min-h-[200px] p-4'
          )}
      />

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800/50">
                <div className="flex items-center gap-2 text-xs">
                    {isSaving ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 text-sky-400 animate-spin" strokeWidth={1.5} />
                            <span className="text-sky-400">Salvando...</span>
                        </>
                    ) : lastSavedAt ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} />
                            <span className="text-gray-500">Salvo {formatLastSaved(lastSavedAt)}</span>
                        </>
                    ) : (
                        <span className="text-gray-600">Comece a escrever...</span>
                    )}
                </div>

                {onDelete && content.trim() && (
                    <div>
                        {showDeleteConfirmation ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        onDelete();
                                        setShowDeleteConfirmation(false);
                                        setContent('');
                                    }}
                                    className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                                >
                                    Confirmar
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirmation(false)}
                                    className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                                title="Excluir anotação"
                            >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}