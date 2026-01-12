import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Users,
    MoreVertical,
    Eye,
    MapPin,
    ShieldAlert
} from "lucide-react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    AreaChart,
    Area
} from "recharts";
import Card from "../../components/ui/Card";

const LoanAdminDashboard = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const token = localStorage.getItem("access_token") || localStorage.getItem("access");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch Analytics
                const anaRes = await fetch("http://localhost:8000/api/loan/provider/analytics/", { headers });
                const anaData = await anaRes.json();
                setAnalytics(anaData);

                // Fetch Requests
                const reqRes = await fetch("http://localhost:8000/api/loan/provider/requests/", { headers });
                const reqData = await reqRes.json();
                setRequests(reqData);

            } catch (err) {
                console.error("Failed to fetch admin data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);


    // Chart Data Preparation
    const residenceData = [
        { name: "Urban", value: analytics?.residence_dist?.urban || 0, color: "#3B82F6" },
        { name: "Rural", value: analytics?.residence_dist?.rural || 0, color: "#10B981" },
    ];

    const riskData = [
        { name: "Low", value: analytics?.risk_dist?.low || 0, color: "#10B981" },
        { name: "Med", value: analytics?.risk_dist?.medium || 0, color: "#F59E0B" },
        { name: "High", value: analytics?.risk_dist?.high || 0, color: "#EF4444" },
    ];

    const portfolioData = analytics?.portfolio_health?.map(item => ({
        name: item._id,
        Approved: item.approved,
        Rejected: item.rejected,
        Pending: item.pending
    })) || [];

    const tenureData = analytics?.tenure_dist?.map(item => ({
        name: item.tenure,
        count: item.count
    })) || [];

    const trendData = analytics?.submission_trend?.map(item => ({
        name: item.date,
        count: item.count
    })) || [];

    const filteredRequests = useMemo(() => {
        return requests.filter(loan => {
            const matchesStatus = statusFilter === "All" || loan.status === statusFilter;

            // Assuming loan.created_at or similar exists. If not, date filter won't work but UI will be there.
            // Let's assume the date is in 'YYYY-MM-DD' format if it exists.
            const loanDate = loan.created_at ? new Date(loan.created_at) : null;
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            let matchesDate = true;
            if (loanDate) {
                const loanDay = new Date(loanDate.getFullYear(), loanDate.getMonth(), loanDate.getDate());
                if (from) {
                    const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate());
                    if (loanDay < fromDay) matchesDate = false;
                }
                if (to) {
                    const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());
                    if (loanDay > toDay) matchesDate = false;
                }
            } else if (from || to) {
                // If filtering by date but loan has no date, maybe hide or show? 
                // Let's show for now to avoid empty list if data is missing 'created_at'.
            }

            return matchesStatus && matchesDate;
        });
    }, [requests, statusFilter, fromDate, toDate]);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-lg">Loading Analytics...</div>;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10 selection:bg-indigo-100">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* ================= HEADER ================= */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                                <TrendingUp size={24} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Loan Admin Dashboard
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium tracking-wide italic">Financial & Risk Analytics Portal</p>
                    </div>

                </header>

                {/* ================= STATS ROW (KPI CARDS) ================= */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-white border-slate-100 rounded-3xl overflow-hidden hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md">
                        <Card.Body className="p-6 relative">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Applications</p>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analytics?.total || 0}</h3>
                            <div className="mt-4 flex items-center gap-2 text-indigo-600">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <FileText size={20} />
                                </div>
                                <span className="text-xs font-bold">Volume Intake</span>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="bg-white border-slate-100 rounded-3xl overflow-hidden hover:border-green-200 transition-all duration-300 shadow-sm hover:shadow-md">
                        <Card.Body className="p-6 relative">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Approved</p>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analytics?.approved || 0}</h3>
                            <div className="mt-4 flex items-center gap-2 text-green-600">
                                <div className="p-2 bg-green-50 rounded-xl">
                                    <CheckCircle size={20} />
                                </div>
                                <span className="text-xs font-bold">{analytics?.approval_rate}% Rate</span>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="bg-white border-slate-100 rounded-3xl overflow-hidden hover:border-amber-200 transition-all duration-300 shadow-sm hover:shadow-md">
                        <Card.Body className="p-6 relative">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pending</p>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analytics?.pending || 0}</h3>
                            <div className="mt-4 flex items-center gap-2 text-amber-600">
                                <div className="p-2 bg-amber-50 rounded-xl">
                                    <Clock size={20} />
                                </div>
                                <span className="text-xs font-bold">Under Review</span>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="bg-white border-slate-100 rounded-3xl overflow-hidden hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-md">
                        <Card.Body className="p-6 relative">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Rejected</p>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analytics?.rejected || 0}</h3>
                            <div className="mt-4 flex items-center gap-2 text-red-600">
                                <div className="p-2 bg-red-50 rounded-xl">
                                    <XCircle size={20} />
                                </div>
                                <span className="text-xs font-bold">High Risk</span>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {/* ================= DATA TABLE ================= */}
                <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <Card.Header className="border-none p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
                        <h4 className="text-xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
                            <FileText className="text-indigo-600" />
                            Recent Loan Applications
                        </h4>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition-all font-bold text-slate-600"
                            >
                                <option value="All">All Status</option>
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0 overflow-x-auto text-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Date</th>
                                    <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Patient</th>
                                    <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Type</th>
                                    <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-center">Risk</th>
                                    <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Amount</th>
                                    <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
                                    <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRequests.slice(0, 10).map((loan) => (
                                    <tr key={loan.loan_id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-slate-500 font-medium">
                                                {loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{loan.patient_name}</span>
                                                <span className="text-slate-400 text-xs mt-0.5">{loan.loan_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1.5 text-slate-500 capitalize">
                                                <MapPin size={12} className="text-slate-400" />
                                                {loan.hospital_location || 'Urban'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${loan.risk === 'LOW' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                loan.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-red-50 text-red-600 border border-red-100'
                                                }`}>
                                                {loan.risk}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-slate-700">₹{loan.required_amount?.toLocaleString()}</td>
                                        <td className="px-8 py-6">
                                            <span className={`flex items-center gap-2 text-xs font-bold ${loan.status === 'Approved' ? 'text-green-600' :
                                                loan.status === 'Rejected' ? 'text-red-600' :
                                                    'text-amber-600'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${loan.status === 'Approved' ? 'bg-green-500' :
                                                    loan.status === 'Rejected' ? 'bg-red-500' :
                                                        'bg-amber-500 animate-pulse'
                                                    }`}></div>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => navigate(`/patient/loan-dashboard/${loan.loan_id}`)}
                                                className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm"
                                            >
                                                <Eye size={18} className="text-slate-400 group-hover:text-indigo-600" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {requests.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-20 text-center text-slate-400 font-medium italic">No loan applications found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card.Body>
                </Card>

                {/* ================= PIE CHARTS ROW ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* RESIDENCE DISTRIBUTION */}
                    <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <Card.Header className="border-none p-8 flex items-center gap-2">
                            <MapPin size={20} className="text-blue-600" />
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight">Residence Distribution</h4>
                        </Card.Header>
                        <Card.Body className="p-8 pt-0">
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={residenceData}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={10}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {residenceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* RISK DISTRIBUTION */}
                    <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <Card.Header className="border-none p-8 flex items-center gap-2">
                            <ShieldAlert size={20} className="text-red-600" />
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight">Risk segments (Applied Loans)</h4>
                        </Card.Header>
                        <Card.Body className="p-8 pt-0">
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={riskData}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={10}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {riskData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {/* ================= TRENDS AND HEALTH ROW ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* PORTFOLIO HEALTH */}
                    <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <Card.Header className="border-none p-8 pb-0">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight">Portfolio Health</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Approval status by risk level</p>
                        </Card.Header>
                        <Card.Body className="p-8">
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={portfolioData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                                        <Legend />
                                        <Bar dataKey="Approved" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* LOAN TENURE */}
                    <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <Card.Header className="border-none p-8 pb-0">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight">Loan Tenure Distribution</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Months preferred by borrowers</p>
                        </Card.Header>
                        <Card.Body className="p-8">
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={tenureData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                                        <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {/* ================= WAVE CHART: SUBMISSION TREND ================= */}
                <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <Card.Header className="border-none p-8 pb-0">
                        <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Submission trend over time</h4>
                    </Card.Header>
                    <Card.Body className="p-8">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default LoanAdminDashboard;
