import React from 'react';
import { User, ClipboardList, Building2, Banknote, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ icon: Icon, title, description, role, gradient }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/register?role=${role}`)}
            className="group cursor-pointer relative bg-white p-8 rounded-3xl 
                       border border-slate-200 hover:border-indigo-400
                       hover:shadow-2xl hover:shadow-indigo-500/10
                       transition-all duration-500 overflow-hidden"
        >
            <div className={`h-16 w-16 bg-gradient-to-br ${gradient} 
                            rounded-2xl flex items-center justify-center text-white mb-6 
                            shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                <Icon size={28} />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                {title}
            </h3>

            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {description}
            </p>

            <div className={`flex items-center gap-2 font-bold text-sm transition-all text-slate-400 group-hover:text-indigo-600 group-hover:gap-3`}>
                Get Started <ArrowRight size={16} />
            </div>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 overflow-hidden relative">
            {/* Soft Background Decorative Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6 pb-20">

                {/* Hero Section */}
                <div className="text-center mb-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6">
                        <Zap size={14} /> HL7 FHIR Standard Compliant
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter text-slate-900">
                        Next-Gen Patient <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Data Ecosystem
                        </span>
                    </h1>

                    <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
                        Experience secure, decentralized, and patient-controlled healthcare data
                        exchange powered by modern FHIR standards.
                    </p>
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ServiceCard
                        icon={User}
                        title="Patient Portal"
                        role="patient"
                        description="Complete control over your records. Share only what matters."
                        gradient="from-indigo-500 to-indigo-600"
                    />
                    <ServiceCard
                        icon={ClipboardList}
                        title="Practitioner"
                        role="doctor"
                        description="Insightful dashboards and seamless patient profile access."
                        gradient="from-blue-500 to-blue-600"
                    />
                    <ServiceCard
                        icon={Building2}
                        title="Organisation"
                        role="hospital"
                        description="Enterprise-grade management for hospitals and clinics."
                        gradient="from-slate-700 to-slate-900"
                    />
                    <ServiceCard
                        icon={Banknote}
                        title="Financial Service"
                        role="loan_provider"
                        description="Instant verification for medical loans and insurance."
                        gradient="from-emerald-500 to-emerald-600"
                    />
                </div>

                {/* Footer Style Info */}
                <div className="mt-32 pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-400 text-sm">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-pointer">
                            <Globe size={16} /> Global Connectivity
                        </div>
                        <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-pointer">
                            <ShieldCheck size={16} /> ISO 27001 Certified
                        </div>
                    </div>
                    <p>© 2026 MediFlow System. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
