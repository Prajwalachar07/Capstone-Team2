import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import { ArrowLeft, Save } from "lucide-react";

const LoanApplyForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loanProviders, setLoanProviders] = useState([]);
    const [city, setCity] = useState("");

    const [formData, setFormData] = useState({
        loan_provider: "",
        loan_purpose: "checkup",
        medical_reason: "",
        treatment_type: "General",
        phone: user?.phone || "",
        preferred_tenure: "12",
        hospital_name: "City Hospital", // Default as per user preference in dashboard
        hospital_location: "Urban",
        required_amount: "",
        monthly_income: "",
        existing_insurance: "no",
        existing_loans: "no",
    });

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/recipients/");
                const data = await res.json();
                setLoanProviders(data.loan_providers || []);
            } catch (err) {
                console.error("Failed to fetch loan providers", err);
            }
        };
        fetchProviders();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("access_token") || localStorage.getItem("access");
            const res = await fetch("http://localhost:8000/api/loan/apply/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to apply for loan");

            alert("Loan application submitted successfully!");
            navigate("/patient/dashboard");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Apply for Medical Loan</h1>
            </div>

            <Card>
                <Card.Body className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Select
                                label="Loan Provider"
                                value={formData.loan_provider}
                                onChange={(e) => handleSelectChange("loan_provider", e.target.value)}
                                options={loanProviders.map(lp => ({ value: lp.loan_provider_id, label: lp.name }))}
                                required
                                placeholder="Select provider"
                            />

                            <Select
                                label="Loan Purpose"
                                value={formData.loan_purpose}
                                onChange={(e) => handleSelectChange("loan_purpose", e.target.value)}
                                options={[
                                    { value: "checkup", label: "General Checkup" },
                                    { value: "surgery", label: "Surgery" },
                                    { value: "dialysis", label: "Dialysis" },
                                    { value: "emergency", label: "Emergency" },
                                ]}
                                required
                            />

                            <Select
                                label="Treatment Type"
                                value={formData.treatment_type}
                                onChange={(e) => handleSelectChange("treatment_type", e.target.value)}
                                options={[
                                    { value: "Inpatient", label: "Inpatient / Hospitalization" },
                                    { value: "Outpatient", label: "Outpatient / Daycare" },
                                    { value: "Diagnostic", label: "Diagnostic Tests" },
                                    { value: "Maternity", label: "Maternity" },
                                ]}
                                required
                            />

                            <Input
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="Preferred Tenure"
                                value={formData.preferred_tenure}
                                onChange={(e) => handleSelectChange("preferred_tenure", e.target.value)}
                                options={[
                                    { value: "6", label: "6 Months" },
                                    { value: "12", label: "12 Months" },
                                    { value: "24", label: "24 Months" },
                                    { value: "36", label: "36 Months" },
                                ]}
                                required
                            />

                            <Input
                                label="Hospital Name"
                                name="hospital_name"
                                value={formData.hospital_name}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="Hospital Location"
                                value={formData.hospital_location}
                                onChange={(e) => handleSelectChange("hospital_location", e.target.value)}
                                options={[
                                    { value: "Urban", label: "Urban" },
                                    { value: "Rural", label: "Rural" },
                                ]}
                                required
                            />

                            <Input
                                label="Enter Exact Location"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. Mumbai, Bangalore"
                            />

                            <Input
                                label="Required Amount (₹)"
                                name="required_amount"
                                type="number"
                                value={formData.required_amount}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Monthly Income (₹)"
                                name="monthly_income"
                                type="number"
                                value={formData.monthly_income}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="Existing Insurance?"
                                value={formData.existing_insurance}
                                onChange={(e) => handleSelectChange("existing_insurance", e.target.value)}
                                options={[
                                    { value: "no", label: "No" },
                                    { value: "yes", label: "Yes" },
                                ]}
                                required
                            />

                            <Select
                                label="Existing Loans?"
                                value={formData.existing_loans}
                                onChange={(e) => handleSelectChange("existing_loans", e.target.value)}
                                options={[
                                    { value: "no", label: "No" },
                                    { value: "yes", label: "Yes" },
                                ]}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 tracking-wide mb-1">
                                Medical Reason
                            </label>
                            <textarea
                                name="medical_reason"
                                value={formData.medical_reason}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={loading} size="lg">
                                <Save className="mr-2 h-4 w-4" />
                                Apply for Loan
                            </Button>
                        </div>
                    </form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default LoanApplyForm;
