// components/dashboard/MobileMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, GraduationCap, LucideIcon } from 'lucide-react';

interface MenuItem {
    href: string;
    label: string;
    icon: LucideIcon;
}

interface MobileMenuProps {
    items: MenuItem[];
    title: string;
}

export default function MobileMenu({ items, title }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-500 transition-colors"
                aria-label="Abrir menu"
            >
                <Menu className="h-6 w-6" strokeWidth={1.5} />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gray-950 border-r border-gray-800/50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600">
                            <GraduationCap className="h-4 w-4 text-white" strokeWidth={2} />
                        </div>
                        <span className="font-semibold text-white">{title}</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
                        aria-label="Fechar menu"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`group flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
                                    isActive
                                        ? 'bg-sky-500/10 text-sky-300'
                                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                }`}
                            >
                                <Icon
                                    className={`h-5 w-5 ${
                                        isActive ? 'text-sky-400' : 'text-gray-500 group-hover:text-gray-300'
                                    }`}
                                    strokeWidth={1.5}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}