import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { Share2, ArrowLeft, ShieldCheck } from 'lucide-react';

/* -------------------------
   COMMON DROPDOWN DATA
--------------------------*/
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

const ShareProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [recipients, setRecipients] = useState({ doctors: [], hospitals: [] });

    const [formData, setFormData] = useState({
        illness: '',
        organisation: '',
        practitioner: '',
        bloodGroup: '',
        allergies: '',
    });

    /* -------------------------
       FETCH RECIPIENTS
    --------------------------*/
    useEffect(() => {
        const fetchRecipients = async () => {
            try {
                const response = await fetch(
                    "http://localhost:8000/api/recipients/"
                );

                if (response.ok) {
                    const data = await response.json();
                    setRecipients(data);
                }
            } catch (error) {
                console.error("Failed to fetch recipients", error);
            }
        };

        fetchRecipients();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /* -------------------------
       FRONTEND ANALYTICS
    --------------------------*/
    const updateAnalytics = (key, value) => {
        if (!value || !user?.email) return;
        const userKey = `${key}_${user.email}`;
        const data = JSON.parse(localStorage.getItem(userKey) || '{}');
        data[value] = (data[value] || 0) + 1;
        localStorage.setItem(userKey, JSON.stringify(data));
    };

    /* -------------------------
       SUBMIT
    --------------------------*/
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("access_token") || localStorage.getItem("access");

            if (!token) {
                alert("Your session has expired. Please log in again.");
                navigate("/login");
                return;
            }

            const response = await fetch(
                "http://localhost:8000/api/share-profile/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        organization_id: formData.organisation,
                        practitioner_id: formData.practitioner,
                        blood_group: formData.bloodGroup,
                        allergies: formData.allergies,
                        illness_reason: formData.illness,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                // 🔹 Update frontend analytics
                updateAnalytics('illnessAnalytics', formData.illness);
                updateAnalytics('allergyAnalytics', formData.allergies);

                alert("Profile Shared Successfully!");
                navigate('/patient/dashboard');
            } else {
                alert(data.message || "Failed to share profile");
            }
        } catch (error) {
            console.error("Error sharing profile", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-4 text-slate-500 hover:text-slate-700"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">
                    Share Health Profile
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <ShieldCheck className="text-indigo-600 mr-3 hidden sm:block" size={32} />
                    <p className="text-sm text-indigo-800">
                        You are about to share your FHIR-compliant health profile.
                        Select medical details and recipient below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* PROFILE SUMMARY */}
                    <div className="space-y-4 border-b border-slate-200 pb-6">
                        <h3 className="section-title">Profile Summary (Patient)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Name" value={user?.firstName || ''} disabled />
                            <Input label="Patient ID" value={user?.patientId || 'P-1001'} disabled />
                            <Input label="Gender" value={user?.gender || 'N/A'} disabled />
                            <Input label="Date of Birth" value={user?.dob || 'N/A'} disabled />
                        </div>
                    </div>

                    {/* MEDICAL RECORDS */}
                    <div className="space-y-4 border-b border-slate-200 pb-6">
                        <h3 className="section-title">Medical Records</h3>

                        <Select
                            label="Blood Group"
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            options={[
                                { value: 'A+', label: 'A+' },
                                { value: 'A-', label: 'A-' },
                                { value: 'B+', label: 'B+' },
                                { value: 'B-', label: 'B-' },
                                { value: 'O+', label: 'O+' },
                                { value: 'O-', label: 'O-' },
                                { value: 'AB+', label: 'AB+' },
                                { value: 'AB-', label: 'AB-' },
                            ]}
                            placeholder="Select Blood Group"
                        />

                        <Select
                            label="Known Allergies"
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                            options={[
                                ...COMMON_ALLERGIES.map(a => ({ value: a, label: a })),
                                { value: 'Other', label: 'Other' },
                            ]}
                            placeholder="Select Allergy"
                        />

                        {formData.allergies === 'Other' && (
                            <Input
                                label="Specify Allergy"
                                name="allergies"
                                onChange={handleChange}
                                placeholder="Enter allergy name"
                            />
                        )}
                    </div>

                    {/* RECIPIENT SELECTION */}
                    <div className="space-y-4">
                        <h3 className="section-title">Select Recipient</h3>

                        <Select
                            label="Illness / Visit Reason"
                            name="illness"
                            value={formData.illness}
                            onChange={handleChange}
                            required
                            options={[
                                ...COMMON_ILLNESS.map(i => ({ value: i, label: i })),
                                { value: 'Other', label: 'Other' },
                            ]}
                            placeholder="Select Visit Reason"
                        />

                        {formData.illness === 'Other' && (
                            <Input
                                label="Specify Visit Reason"
                                name="illness"
                                onChange={handleChange}
                                placeholder="Enter visit reason"
                            />
                        )}

                        <Select
                            label="Organisation"
                            name="organisation"
                            value={formData.organisation}
                            onChange={handleChange}
                            required
                            options={recipients.hospitals.map(h => ({
                                value: h.organization_id,
                                label: h.name,
                            }))}
                            placeholder="Select Hospital / Clinic"
                        />

                        <Select
                            label="Practitioner"
                            name="practitioner"
                            value={formData.practitioner}
                            onChange={handleChange}
                            required
                            options={recipients.doctors.map(d => ({
                                value: d.practitioner_id,
                                label: `Dr. ${d.first_name} ${d.last_name}`,
                            }))}
                            placeholder="Select Doctor"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="mr-3"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={loading}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Profile
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareProfile;
