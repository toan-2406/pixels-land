import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
    hideBuyButton?: boolean;
    minimal?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hideBuyButton = false, minimal = false }) => {
    const navigate = useNavigate();

    return (
        <header className="flex-none flex items-center justify-between border-b border-border-dark bg-white dark:bg-surface-dark px-6 py-4 z-50 shadow-md sticky top-0">
            <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="size-8 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl transition-transform group-hover:scale-110">grid_view</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">PixelCanvas</h2>
                </Link>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors">
                    {minimal ? 'Home' : 'Canvas View'}
                </Link>
                <a href="#" className="text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors">Explore</a>
                {!minimal && (
                     <a href="#" className="text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors">FAQ</a>
                )}
            </nav>

            <div className="flex items-center gap-4">
                {!hideBuyButton && (
                    <button onClick={() => navigate('/buy/step1')} className="hidden sm:flex bg-primary hover:bg-yellow-400 text-black font-bold text-sm px-5 py-2.5 rounded-lg transition-colors items-center gap-2 shadow-lg shadow-primary/10">
                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                        Buy Pixels
                    </button>
                )}
                <button className="md:hidden text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>
        </header>
    );
};

export default Header;