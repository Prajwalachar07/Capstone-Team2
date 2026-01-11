import React, { useState } from 'react';
import { ArrowLeft, FileText, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';
import Card from '../ui/Card';

const PatientProfileViewer = ({ patientData, backPath, hideRawView = false, hideClinicalDetails = false }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('doc');

    const tabs = [
        { id: 'doc', label: 'Clinical Document (DOC)', icon: <FileText size={18} /> },
        { id: 'fhir', label: 'FHIR JSON (FHIR)', icon: <Code size={18} /> },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            {/* Header Section with Toggle */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" onClick={() => navigate(backPath)} className="mt-1 p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Full Profile</h1>
                        <p className="text-sm text-slate-500 mt-1">View detailed health records and personal information.</p>
                    </div>
                </div>

                {!hideRawView && (
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">View Mode</span>
                        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200 shadow-inner">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                                        ${activeTab === tab.id
                                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                        }
                                    `}
                                >
                                    {tab.icon}
                                    {tab.label.split(' ')[0]} {/* Show just DOC or RAW */}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Card className="min-h-[600px] flex flex-col">
                <Card.Body className="flex-grow p-8">
                    {activeTab === 'doc' ? (
                        <div className="space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-2">Patient Details</h3>
                                    <dl className="space-y-4">
                                        <div className="flex justify-between items-center py-1">
                                            <dt className="text-sm font-medium text-slate-500">Name</dt>
                                            <dd className="text-sm font-semibold text-slate-900">{patientData.name}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <dt className="text-sm font-medium text-slate-500">Patient ID</dt>
                                            <dd className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">{patientData.patientId}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <dt className="text-sm font-medium text-slate-500">Gender</dt>
                                            <dd className="text-sm text-slate-900 capitalize">{patientData.gender || 'N/A'}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <dt className="text-sm font-medium text-slate-500">DOB</dt>
                                            <dd className="text-sm text-slate-900">{patientData.dob || 'N/A'}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <dt className="text-sm font-medium text-slate-500">Email</dt>
                                            <dd className="text-sm text-slate-900">{patientData.email || 'N/A'}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <dt className="text-sm font-medium text-slate-500">Phone</dt>
                                            <dd className="text-sm text-slate-900">{patientData.phone || 'N/A'}</dd>
                                        </div>
                                        {!hideClinicalDetails && (
                                            <>
                                                <div className="flex justify-between items-center py-1 border-t border-slate-50 mt-4 pt-4">
                                                    <dt className="text-sm font-medium text-indigo-600">Blood Group</dt>
                                                    <dd className="text-sm font-bold text-slate-900">{patientData.bloodGroup || 'N/A'}</dd>
                                                </div>
                                                <div className="flex justify-between items-start py-1">
                                                    <dt className="text-sm font-medium text-red-600">Allergies</dt>
                                                    <dd className="text-sm font-semibold text-slate-900 text-right max-w-[150px]">{patientData.allergies || 'None'}</dd>
                                                </div>
                                            </>
                                        )}
                                    </dl>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-4 border-b border-teal-50 pb-2">Address Information</h3>
                                    <dl className="space-y-4 mb-8">
                                        <div className="flex justify-between items-start py-1">
                                            <dt className="text-sm font-medium text-slate-500">Address</dt>
                                            <dd className="text-sm text-slate-900 text-right max-w-[200px]">{patientData.address || 'N/A'}</dd>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <dt className="text-sm font-medium text-slate-500">City</dt>
                                            <dd className="text-sm text-slate-900">{patientData.city || 'N/A'}</dd>
                                        </div>
                                    </dl>

                                    {patientData.organisation && (
                                        <>
                                            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-2">Visit & Sharing Details</h3>
                                            <dl className="space-y-4">
                                                <div className="flex justify-between items-center py-1">
                                                    <dt className="text-sm font-medium text-slate-500">Reason / Illness</dt>
                                                    <dd className="text-sm font-semibold text-indigo-600">{patientData.illness || 'N/A'}</dd>
                                                </div>
                                                <div className="flex justify-between items-center py-1">
                                                    <dt className="text-sm font-medium text-slate-500">Organisation</dt>
                                                    <dd className="text-sm text-slate-900">{patientData.organisation || 'N/A'}</dd>
                                                </div>
                                                <div className="flex justify-between items-center py-1">
                                                    <dt className="text-sm font-medium text-slate-500">Practitioner</dt>
                                                    <dd className="text-sm text-slate-900">{patientData.practitioner || 'N/A'}</dd>
                                                </div>
                                                <div className="flex justify-between items-center py-1">
                                                    <dt className="text-sm font-medium text-slate-500">Shared Date</dt>
                                                    <dd className="text-sm text-slate-600 italic">{patientData.date || 'N/A'}</dd>
                                                </div>
                                            </dl>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(patientData.rawData, null, 2));
                                        alert("Copied to clipboard!");
                                    }}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    <Code size={14} />
                                    Copy JSON
                                </button>
                            </div>
                            <div className="bg-[#0f172a] rounded-2xl p-8 overflow-auto max-h-[700px] border border-slate-800 shadow-2xl custom-scrollbar">
                                <pre className="font-mono text-xs leading-relaxed text-indigo-300/90 selection:bg-indigo-500/30">
                                    {JSON.stringify(patientData.rawData || { message: "No raw data available" }, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </Card.Body>

                <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl">
                    <Button variant="outline" onClick={() => navigate(backPath)} className="rounded-xl px-6">
                        Back to Dashboard
                    </Button>
                </div>
            </Card>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>
        </div>
    );
};

export default PatientProfileViewer;
