// components/ui/confirm-dialog.tsx
"use client";

import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmDialogVariant = "danger" | "warning" | "success";

interface ConfirmDialogProps {
    /** Se o dialog está aberto */
    isOpen: boolean;
    /** Callback para fechar o dialog */
    onClose: () => void;
    /** Callback quando confirma a ação */
    onConfirm: () => void;
    /** Título do dialog */
    title: string;
    /** Mensagem de confirmação */
    message: string;
    /** Texto do botão de confirmação */
    confirmText?: string;
    /** Texto do botão de cancelar */
    cancelText?: string;
    /** Se está processando a ação */
    isLoading?: boolean;
    /** Variante visual (afeta cor do botão) */
    variant?: ConfirmDialogVariant;
}

/**
 * Mapeamento de variantes para classes do botão.
 */
const variantClasses: Record<ConfirmDialogVariant, string> = {
    danger: "bg-rose-600 hover:bg-rose-500 focus:ring-rose-500",
    warning: "bg-amber-600 hover:bg-amber-500 focus:ring-amber-500",
    success: "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500",
};

/**
 * Dialog de confirmação para ações destrutivas ou importantes.
 * Usa o padrão AlertDialog do Radix UI para acessibilidade.
 *
 * @example
 * <ConfirmDialog
 *   isOpen={showDelete}
 *   onClose={() => setShowDelete(false)}
 *   onConfirm={handleDelete}
 *   title="Excluir aluno"
 *   message="Tem certeza que deseja excluir este aluno?"
 *   variant="danger"
 * />
 */
export function ConfirmDialog({
                                  isOpen,
                                  onClose,
                                  onConfirm,
                                  title,
                                  message,
                                  confirmText = "Confirmar",
                                  cancelText = "Cancelar",
                                  isLoading = false,
                                  variant = "danger",
                              }: ConfirmDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{message}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className={cn(
                            "text-white",
                            variantClasses[variant],
                            isLoading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Exportação default para compatibilidade com imports existentes
export default ConfirmDialog;