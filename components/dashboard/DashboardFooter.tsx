// components/dashboard/DashboardFooter.tsx

export default function DashboardFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-800/50 bg-gray-950 py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
                    <p>
                        © {currentYear} Code Plus • Desenvolvido por{" "}
                        <span className="font-medium text-gray-400">Axyon Software</span>
                    </p>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="inline-flex min-h-11 items-center transition-colors hover:text-gray-300 sm:min-h-0"
                        >
                            Suporte
                        </a>
                        <a
                            href="#"
                            className="inline-flex min-h-11 items-center transition-colors hover:text-gray-300 sm:min-h-0"
                        >
                            Privacidade
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}