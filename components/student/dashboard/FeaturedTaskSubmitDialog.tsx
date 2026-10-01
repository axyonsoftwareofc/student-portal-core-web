'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import type { StudentFeaturedItem } from '@/lib/types/featured-items';

interface FeaturedTaskSubmitDialogProps {
    item: StudentFeaturedItem | null;
    onClose: () => void;
    onSubmit: (
        itemId: string,
        data: { content: string; link_url: string }
    ) => Promise<{ success: boolean; error?: string }>;
}

const inputClass = cn(
    'w-full px-4 py-3 rounded-lg',
    'bg-gray-800 border border-gray-700',
    'text-white placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
);

export function FeaturedTaskSubmitDialog({ item, onClose, onSubmit }: FeaturedTaskSubmitDialogProps) {
    return (
        <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                {item && <SubmitForm key={item.id} item={item} onClose={onClose} onSubmit={onSubmit} />}
            </DialogContent>
        </Dialog>
    );
}

interface SubmitFormProps {
    item: StudentFeaturedItem;
    onClose: () => void;
    onSubmit: FeaturedTaskSubmitDialogProps['onSubmit'];
}

function SubmitForm({ item, onClose, onSubmit }: SubmitFormProps) {
    const [content, setContent] = useState<string>('');
    const [linkUrl, setLinkUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() && !linkUrl.trim()) {
            showToast('error', 'Escreva uma resposta ou informe um link');
            return;
        }

        if (linkUrl.trim() && !/^https?:\/\//i.test(linkUrl.trim())) {
            showToast('error', 'O link deve começar com http:// ou https://');
            return;
        }

        setIsSubmitting(true);
        const result = await onSubmit(item.id, { content, link_url: linkUrl });
        setIsSubmitting(false);

        if (result.success) {
            showToast('success', 'Tarefa enviada!');
            onClose();
        } else {
            showToast('error', result.error || 'Erro ao enviar a tarefa');
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>{item.title}</DialogTitle>
            </DialogHeader>

            {item.description && (
                <p className="text-sm text-gray-400 whitespace-pre-line">{item.description}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sua resposta</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escreva aqui..."
                        rows={4}
                        className={cn(inputClass, 'resize-none')}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Link (opcional)</label>
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className={inputClass}
                    />
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-500">
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Enviando...' : 'Enviar tarefa'}
                    </Button>
                </div>
            </form>
        </>
    );
}
