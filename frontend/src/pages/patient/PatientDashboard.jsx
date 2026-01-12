import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Edit2,
    Activity,
    Share2,
    Eye,
    Trash2,
    User,
    CreditCard,
    ChevronRight,
    X,
    Banknote
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

/* -------------------------
   BAR CHART COMPONENT (RECHARTS)
--------------------------*/
const BarChart = ({ data, title, allOptions, colors }) => {
    // Prepare data for Recharts
    const chartData = allOptions.map((option, index) => ({
        name: option.length > 10 ? option.substring(0, 10) + '...' : option,
        fullName: option,
        value: data[option] || 0,
        color: colors[index % colors.length]
    }));

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 text-center">
                {title}
            </h3>

            {chartData.every(d => d.value === 0) ? (
                <p className="text-sm text-slate-500 text-center">No data available yet.</p>
            ) : (
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-2 border border-slate-200 rounded shadow-lg">
                                                <p className="text-sm font-semibold">{payload[0].payload.fullName}</p>
                                                <p className="text-sm text-slate-600">Count: {payload[0].value}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

/* -------------------------
   WAVE CHART (AREA CHART)
--------------------------*/
const WaveChart = ({ data, title }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 text-center">
                {title}
            </h3>

            {data.length === 0 ? (
                <p className="text-sm text-slate-500 text-center">No activity found for this range.</p>
            ) : (
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#6366F1"
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                name="Profiles Shared"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

/* -------------------------
   DROPDOWN OPTIONS
--------------------------*/
const COMMON_ILLNESS = [
    'Fever',
    'Cold / Cough',
    'Headache',
    'Stomach Pain',
    'General Checkup',
    'Body Pain',
    'Skin Allergy',
    'Diabetes Follow-up',
    'Blood Pressure Check',
    'Injury / Pain',
];

const COMMON_ALLERGIES = [
    'Peanuts',
    'Milk',
    'Eggs',
    'Seafood',
    'Dust',
    'Pollen',
    'Penicillin',
    'Latex',
    'Soy',
    'Wheat',
];

const PatientDashboard = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [waveFromDate, setWaveFromDate] = useState('');
    const [waveToDate, setWaveToDate] = useState('');
    const [loans, setLoans] = useState([]);
    const [loansLoading, setLoansLoading] = useState(true);
    const [loanFromDate, setLoanFromDate] = useState('');
    const [loanToDate, setLoanToDate] = useState('');
    const [loanStatusFilter, setLoanStatusFilter] = useState('');
    const [showAllLoans, setShowAllLoans] = useState(false);
    const [showAllActivities, setShowAllActivities] = useState(false);

    // Loan Application States
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [loanProviders, setLoanProviders] = useState([]);
    const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
    const [loanFormData, setLoanFormData] = useState({
        loan_provider: '',
        loan_purpose: '',
        medical_reason: '',
        treatment_type: '',
        phone: user?.phone || '',
        preferred_tenure: '',
        hospital_name: '',
        hospital_location: '',
        required_amount: '',
        monthly_income: '',
        insurance_available: 'no',
        existing_loans: 'no',
    });

    const fetchLoans = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://localhost:8000/api/loan/patient/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLoans(data);
            }
        } catch (error) {
            console.error("Failed to fetch loans", error);
        } finally {
            setLoansLoading(false);
        }
    };

    const handleDelete = async (sharedId) => {
        if (!window.confirm("Are you sure you want to delete this shared record?")) return;

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`http://localhost:8000/api/share-profile/${sharedId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Remove from local state
                setActivities(prev => prev.filter(act => act.id !== sharedId));
                alert("Shared profile deleted successfully.");
            } else {
                const errorData = await response.json();
                alert(`Failed to delete: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("An error occurred while deleting the profile.");
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch("http://localhost:8000/api/profile/", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    updateProfile({
                        ...data,
                        firstName: data.first_name,
                        lastName: data.last_name,
                        profileCompleted: data.profile_completed
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchActivities = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { "Authorization": `Bearer ${token}` };

                // Fetch patient's own shared profiles history (confirmed path)
                const activityReq = fetch("http://localhost:8000/api/patient/shared-profiles/", { headers });
                // Fetch recipients to map IDs to names & for loans
                const recipientsReq = fetch("http://localhost:8000/api/recipients/");

                const [activityRes, recipientsRes] = await Promise.all([activityReq, recipientsReq]);

                if (activityRes.ok && recipientsRes.ok) {
                    const activityData = await activityRes.json();
                    const recipientsData = await recipientsRes.json();

                    // Map for activities
                    const orgMap = {};
                    recipientsData.hospitals.forEach(h => orgMap[h.organization_id] = h.name || h.first_name);

                    // Map for loan providers (if they exist in recipients, otherwise use hospitals as placeholders)
                    // The backend might return them in recipientsData.loan_providers or similar.
                    // If not, we'll use hospitals for now as requested.
                    setLoanProviders(recipientsData.loan_providers || recipientsData.hospitals || []);

                    const docMap = {};
                    recipientsData.doctors.forEach(d => docMap[d.practitioner_id] = `Dr. ${d.first_name} ${d.last_name}`);

                    const formattedActivities = (Array.isArray(activityData) ? activityData : []).map((row, idx) => ({
                        id: row.id || row.shared_id || idx,
                        illness: row.illness_reason || 'N/A',
                        organisation: orgMap[row.organization_id] || row.organization_id || 'N/A',
                        doctor: docMap[row.practitioner_id] || row.practitioner_id || 'N/A',
                        date: row.shared_at ? new Date(row.shared_at).toLocaleDateString() : 'N/A',
                        raw_date: row.shared_at // Keep raw date for filtering
                    }));

                    setActivities(formattedActivities);

                    // Rebuild analytics from existing shared profiles
                    if (user?.email && Array.isArray(activityData)) {
                        const illnessKey = `illnessAnalytics_${user.email}`;
                        const allergyKey = `allergyAnalytics_${user.email}`;

                        const illnessData = {};
                        const allergyData = {};

                        activityData.forEach(row => {
                            if (row.illness_reason) {
                                illnessData[row.illness_reason] = (illnessData[row.illness_reason] || 0) + 1;
                            }
                            if (row.allergies) {
                                allergyData[row.allergies] = (allergyData[row.allergies] || 0) + 1;
                            }
                        });

                        localStorage.setItem(illnessKey, JSON.stringify(illnessData));
                        localStorage.setItem(allergyKey, JSON.stringify(allergyData));
                    }
                } else {
                    console.error("Fetch failed in Dashboard:", activityRes.status, recipientsRes.status);
                }
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setActivitiesLoading(false);
            }
        };

        fetchProfile();
        fetchActivities();
        fetchLoans();
    }, []);

    // Sync phone when user profile loads
    useEffect(() => {
        if (user?.phone) {
            setLoanFormData(prev => ({ ...prev, phone: user.phone }));
        }
    }, [user?.phone]);

    /* -------------------------
       ANALYTICS DATA
    --------------------------*/
    const illnessAnalytics = useMemo(
        () => {
            if (!user?.email) return {};
            return JSON.parse(localStorage.getItem(`illnessAnalytics_${user.email}`) || '{}');
        },
        [user?.email]
    );

    const allergyAnalytics = useMemo(
        () => {
            if (!user?.email) return {};
            return JSON.parse(localStorage.getItem(`allergyAnalytics_${user.email}`) || '{}');
        },
        [user?.email]
    );

    /* -------------------------
       TIMELINE ANALYTICS (WAVE GRAPH)
    --------------------------*/
    const timelineData = useMemo(() => {
        if (!activities.length) return [];

        let filtered = activities;
        if (waveFromDate) {
            filtered = filtered.filter(a => new Date(a.raw_date) >= new Date(waveFromDate));
        }
        if (waveToDate) {
            // Include full end date
            const toDateObj = new Date(waveToDate);
            toDateObj.setHours(23, 59, 59, 999);
            filtered = filtered.filter(a => new Date(a.raw_date) <= toDateObj);
        }

        // Group by date
        const counts = {};
        filtered.forEach(a => {
            const d = new Date(a.raw_date).toLocaleDateString();
            counts[d] = (counts[d] || 0) + 1;
        });

        // Convert to array and sort by date
        return Object.entries(counts)
            .map(([date, count]) => ({ date, count, raw: new Date(date) }))
            .sort((a, b) => a.raw - b.raw);
    }, [activities, waveFromDate, waveToDate]);

    const handleLoanChange = (e) => {
        const { name, value } = e.target;
        setLoanFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLoanSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingLoan(true);

        try {
            // This is a dummy submission as specific backend for loans might not exist yet
            console.log("Submitting Loan Application:", loanFormData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            alert("Medical Loan Application submitted successfully! Our representative will contact you shortly.");
            setShowLoanModal(false);
            // Reset form
            setLoanFormData({
                loan_provider: '',
                loan_purpose: '',
                medical_reason: '',
                treatment_type: '',
                phone: user?.phone || '',
                preferred_tenure: '',
                hospital_name: '',
                hospital_location: '',
                required_amount: '',
                monthly_income: '',
                insurance_available: 'no',
                existing_loans: 'no',
            });
        } catch (error) {
            console.error("Loan submission failed", error);
            alert("Failed to submit loan application. Please try again.");
        } finally {
            setIsSubmittingLoan(false);
        }
    };

    const activityColumns = [
        { header: 'Illness / Visit Reason', accessor: 'illness' },
        { header: 'Organisation', accessor: 'organisation' },
        { header: 'Doctor', accessor: 'doctor' },
        { header: 'Date Submitted', accessor: 'date' },
        { header: 'Actions', accessor: 'actions' },
    ];

    const activityDataWithActions = useMemo(() => {
        return activities
            .filter(row => {
                const activityDate = new Date(row.raw_date); // Need raw date for accurate comparison
                const from = fromDate ? new Date(fromDate) : null;
                const to = toDate ? new Date(toDate) : null;

                if (from && activityDate < from) return false;
                if (to && activityDate > to) return false;
                return true;
            })
            .sort((a, b) => new Date(b.raw_date || 0) - new Date(a.raw_date || 0))
            .slice(0, showAllActivities ? undefined : 5)
            .map(row => ({
                ...row,
                actions: (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/patient/shared/${row.id}`)}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="View Details"
                        >
                            <Eye size={18} />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Record"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ),
            }));
    }, [activities, fromDate, toDate, navigate, handleDelete, showAllActivities]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-14 fade-in-page">

            {/* PROFILE SUMMARY */}
            <div className="flex gap-8 items-center bg-white rounded-2xl p-8 shadow-sm border neon-glow">
                <div className="h-28 w-28 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User size={48} className="text-indigo-600" />
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-y-4">
                    <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="font-semibold">
                            {user?.firstName} {user?.lastName}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p>{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p>{user?.phone || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <span className="text-xs px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                            {user?.profileCompleted ? 'Completed' : 'Incomplete'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">

                    {/* Edit Profile – always available */}
                    <Link to="/patient/complete-profile">
                        <Button variant="outline">
                            <Edit2 size={16} className="mr-2" />
                            Edit Profile
                        </Button>
                    </Link>

                    {/* Complete Profile / View Profile */}
                    <Link
                        to={
                            user?.profileCompleted
                                ? "/patient/view-profile"
                                : "/patient/complete-profile"
                        }
                    >
                        <Button variant={user?.profileCompleted ? "outline" : "primary"}>
                            {user?.profileCompleted ? "View Profile" : "Complete Profile"}
                        </Button>
                    </Link>

                    {/* Share Profile – blocked if incomplete */}
                    <Link
                        to="/patient/share-profile"
                        onClick={(e) => {
                            if (!user?.profileCompleted) {
                                e.preventDefault();
                                alert("Please complete your profile first!");
                            }
                        }}
                    >
                        <Button variant="secondary">
                            <Share2 size={16} className="mr-2" />
                            Share Profile
                        </Button>
                    </Link>

                </div>

            </div>

            {/* LOAN ADVERTISEMENT CARD */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 -mt-10 border border-white/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Banknote size={40} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Need Financial Support for Treatment?</h2>
                        <p className="text-blue-100 max-w-lg">
                            Apply for a Medical Loan with easy EMI options and quick approvals.
                            Cover your hospital bills, surgeries, and specialized treatments stress-free.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/patient/apply-loan")}
                    className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
                >
                    Apply Loan
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            <Card>
                <Card.Header className="border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="text-indigo-500" />
                            Recent Activity
                        </h3>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium">From:</span>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="text-xs border rounded-md p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium">To:</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="text-xs border rounded-md p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            {(fromDate || toDate) && (
                                <button
                                    onClick={() => { setFromDate(''); setToDate(''); }}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-6">
                    <Table
                        columns={activityColumns}
                        data={activityDataWithActions}
                        isLoading={activitiesLoading}
                    />
                </Card.Body>
                {activities.length > 5 && (
                    <div className="p-4 border-t border-slate-100 text-center">
                        <button
                            onClick={() => setShowAllActivities(!showAllActivities)}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-1 mx-auto"
                        >
                            {showAllActivities ? 'Show Less' : 'View All Activity'}
                            <ChevronRight size={16} className={showAllActivities ? 'rotate-[-90deg]' : 'rotate(90)'} />
                        </button>
                    </div>
                )}
            </Card>

            {/* LOAN APPLICATIONS TABLE */}
            <div className="space-y-6 mt-14 pt-10 border-t border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Banknote className="text-indigo-600" />
                        My Loan Applications
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">From:</span>
                            <input
                                type="date"
                                value={loanFromDate}
                                onChange={(e) => setLoanFromDate(e.target.value)}
                                className="text-xs border rounded-md p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">To:</span>
                            <input
                                type="date"
                                value={loanToDate}
                                onChange={(e) => setLoanToDate(e.target.value)}
                                className="text-xs border rounded-md p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Status:</span>
                            <select
                                value={loanStatusFilter}
                                onChange={(e) => setLoanStatusFilter(e.target.value)}
                                className="text-xs border rounded-md p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                        {(loanFromDate || loanToDate || loanStatusFilter) && (
                            <button
                                onClick={() => { setLoanFromDate(''); setLoanToDate(''); setLoanStatusFilter(''); }}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <Card>
                    <Card.Body className="p-6">
                        <Table
                            columns={[
                                { header: 'Hospital', accessor: 'hospital_name' },
                                { header: 'Purpose', accessor: 'loan_purpose' },
                                { header: 'Tenure', accessor: 'preferred_tenure' },
                                { header: 'Amount', accessor: 'required_amount' },
                                { header: 'Date Submitted', accessor: 'date_submitted' },
                                { header: 'Status', accessor: 'status_badge' },
                                { header: 'Actions', accessor: 'actions' }
                            ]}
                            data={loans
                                .filter(loan => {
                                    if (!loan.created_at) return true;
                                    const loanDate = new Date(loan.created_at);
                                    const from = loanFromDate ? new Date(loanFromDate) : null;
                                    const to = loanToDate ? new Date(loanToDate) : null;

                                    if (from && loanDate < from) return false;
                                    if (to) {
                                        const toDateObj = new Date(to);
                                        toDateObj.setHours(23, 59, 59, 999);
                                        if (loanDate > toDateObj) return false;
                                    }
                                    if (loanStatusFilter && loan.status !== loanStatusFilter) return false;
                                    return true;
                                })
                                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                                .slice(0, showAllLoans ? undefined : 5)
                                .map(loan => ({
                                    ...loan,
                                    hospital_name: loan.hospital_name || 'N/A',
                                    required_amount: `₹${loan.required_amount?.toLocaleString()}`,
                                    date_submitted: loan.created_at ? new Date(loan.created_at).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    }) : 'N/A',
                                    preferred_tenure: `${loan.preferred_tenure} Months`,
                                    status_badge: (
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${loan.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            loan.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {loan.status}
                                        </span>
                                    ),
                                    actions: (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/patient/loan-dashboard/${loan.loan_id}`)}
                                                className="text-indigo-600 hover:text-indigo-800 p-2"
                                                title="View Status"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    )
                                }))}
                            isLoading={loansLoading}
                        />
                    </Card.Body>
                    {loans.length > 5 && (
                        <div className="p-4 border-t border-slate-100 text-center">
                            <button
                                onClick={() => setShowAllLoans(!showAllLoans)}
                                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-1 mx-auto"
                            >
                                {showAllLoans ? 'Show Less' : 'View All Applications'}
                                <ChevronRight size={16} className={showAllLoans ? 'rotate-[-90deg]' : 'rotate-90'} />
                            </button>
                        </div>
                    )}
                </Card>
            </div>

            {/* ANALYTICS */}
            <div className="flex flex-col gap-8 mt-10">

                <BarChart
                    title="Visit Reasons"
                    data={illnessAnalytics}
                    allOptions={COMMON_ILLNESS}
                    colors={['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899', '#10B981', '#F97316', '#0EA5E9']}
                />

                <BarChart
                    title="Allergies"
                    data={allergyAnalytics}
                    allOptions={COMMON_ALLERGIES}
                    colors={['#F43F5E', '#8B5CF6', '#10B981', '#F97316', '#0EA5E9', '#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#EC4899']}
                />

                {/* WAVE GRAPH SECTION */}
                <div className="space-y-6 mt-6 pt-10 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-800">Sharing Timeline</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">From:</span>
                                <input
                                    type="date"
                                    value={waveFromDate}
                                    onChange={(e) => setWaveFromDate(e.target.value)}
                                    className="text-sm bg-transparent border-none focus:ring-0 outline-none cursor-pointer"
                                />
                                <span className="text-slate-300">|</span>
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">To:</span>
                                <input
                                    type="date"
                                    value={waveToDate}
                                    onChange={(e) => setWaveToDate(e.target.value)}
                                    className="text-sm bg-transparent border-none focus:ring-0 outline-none cursor-pointer"
                                />
                            </div>
                            {(waveFromDate || waveToDate) && (
                                <button
                                    onClick={() => { setWaveFromDate(''); setWaveToDate(''); }}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Reset Timeline Filter"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <WaveChart data={timelineData} title="Record Sharing Activity" />
                </div>

            </div>


        </div >
    );
};

export default PatientDashboard;
