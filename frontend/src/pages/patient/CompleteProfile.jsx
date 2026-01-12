import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { Save, ArrowLeft } from 'lucide-react';

const CompleteProfile = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [completion, setCompletion] = useState(40);

    const [formData, setFormData] = useState({
        phone: '',
        dob: '',
        gender: 'male',
        address: '',
        city: '',
        state: '',
        zip: '',
    });

    // Fetch existing profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch("http://localhost:8000/api/profile/", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        phone: data.phone || '',
                        dob: data.dob || '',
                        gender: data.gender || 'male',
                        address: data.address || '',
                        city: data.city || '',
                        state: data.state || '',
                        zip: data.zip || ''
                    }));
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            }
        };
        fetchProfile();
    }, []);

    // calculate profile completion
    useEffect(() => {
        const totalFields = Object.keys(formData).length + 3;
        const filledFields =
            Object.values(formData).filter(Boolean).length + 3;

        setCompletion(Math.round((filledFields / totalFields) * 100));
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                "http://localhost:8000/api/profile/update/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        // 🔒 SAFE: only send names if present
                        first_name: user?.firstName || "",
                        last_name: user?.lastName || "",
                        phone: formData.phone,
                        dob: formData.dob,
                        gender: formData.gender,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        zip: formData.zip,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Profile update failed");
            }

            // Update local user context
            updateProfile({
                phone: formData.phone
            });

            alert("Profile updated successfully");
            navigate(`/${user.role}/dashboard`);

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Complete Your Profile</h1>
                </div>
            </div>

            <Card>
                <Card.Body className="p-8 space-y-8">
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold text-indigo-900">Profile Completion</span>
                            <span className="text-sm font-bold text-indigo-600">{completion}%</span>
                        </div>
                        <div className="w-full bg-indigo-200 rounded-full h-2.5">
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${completion}%` }}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input label="First Name" value={user?.firstName || ""} disabled className="bg-slate-50 border-slate-200" />
                            <Input label="Last Name" value={user?.lastName || ""} disabled className="bg-slate-50 border-slate-200" />
                            <Input label="Email" value={user?.email || ""} disabled className="col-span-2 md:col-span-1 bg-slate-50 border-slate-200" />

                            <Input
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="enter your phone number"
                            />

                            <Input
                                label="Date of Birth"
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                options={[
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Address Details</h3>
                            <div className="space-y-6">
                                <Input
                                    label="Street Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="123 Main St"
                                />

                                <div className="grid md:grid-cols-3 gap-6">
                                    <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="enter city" />
                                    <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="enter state" />
                                    <Input label="Zip Code" name="zip" value={formData.zip} onChange={handleChange} placeholder="enter zipcode" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={loading} size="lg">
                                <Save className="mr-2 h-4 w-4" />
                                Save Profile
                            </Button>
                        </div>
                    </form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CompleteProfile;