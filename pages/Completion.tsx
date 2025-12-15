import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StepIndicator from '../components/StepIndicator';

export default function Completion() {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-text-inverse transition-colors duration-200 min-h-screen flex flex-col">
            <Header hideBuyButton minimal />

            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-40 flex flex-1 justify-center py-12">
                    <div className="layout-content-container flex flex-col max-w-[800px] flex-1 w-full gap-10">
                        <StepIndicator currentStep={4} />

                        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-8 md:p-14 flex flex-col items-center shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/5 blur-3xl pointer-events-none"></div>
                            <div className="mb-8 relative z-10">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                                <div className="relative rounded-full bg-primary/10 p-5 ring-1 ring-primary/30">
                                    <span className="material-symbols-outlined text-primary !text-7xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-4 mb-12 text-center z-10">
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">Payment Successful!</h1>
                                <p className="text-text-subtle dark:text-text-muted text-lg font-normal leading-relaxed max-w-[540px]">
                                    Congratulations! You've successfully secured your spot. You now own a piece of digital history.
                                </p>
                            </div>

                            <div className="w-full bg-gray-50 dark:bg-background-dark/40 rounded-lg border border-border-light dark:border-border-dark overflow-hidden mb-10 z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-light dark:divide-border-dark">
                                    <div className="p-6 flex flex-col gap-2 items-center md:items-start hover:bg-gray-100 dark:hover:bg-surface-dark/50 transition-colors group">
                                        <p className="text-text-subtle dark:text-text-muted text-xs uppercase font-bold tracking-wider">Transaction ID</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-base font-mono font-medium tracking-wide">#8392-AK29-PL99</p>
                                            <button className="text-text-subtle hover:text-primary transition-colors p-1" title="Copy ID">
                                                <span className="material-symbols-outlined !text-lg">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col gap-2 items-center md:items-start hover:bg-gray-100 dark:hover:bg-surface-dark/50 transition-colors">
                                        <p className="text-text-subtle dark:text-text-muted text-xs uppercase font-bold tracking-wider">Verification Status</p>
                                        <div className="flex items-center gap-3">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                                            </span>
                                            <p className="font-medium">Pending (approx. 24hrs)</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-border-light dark:border-border-dark bg-primary/10 p-5 flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-primary !text-xl mt-0.5">info</span>
                                    <p className="text-text-subtle dark:text-text-muted text-sm leading-relaxed">
                                        Your logo is currently under verification to ensure it meets our community guidelines. Once approved, it will appear on the global canvas within 24 hours.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-5 w-full justify-center z-10">
                                <button onClick={() => navigate('/')} className="flex-1 sm:flex-none sm:w-56 cursor-pointer items-center justify-center rounded-lg h-14 px-8 border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all text-sm font-bold leading-normal tracking-wide uppercase">
                                    View Canvas
                                </button>
                                <button onClick={() => navigate('/buy/step1')} className="flex-1 sm:flex-none sm:w-64 cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-primary hover:bg-yellow-400 text-black transition-all text-sm font-bold leading-normal tracking-wide uppercase shadow-lg hover:shadow-xl">
                                    Buy More Pixels
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-3 text-center py-4">
                            <p className="text-text-subtle dark:text-text-muted text-sm font-medium">Have questions or issues?</p>
                            <div className="flex items-center gap-6 text-sm">
                                <a className="text-text-main dark:text-text-inverse hover:text-primary transition-colors flex items-center gap-2 font-medium" href="#">
                                    <span className="material-symbols-outlined !text-lg text-primary">mail</span> support@pixelboard.com
                                </a>
                                <span className="text-border-light dark:text-border-dark">|</span>
                                <a className="text-text-main dark:text-text-inverse hover:text-primary transition-colors flex items-center gap-2 font-medium" href="#">
                                    <span className="material-symbols-outlined !text-lg text-primary">forum</span> Join Discord
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}