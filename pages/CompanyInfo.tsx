import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StepIndicator from '../components/StepIndicator';

export default function CompanyInfo() {
    const navigate = useNavigate();
    
    // State to hold form values
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        brandName: '',
        website: '',
        description: ''
    });

    // Auto-fill with random "Real Life" mock data on mount
    useEffect(() => {
        const randomId = Math.floor(Math.random() * 1000);
        const companies = ["Nebula Innovations", "Quantum Dynamics", "Vertex Solutions", "Apex Digital", "Horizon Labs"];
        const randCompany = companies[Math.floor(Math.random() * companies.length)];
        const cleanName = randCompany.replace(/\s+/g, '').toLowerCase();

        setFormData({
            companyName: `${randCompany} Ltd.`,
            email: `contact@${cleanName}${randomId}.com`,
            brandName: randCompany,
            website: `https://www.${cleanName}.io`,
            description: `We are pioneering the future of ${cleanName} technology with sustainable and scalable solutions for the modern web.`
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col">
            <Header hideBuyButton minimal />

            <main className="flex-grow flex flex-col items-center py-10 px-4 sm:px-8 lg:px-40">
                <div className="w-full max-w-[1100px] flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Purchase Pixels</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-base font-normal">Secure your spot on the digital canvas in just a few steps.</p>
                    </div>

                    <StepIndicator currentStep={1} />

                    {/* Form */}
                    <form className="w-full bg-white dark:bg-surface-dark rounded-xl p-6 md:p-10 shadow-xl border border-gray-200 dark:border-border-dark">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Column */}
                            <div className="flex flex-col gap-6">
                                <div className="border-b border-gray-100 dark:border-border-dark pb-4 mb-2">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">domain</span>
                                        Company Information
                                    </h2>
                                </div>
                                <label className="flex flex-col gap-2">
                                    <span className="text-slate-600 dark:text-gray-300 text-sm font-medium">Company Name <span className="text-primary">*</span></span>
                                    <input 
                                        name="companyName" 
                                        value={formData.companyName} 
                                        onChange={handleChange}
                                        className="form-input w-full bg-gray-50 dark:bg-surface-light border border-gray-200 dark:border-border-dark rounded-lg h-12 px-4 text-slate-900 dark:text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                                        placeholder="e.g. Acme Corp Inc." 
                                        type="text"
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-slate-600 dark:text-gray-300 text-sm font-medium">Contact Email <span className="text-primary">*</span></span>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                                        <input 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="form-input w-full bg-gray-50 dark:bg-surface-light border border-gray-200 dark:border-border-dark rounded-lg h-12 pl-11 pr-4 text-slate-900 dark:text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                                            placeholder="billing@acmecorp.com" 
                                            type="email"
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-6">
                                <div className="border-b border-gray-100 dark:border-border-dark pb-4 mb-2">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">storefront</span>
                                        Brand Information
                                    </h2>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="flex-shrink-0">
                                        <label className="block text-slate-600 dark:text-gray-300 text-sm font-medium mb-2">Logo</label>
                                        <div className="relative group cursor-pointer">
                                            <div className="size-24 rounded-full bg-gray-50 dark:bg-surface-light border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center group-hover:border-primary transition-colors overflow-hidden">
                                                <span className="material-symbols-outlined text-gray-400 text-3xl group-hover:text-primary transition-colors">cloud_upload</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-6">
                                        <label className="flex flex-col gap-2">
                                            <span className="text-slate-600 dark:text-gray-300 text-sm font-medium">Brand Name <span className="text-primary">*</span></span>
                                            <input 
                                                name="brandName"
                                                value={formData.brandName}
                                                onChange={handleChange}
                                                className="form-input w-full bg-gray-50 dark:bg-surface-light border border-gray-200 dark:border-border-dark rounded-lg h-12 px-4 text-slate-900 dark:text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                                                placeholder="e.g. Acme" 
                                                type="text"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-2">
                                            <span className="text-slate-600 dark:text-gray-300 text-sm font-medium">Website URL <span className="text-primary">*</span></span>
                                            <input 
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="form-input w-full bg-gray-50 dark:bg-surface-light border border-gray-200 dark:border-border-dark rounded-lg h-12 px-4 text-slate-900 dark:text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                                                placeholder="https://acme.com" 
                                                type="url"
                                            />
                                        </label>
                                    </div>
                                </div>
                                <label className="flex flex-col gap-2">
                                    <span className="text-slate-600 dark:text-gray-300 text-sm font-medium">Brand Description</span>
                                    <textarea 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="form-textarea w-full bg-gray-50 dark:bg-surface-light border border-gray-200 dark:border-border-dark rounded-lg p-4 text-slate-900 dark:text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none transition-all" 
                                        placeholder="Tell the world about your brand in a few sentences..." 
                                        rows={4}
                                    ></textarea>
                                </label>
                            </div>
                        </div>
                        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-border-dark flex justify-end gap-4 items-center">
                            <button onClick={() => navigate('/')} className="text-slate-500 dark:text-gray-400 font-medium text-sm hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2" type="button">Cancel</button>
                            <button onClick={() => navigate('/buy/step2')} className="group flex items-center justify-center gap-2 bg-primary hover:bg-yellow-400 text-black font-bold text-sm px-8 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all" type="button">
                                Next Step
                                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}