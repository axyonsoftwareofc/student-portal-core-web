// components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Variantes do Button usando class-variance-authority (cva).
 * Permite criar botões consistentes com diferentes estilos.
 */
const buttonVariants = cva(
    // Classes base aplicadas a todos os botões
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            // Variantes de estilo
            variant: {
                default:
                    "bg-sky-600 text-white shadow-sm hover:bg-sky-500 active:bg-sky-700",
                destructive:
                    "bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700",
                success:
                    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700",
                warning:
                    "bg-amber-500 text-gray-900 shadow-sm hover:bg-amber-400 active:bg-amber-600",
                outline:
                    "border border-gray-700 bg-transparent text-gray-200 shadow-sm hover:bg-gray-800 hover:text-white",
                secondary:
                    "bg-gray-800 text-gray-200 shadow-sm hover:bg-gray-700 active:bg-gray-800",
                ghost:
                    "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200",
                link:
                    "text-sky-400 underline-offset-4 hover:underline hover:text-sky-300",
            },
            // Variantes de tamanho
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-12 rounded-lg px-6 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    /**
     * Se true, o componente filho será renderizado como o elemento raiz.
     * Útil para compor com outros componentes (ex: Link do Next.js).
     */
    asChild?: boolean;
}

/**
 * Componente Button reutilizável com múltiplas variantes.
 *
 * @example
 * // Botão padrão
 * <Button>Salvar</Button>
 *
 * // Botão de perigo
 * <Button variant="destructive">Excluir</Button>
 *
 * // Botão pequeno
 * <Button size="sm">Pequeno</Button>
 *
 * // Botão como Link
 * <Button asChild>
 *   <Link href="/dashboard">Ir para Dashboard</Link>
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };