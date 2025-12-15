import React from 'react';

interface StepIndicatorProps {
    currentStep: 1 | 2 | 3 | 4;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto px-4">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-lighter -z-10 -translate-y-1/2 rounded"></div>
                
                {/* Active Progress Line */}
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
                
                {/* Step 1 */}
                <div className="flex flex-col items-center gap-2 bg-background-dark p-2">
                    <div className={`size-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 1 ? 'bg-primary text-black shadow-[0_0_15px_rgba(248,191,22,0.4)]' : 'bg-surface-lighter text-text-muted'}`}>
                        {currentStep > 1 ? (
                            <span className="material-symbols-outlined text-xl">check</span>
                        ) : (
                            <span className="material-symbols-outlined text-xl">business</span>
                        )}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= 1 ? 'text-primary' : 'text-text-muted'}`}>Info</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center gap-2 bg-background-dark p-2">
                    <div className={`size-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 2 ? 'bg-primary text-black shadow-[0_0_15px_rgba(248,191,22,0.4)]' : 'bg-surface-lighter text-text-muted border-2 border-surface-lighter'}`}>
                         {currentStep > 2 ? (
                            <span className="material-symbols-outlined text-xl">check</span>
                        ) : (
                            <span className="material-symbols-outlined text-xl">grid_view</span>
                        )}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= 2 ? 'text-primary' : 'text-text-muted'}`}>Space</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center gap-2 bg-background-dark p-2">
                    <div className={`size-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 3 ? 'bg-primary text-black shadow-[0_0_15px_rgba(248,191,22,0.4)]' : 'bg-surface-lighter text-text-muted border-2 border-surface-lighter'}`}>
                        {currentStep > 3 ? (
                             <span className="material-symbols-outlined text-xl">check</span>
                        ) : (
                            <span className="material-symbols-outlined text-xl">credit_card</span>
                        )}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= 3 ? 'text-primary' : 'text-text-muted'}`}>Pay</span>
                </div>
                 {/* Step 4 */}
                 <div className="flex flex-col items-center gap-2 bg-background-dark p-2">
                    <div className={`size-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= 4 ? 'bg-primary text-black shadow-[0_0_15px_rgba(248,191,22,0.4)]' : 'bg-surface-lighter text-text-muted border-2 border-surface-lighter'}`}>
                         <span className="material-symbols-outlined text-xl">done_all</span>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= 4 ? 'text-primary' : 'text-text-muted'}`}>Done</span>
                </div>
            </div>
        </div>
    );
};

export default StepIndicator;