import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientProfileViewer from '../../components/common/PatientProfileViewer';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';

const ViewSharedProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [sharedData, setSharedData] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { "Authorization": `Bearer ${token}` };

                // Fetch Profile, Share History, Recipients, and FHIR profiles in parallel
                const [profileRes, sharesRes, recipientsRes, fhirRes] = await Promise.all([
                    fetch("http://localhost:8000/api/profile/", { headers }),
                    fetch("http://localhost:8000/api/patient/shared-profiles/", { headers }),
                    fetch("http://localhost:8000/api/recipients/", { headers }),
                    // fetch("http://localhost:8000/api/doctor/shared-profiles/", { headers }),
                    fetch("http://localhost:8000/api/patient/fhir-profiles/", { headers })
                ]);

                if (profileRes.ok && sharesRes.ok && recipientsRes.ok) {
                    const profile = await profileRes.json();
                    const shares = await sharesRes.json();
                    const recipients = await recipientsRes.json();
                    const fhirData = fhirRes.ok ? await fhirRes.json() : null;

                    // Find the specific share by ID (matching both id and shared_id for robustness)
                    const share = shares.find(s =>
                        String(s.id) === String(id) || String(s.shared_id) === String(id)
                    );

                    if (share) {
                        const orgMap = {};
                        recipients.hospitals.forEach(h => orgMap[h.organization_id] = h.name || h.first_name);

                        const docMap = {};
                        recipients.doctors.forEach(d => docMap[d.practitioner_id] = `Dr. ${d.first_name} ${d.last_name}`);

                        // Map ALL extracted fields to the viewer format
                        setSharedData({
                            patientId: share.patient_id || profile.patient_id || "N/A",
                            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
                            illness: share.illness_reason || "N/A",
                            organisation: orgMap[share.organization_id] || share.organization_id || "N/A",
                            practitioner: docMap[share.practitioner_id] || share.practitioner_id || "N/A",
                            date: share.shared_at ? new Date(share.shared_at).toLocaleDateString() : 'N/A',
                            bloodGroup: share.blood_group || profile.blood_group || 'N/A',
                            allergies: share.allergies || 'N/A',
                            // Demographics from profile
                            dob: profile.dob,
                            gender: profile.gender,
                            email: profile.email,
                            phone: profile.phone,
                            address: profile.address,
                            city: profile.city,
                            state: profile.state,
                            zip: profile.zip,
                            // RAW Data
                            rawData: fhirData,
                            // Catch-all for extra backend data if needed
                            sharedId: share.shared_id || share.id
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch shared profile details", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAllData();
        }
    }, [id]);

    if (loading) return <Loader />;

    if (!sharedData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 max-w-md text-center">
                    <p className="font-semibold text-lg">Shared Profile Not Found</p>
                    <p className="text-sm mt-1 opacity-90">The record you're looking for might have been moved or is no longer available.</p>
                </div>
                <button
                    onClick={() => navigate('/patient/dashboard')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <PatientProfileViewer
            patientData={sharedData}
            backPath="/patient/dashboard"
        />
    );
};

export default ViewSharedProfile;
