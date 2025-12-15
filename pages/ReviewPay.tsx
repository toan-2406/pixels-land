import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StepIndicator from '../components/StepIndicator';

export default function ReviewPay() {
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState<any>(null);

    useEffect(() => {
        // Load data from previous step
        const savedData = localStorage.getItem('pixelOrder');
        if (savedData) {
            setOrderData(JSON.parse(savedData));
        } else {
            // Fallback for direct navigation
            setOrderData({
                selection: { x: 0, y: 0, w: 50, h: 50 },
                area: 2500,
                duration: 3,
                totalCost: 250,
                pricePerPx: 0.10
            });
        }
    }, []);

    if (!orderData) return null;

    const ethPrice = orderData.totalCost / 2800; // Mock ETH conversion
    const serviceFee = orderData.totalCost * 0.025;
    const finalTotal = orderData.totalCost + serviceFee;
    const finalEth = finalTotal / 2800;

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-text-inverse font-display min-h-screen flex flex-col selection:bg-primary selection:text-black">
            <Header hideBuyButton minimal />

            <main className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-40 flex flex-1 justify-center py-8">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 gap-10">
                        <StepIndicator currentStep={3} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 flex flex-col gap-8">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-3xl font-black leading-tight tracking-[-0.033em]">Review & Pay</h1>
                                    <p className="text-text-subtle text-sm font-normal">Please review your order details and complete payment.</p>
                                </div>
                                
                                <div className="rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-gray-50 dark:bg-surface-light">
                                        <h3 className="text-lg font-bold">Order Summary</h3>
                                        <button onClick={() => navigate('/buy/step2')} className="text-primary hover:text-primary-dark transition-colors text-sm font-medium">Edit Order</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-100 dark:bg-surface-lighter border-b border-border-light dark:border-border-dark">
                                                <tr>
                                                    <th className="px-6 py-3 text-text-subtle text-xs font-bold uppercase tracking-wider">Item Description</th>
                                                    <th className="px-6 py-3 text-text-subtle text-xs font-bold uppercase tracking-wider">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-semibold">Brand Name</td>
                                                    <td className="px-6 py-4 text-text-subtle dark:text-text-muted text-sm">New Brand Inc.</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-semibold">Pixel Block</td>
                                                    <td className="px-6 py-4 text-text-subtle dark:text-text-muted text-sm">
                                                        {orderData.area.toLocaleString()} px 
                                                        <span className="ml-2 text-xs opacity-70">({orderData.selection.w}x{orderData.selection.h})</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-semibold">Location</td>
                                                    <td className="px-6 py-4 text-text-subtle dark:text-text-muted text-sm font-mono">
                                                        X:{orderData.selection.x}, Y:{orderData.selection.y}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 text-sm font-semibold">Lease Duration</td>
                                                    <td className="px-6 py-4 text-text-subtle dark:text-text-muted text-sm">{orderData.duration} Years</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <h3 className="text-xl font-bold">Choose Payment Method</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <button className="group relative flex flex-col items-center gap-3 p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/50 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-surface-light">
                                            <div className="size-10 rounded-full bg-[#F7931A]/10 flex items-center justify-center text-[#F7931A]">
                                                <span className="material-symbols-outlined text-2xl icon-filled">currency_bitcoin</span>
                                            </div>
                                            <span className="font-medium text-sm group-hover:text-primary transition-colors">Bitcoin</span>
                                        </button>
                                        <button className="group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/5 transition-all cursor-pointer shadow-lg shadow-primary/10">
                                            <div className="absolute top-2 right-2 text-primary">
                                                <span className="material-symbols-outlined text-lg icon-filled">check_circle</span>
                                            </div>
                                            <div className="size-10 rounded-full bg-[#627EEA]/10 flex items-center justify-center text-[#627EEA]">
                                                <span className="material-symbols-outlined text-2xl icon-filled">diamond</span>
                                            </div>
                                            <span className="text-text-main dark:text-text-inverse font-bold text-sm">Ethereum</span>
                                        </button>
                                        <button className="group relative flex flex-col items-center gap-3 p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/50 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-surface-light">
                                            <div className="size-10 rounded-full bg-[#26A17B]/10 flex items-center justify-center text-[#26A17B]">
                                                <span className="material-symbols-outlined text-2xl">attach_money</span>
                                            </div>
                                            <span className="font-medium text-sm group-hover:text-primary transition-colors">USDT</span>
                                        </button>
                                        <button className="group relative flex flex-col items-center gap-3 p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/50 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-surface-light">
                                            <div className="size-10 rounded-full bg-[#F3BA2F]/10 flex items-center justify-center text-[#F3BA2F]">
                                                <span className="material-symbols-outlined text-2xl">hexagon</span>
                                            </div>
                                            <span className="font-medium text-sm group-hover:text-primary transition-colors">BNB</span>
                                        </button>
                                    </div>
                                    
                                    <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col md:flex-row gap-6 items-center">
                                        <div className="bg-white p-2 rounded-lg shrink-0 shadow-lg">
                                            <div className="size-32 bg-gray-200" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100%25\\' height=\\'100%25\\' viewBox=\\'0 0 800 800\\'%3E%3Cdefs%3E%3Cpattern id=\\'qr-pattern\\' patternUnits=\\'userSpaceOnUse\\' width=\\'80\\' height=\\'80\\'%3E%3Crect width=\\'40\\' height=\\'40\\' fill=\\'%23000000\\'/%3E%3Crect x=\\'40\\' y=\\'40\\' width=\\'40\\' height=\\'40\\' fill=\\'%23000000\\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\\'800\\' height=\\'800\\' fill=\\'%23ffffff\\'/%3E%3Crect width=\\'800\\' height=\\'800\\' fill=\\'url(%23qr-pattern)\\'/%3E%3C/svg%3E')", backgroundSize: "cover"}}></div>
                                        </div>
                                        <div className="flex flex-col gap-3 flex-1 w-full">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold mb-1">Send Payment</p>
                                                    <p className="text-text-subtle text-sm">Send the exact amount to the address below.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full mt-1">
                                                <div className="relative flex-1">
                                                    <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg py-3 px-4 text-text-subtle dark:text-text-muted font-mono text-sm focus:outline-none focus:border-primary transition-colors" readOnly value="0x71C7656EC7ab88b098defB751B7401B5f6d899A2" type="text"/>
                                                </div>
                                                <button className="bg-gray-100 dark:bg-surface-light hover:bg-gray-200 dark:hover:bg-surface-lighter border border-border-light dark:border-border-dark rounded-lg px-4 flex items-center gap-2 transition-colors">
                                                    <span className="material-symbols-outlined text-lg">content_copy</span>
                                                    <span className="hidden sm:inline text-sm font-medium">Copy</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-primary mt-1 font-medium">
                                                <span className="material-symbols-outlined text-sm icon-filled">info</span>
                                                <span>Ensure you are on the Ethereum Mainnet (ERC-20)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Summary */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-28 flex flex-col gap-6">
                                    <div className="rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark p-6 flex flex-col gap-6 shadow-lg">
                                        <h3 className="text-lg font-bold border-b border-border-light dark:border-border-dark pb-4">Cost Breakdown</h3>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-text-subtle text-sm">Subtotal ({orderData.area.toLocaleString()}px)</span>
                                                <span className="font-medium text-text-subtle">{ethPrice.toFixed(4)} ETH</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-text-subtle text-sm">Service Fee (2.5%)</span>
                                                <span className="font-medium text-text-subtle">{(ethPrice * 0.025).toFixed(4)} ETH</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-dashed border-border-light dark:border-border-dark pt-4">
                                            <div className="flex justify-between items-end">
                                                <span className="text-text-subtle dark:text-text-muted font-medium">Total Cost</span>
                                                <div className="text-right">
                                                    <span className="block text-primary text-3xl font-black tracking-tight">{finalEth.toFixed(4)} ETH</span>
                                                    <span className="text-text-subtle text-xs">~${finalTotal.toLocaleString()} USD</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button onClick={() => navigate('/buy/complete')} className="w-full flex cursor-pointer items-center justify-center rounded-lg h-14 px-4 bg-primary text-black text-base font-bold leading-normal tracking-[0.015em] hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl">
                                            Confirm Payment
                                        </button>
                                        <button onClick={() => navigate('/buy/step2')} className="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-transparent border border-border-light dark:border-border-dark text-text-subtle dark:text-text-muted hover:text-text-main dark:hover:text-text-inverse hover:border-text-main dark:hover:border-text-inverse text-sm font-semibold transition-colors">
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}