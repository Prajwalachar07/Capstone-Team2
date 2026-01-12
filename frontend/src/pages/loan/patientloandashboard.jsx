import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

const API_BASE = "http://localhost:8000/api";

const PatientLoanDashboard = () => {
    const navigate = useNavigate();
    const { loanId } = useParams();
    const { user } = useAuth();
    const token = localStorage.getItem("access_token") || localStorage.getItem("access");

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLoan, setCurrentLoan] = useState(null);

    /* ---------------- FETCH PROFILE ---------------- */
    useEffect(() => {
        if (user?.role === 'patient') {
            fetch(`${API_BASE}/profile/`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then(setProfile)
                .catch(err => console.error("Profile fetch failed", err));
        }
    }, [token, user?.role]);

    /* ---------------- FETCH LOAN DATA ---------------- */
    useEffect(() => {
        const fetchLoanData = async () => {
            setLoading(true);
            try {
                if (loanId) {
                    // If viewing specific loan (could be patient or provider)
                    const endpoint = user?.role === 'loan_provider'
                        ? `${API_BASE}/loan/provider/${loanId}/`
                        : `${API_BASE}/loan/patient/`;

                    const res = await fetch(endpoint, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();

                    if (Array.isArray(data)) {
                        // If patient endpoint returns array, find the specific loan
                        setCurrentLoan(data.find(l => l.loan_id === loanId));
                    } else {
                        setCurrentLoan(data);
                    }
                }
            } catch (err) {
                console.error("Loan fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchLoanData();
    }, [loanId, token, user?.role]);

    const respondToPlan = async (loanId, action) => {
        try {
            const res = await fetch(`${API_BASE}/loan/patient/respond/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ loan_id: loanId, action })
            });
            if (res.ok) {
                alert(`Loan plan ${action.toLowerCase()}ed successfully!`);
                navigate("/patient/dashboard");
            }
        } catch (err) {
            console.error("Response failed", err);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

    /* ---------------- UI ---------------- */
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* ================= HEADER ================= */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                            {profile?.first_name?.[0] || 'P'}
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-slate-800">
                                {profile ? `${profile.first_name} ${profile.last_name}` : "Patient"}
                            </h2>
                            <p className="text-sm text-slate-500">
                                Medical Loan Dashboard
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/patient/dashboard")}
                        className="text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                        Back to Dashboard
                    </Button>
                </div>

                {/* ================= APPLY LOAN CTA ================= */}
                {!currentLoan && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-2xl text-indigo-600 font-bold">+</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Need Financial Support?</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                Apply for a medical loan to cover your treatment costs with easy EMI options.
                            </p>
                        </div>
                        <Button onClick={() => navigate("/patient/apply-loan")} className="px-8 py-3">
                            Apply for Loan
                        </Button>
                    </div>
                )}

                {/* ================= LOAN STATUS ================= */}
                {currentLoan && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Loan Application Details</h3>
                                    <p className="text-sm text-slate-500">ID: {currentLoan.loan_id}</p>
                                </div>
                                {currentLoan.status === 'Approved' ? (
                                    <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {currentLoan.status}
                                    </span>
                                ) : currentLoan.status === 'Rejected' ? (
                                    <span className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {currentLoan.status}
                                    </span>
                                ) : (
                                    <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {currentLoan.status || "Pending"}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-slate-50">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Amount</p>
                                    <p className="font-bold text-slate-900 text-lg">₹{currentLoan.required_amount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Tenure</p>
                                    <p className="font-bold text-slate-900 text-lg">{currentLoan.preferred_tenure} Months</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Hospital</p>
                                    <p className="font-bold text-slate-900 text-lg truncate">{currentLoan.hospital_name}</p>
                                </div>
                            </div>

                            {/* ================= REVISED PLAN OFFER ================= */}
                            {currentLoan.status === 'Pending' && currentLoan.revised_amount && (
                                <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-600 p-2 rounded-lg">
                                            <span className="text-white text-xs font-bold italic">REVISED</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-widest">Revised Loan Offer</h4>
                                    </div>
                                    <p className="text-sm text-indigo-700">
                                        Based on your risk profile, we've adjusted the amount and tenure to better suit your capacity.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Proposed Amount</p>
                                            <p className="text-xl font-bold text-indigo-600">₹{currentLoan.revised_amount?.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-300 line-through">₹{currentLoan.required_amount?.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Proposed Tenure</p>
                                            <p className="text-xl font-bold text-indigo-600">{currentLoan.revised_tenure} Months</p>
                                            <p className="text-[10px] text-slate-300">{currentLoan.preferred_tenure} Mo (Original)</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <Button
                                            onClick={() => respondToPlan(currentLoan.loan_id, "Accept")}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Accept Offer
                                        </Button>
                                        <Button
                                            onClick={() => respondToPlan(currentLoan.loan_id, "Reject")}
                                            variant="ghost"
                                            className="flex-1 text-red-600 hover:bg-red-50"
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!currentLoan.revised_amount && (
                                <div className="mt-8 space-y-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Application Progress</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">✓</div>
                                            <p className="text-sm font-semibold text-slate-700">Application Submitted</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] ${currentLoan.status === 'Approved' ? 'bg-green-500' :
                                                currentLoan.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-400'
                                                }`}>
                                                {currentLoan.status === 'Approved' ? '✓' : currentLoan.status === 'Rejected' ? '✕' : '⏳'}
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {currentLoan.status === 'Approved' ? 'Verified & Approved' :
                                                    currentLoan.status === 'Rejected' ? 'Verification Rejected' : 'Verification Under Review'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] ${currentLoan.status === 'Approved' ? 'bg-green-500' :
                                                currentLoan.status === 'Rejected' ? 'bg-red-500' : 'bg-slate-200'
                                                }`}>
                                                {currentLoan.status === 'Approved' ? '✓' : currentLoan.status === 'Rejected' ? '✕' : ''}
                                            </div>
                                            <p className={`text-sm font-semibold ${currentLoan.status === 'Approved' ? 'text-slate-700 font-bold' :
                                                currentLoan.status === 'Rejected' ? 'text-slate-700 font-bold' : 'text-slate-300'
                                                }`}>
                                                {currentLoan.status === 'Approved' ? 'Disbursement Ready' :
                                                    currentLoan.status === 'Rejected' ? 'Application Closed' : 'Final Decision'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientLoanDashboard;
