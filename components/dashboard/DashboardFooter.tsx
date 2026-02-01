// components/dashboard/DashboardFooter.tsx

export default function DashboardFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-700/50 bg-gray-950/50 py-6 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-400 sm:flex-row">
                    <p>
                        © {currentYear} Portal do Aluno • Desenvolvido pela{" "}
                        <span className="font-semibold text-violet-400">Axyon Software House</span> ❤️
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="transition-colors hover:text-gray-200">
                            Suporte
                        </a>
                        <a href="#" className="transition-colors hover:text-gray-200">
                            Privacidade
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}