import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Filter, Eye, Users, UserCheck, Activity, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

/* -------------------------
   ANALYTICS COMPONENTS
--------------------------*/
const BarChart = ({ data, title, colors }) => {
    return (
        <Card className="h-full">
            <Card.Header>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
            </Card.Header>
            <Card.Body className="p-4">
                {data.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm italic">No data available</div>
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748b' }}
                            />
                            <YAxis
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748b' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
};

const WaveChart = ({ data, title }) => {
    return (
        <Card className="h-full">
            <Card.Header>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
            </Card.Header>
            <Card.Body className="p-4">
                {data.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm italic">No activity recorded</div>
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="orgColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748b' }}
                            />
                            <YAxis
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748b' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#0EA5E9"
                                fillOpacity={1}
                                fill="url(#orgColor)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
};

const OrganisationDashboard = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [filterDoc, setFilterDoc] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(true);

    const columns = [
        { header: 'Patient ID', accessor: 'patientId' },
        { header: 'Patient Name', accessor: 'name' },
        { header: 'Illness Type', accessor: 'illness' },
        { header: 'Practitioner', accessor: 'practitioner' },
        { header: 'Date Submitted', accessor: 'date' },
        {
            header: 'Action',
            render: (row) => (
                <Link to={`/hospital/patient/${row.id}`}>
                    <button className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors">
                        <Eye size={18} />
                    </button>
                </Link>
            )
        },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { "Authorization": `Bearer ${token}` };

                // Fetch Shared Profiles
                const profilesReq = fetch("http://localhost:8000/api/hospital/shared-profiles/", { headers });
                // Fetch Doctors to map IDs to Names
                const recipientsReq = fetch("http://localhost:8000/api/recipients/", { headers });

                const [profilesRes, recipientsRes] = await Promise.all([profilesReq, recipientsReq]);

                if (profilesRes.ok && recipientsRes.ok) {
                    const profilesData = await profilesRes.json();
                    const recipientsData = await recipientsRes.json();

                    const doctorMap = {};
                    recipientsData.doctors.forEach(doc => {
                        doctorMap[doc.practitioner_id] = `Dr. ${doc.first_name} ${doc.last_name}`;
                    });
                    setDoctors(recipientsData.doctors.map(d => ({
                        value: d.practitioner_id,
                        label: `Dr. ${d.first_name} ${d.last_name}`
                    })));

                    const formattedPatients = profilesData.map((p, index) => ({
                        id: p.id || p.shared_id || p.patient_id,
                        patientId: p.patient_id || 'N/A',
                        name: p.patient_name || 'Unknown',
                        illness: p.illness_reason || 'N/A',
                        practitioner: doctorMap[p.practitioner_id] || p.practitioner_id || 'Unknown',
                        date: new Date(p.shared_at).toLocaleDateString(),
                        rawDate: p.shared_at
                    }));

                    setPatients(formattedPatients);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const filteredPatients = patients.filter(p => {
        if (filterDoc && p.practitioner !== filterDoc) return false;

        const activityDate = new Date(p.rawDate);
        if (fromDate) {
            const from = new Date(fromDate);
            if (activityDate < from) return false;
        }
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (activityDate > to) return false;
        }
        return true;
    });

    /* -------------------------
       CALCULATE ANALYTICS
    --------------------------*/
    const analytics = useMemo(() => {
        if (!filteredPatients.length) return {
            kpis: [],
            illnessData: [],
            doctorData: [],
            timelineData: []
        };

        // 1. KPI Calculations
        const uniqueDocs = new Set(filteredPatients.map(p => p.practitioner)).size;

        const illnessCounts = {};
        filteredPatients.forEach(p => {
            illnessCounts[p.illness] = (illnessCounts[p.illness] || 0) + 1;
        });
        const topIllnessEntry = Object.entries(illnessCounts).sort((a, b) => b[1] - a[1])[0];
        const topIllness = topIllnessEntry ? topIllnessEntry[0] : 'N/A';

        // 2. Illness Data
        const illnessData = Object.entries(illnessCounts)
            .map(([name, value]) => ({ name: name.length > 12 ? name.substring(0, 10) + '...' : name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // 3. Practitioner Data
        const doctorCounts = {};
        filteredPatients.forEach(p => {
            doctorCounts[p.practitioner] = (doctorCounts[p.practitioner] || 0) + 1;
        });
        const doctorData = Object.entries(doctorCounts)
            .map(([name, value]) => ({ name: name.length > 12 ? name.substring(0, 10) + '...' : name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // 4. Timeline Data
        const dateCounts = {};
        filteredPatients.forEach(p => {
            const dateStr = new Date(p.rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        });
        const timelineData = Object.entries(dateCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => new Date(a.name) - new Date(b.name));

        return {
            kpis: [
                { label: 'Total Intake', value: filteredPatients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active Doctors', value: uniqueDocs, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Major Concern', value: topIllness, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50' },
            ],
            illnessData,
            doctorData,
            timelineData
        };
    }, [filteredPatients]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hospital Dashboard</h1>
                    <p className="mt-2 text-sm text-slate-500">Welcome back, get an overview of your patient records.</p>
                </div>
            </div>

            {/* ANALYTICS KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics.kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden">
                        <div className="flex items-center p-6 gap-5">
                            <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                                <kpi.icon className={kpi.color} size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
                {!analytics.kpis.length && !loading && [1, 2, 3].map(i => (
                    <Card key={i} className="border-none shadow-sm bg-white p-6 h-24 animate-pulse bg-slate-50" />
                ))}
            </div>

            {/* FILTERS & LIST */}
            <Card className="mb-0">
                <Card.Body className="bg-slate-50 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                        <div className="flex-grow max-sm:w-full">
                            <Select
                                label="Filter by Practitioner"
                                value={filterDoc}
                                onChange={(e) => setFilterDoc(e.target.value)}
                                options={doctors.map(d => ({
                                    value: d.label,
                                    label: d.label
                                }))}
                                placeholder="All Practitioners"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-slate-500">From Date</span>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-slate-500">To Date</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                />
                            </div>
                            {(filterDoc || fromDate || toDate) && (
                                <button
                                    onClick={() => { setFilterDoc(''); setFromDate(''); setToDate(''); }}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium pb-1.5 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Patient Records
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {filteredPatients.length}
                        </span>
                    </h3>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table columns={columns} data={filteredPatients} />
                </Card.Body>
            </Card>

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BarChart
                    title="Case Distribution"
                    data={analytics.illnessData}
                    colors={['#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E']}
                />
                <BarChart
                    title="Doctor Workload"
                    data={analytics.doctorData}
                    colors={['#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81']}
                />
                <div className="lg:col-span-2">
                    <WaveChart title="Referral Intake Trend" data={analytics.timelineData} />
                </div>
            </div>
        </div>
    );
};

export default OrganisationDashboard;
