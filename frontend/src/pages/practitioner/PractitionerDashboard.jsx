import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Eye, Users, Building, Activity, Calendar } from 'lucide-react';
import Input from '../../components/ui/Input';
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
                                <linearGradient id="practitionerColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
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
                                stroke="#6366F1"
                                fillOpacity={1}
                                fill="url(#practitionerColor)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </Card.Body>
        </Card>
    );
};

const PractitionerDashboard = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [filterOrg, setFilterOrg] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(true);

    const columns = [
        { header: 'Patient ID', accessor: 'patientId' },
        { header: 'Patient Name', accessor: 'name' },
        { header: 'Illness Type', accessor: 'illness' },
        { header: 'Organisation', accessor: 'organisation' },
        { header: 'Date Submitted', accessor: 'date' },
        {
            header: 'Action',
            render: (row) => (
                <Link to={`/doctor/patient/${row.id}`}>
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

                const patientsReq = fetch("http://localhost:8000/api/doctor/shared-profiles/", { headers });
                const recipientsReq = fetch("http://localhost:8000/api/recipients/", { headers });

                const [patientsRes, recipientsRes] = await Promise.all([patientsReq, recipientsReq]);

                if (patientsRes.ok && recipientsRes.ok) {
                    const patientsData = await patientsRes.json();
                    const recipientsData = await recipientsRes.json();

                    const orgMap = {};
                    recipientsData.hospitals.forEach(org => {
                        orgMap[org.organization_id] = org.name || org.first_name || "Unknown Org";
                    });

                    setOrganizations(recipientsData.hospitals.map(org => ({
                        value: org.name || org.first_name || org.organization_id, // Filter is based on name string in table, or should be ID?
                        // In table mapping below: organisation: orgMap[...]
                        // So the table shows the Name.
                        // So filter should match the Name.
                        label: org.name || org.first_name || "Unknown Org"
                    })));

                    const formattedPatients = patientsData.map((p, index) => ({
                        id: p.id || p.shared_id || p.patient_id,
                        patientId: p.patient_id || 'N/A',
                        name: p.patient_name || 'Unknown',
                        illness: p.illness_reason || 'N/A',
                        organisation: orgMap[p.organization_id] || p.organization_id || 'External',
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
        if (filterOrg && p.organisation !== filterOrg) return false;

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
            orgData: [],
            timelineData: []
        };

        // 1. KPI Calculations
        const uniqueOrgs = new Set(filteredPatients.map(p => p.organisation)).size;

        const illnessCounts = {};
        filteredPatients.forEach(p => {
            illnessCounts[p.illness] = (illnessCounts[p.illness] || 0) + 1;
        });
        const topIllnessEntry = Object.entries(illnessCounts).sort((a, b) => b[1] - a[1])[0];
        const topIllness = topIllnessEntry ? topIllnessEntry[0] : 'N/A';

        // 2. Illness Data for Chart
        const illnessData = Object.entries(illnessCounts)
            .map(([name, value]) => ({ name: name.length > 12 ? name.substring(0, 10) + '...' : name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // 3. Organisation Data for Chart
        const orgCounts = {};
        filteredPatients.forEach(p => {
            orgCounts[p.organisation] = (orgCounts[p.organisation] || 0) + 1;
        });
        const orgData = Object.entries(orgCounts)
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
                { label: 'Total Patients', value: filteredPatients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Participating Orgs', value: uniqueOrgs, icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Top Concern', value: topIllness, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50' },
            ],
            illnessData,
            orgData,
            timelineData
        };
    }, [filteredPatients]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Dashboard</h1>
                    <p className="mt-2 text-sm text-slate-500">Welcome back, get an overview of your assigned patients.</p>
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
                        <div className="flex-grow max-w-sm">
                            <Select
                                label="Filter by Organisation"
                                value={filterOrg}
                                onChange={(e) => setFilterOrg(e.target.value)}
                                options={organizations}
                                placeholder="All Organisations"
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
                            {(filterOrg || fromDate || toDate) && (
                                <button
                                    onClick={() => { setFilterOrg(''); setFromDate(''); setToDate(''); }}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium pb-2 transition-colors"
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
                        Assigned Patients
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
                    title="Top Illness Distribution"
                    data={analytics.illnessData}
                    colors={['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316']}
                />
                <BarChart
                    title="Patients by Organisation"
                    data={analytics.orgData}
                    colors={['#0EA5E9', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6']}
                />
                <div className="lg:col-span-2">
                    <WaveChart title="Patient Onboarding Activity" data={analytics.timelineData} />
                </div>
            </div>
        </div>
    );
};

export default PractitionerDashboard;
