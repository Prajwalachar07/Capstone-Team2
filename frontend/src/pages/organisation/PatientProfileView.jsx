import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientProfileViewer from '../../components/common/PatientProfileViewer';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';

const PatientProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [patientData, setPatientData] = useState(null);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { "Authorization": `Bearer ${token}` };
                // console.log("access_token",headers)
                // Fetch DOC and RAW data as requested by the user
                const [sharesRes, fhirRes, profileRes, recipientsRes] = await Promise.all([
                    fetch("http://localhost:8000/api/hospital/shared-profiles/", { headers }),
                    fetch("http://localhost:8000/api/patient/fhir-profiles/", { headers }),
                    fetch("http://localhost:8000/api/profile/", { headers }), // We might need patient demographics
                    fetch("http://localhost:8000/api/recipients/", { headers })
                ]);

                if (sharesRes.ok && fhirRes.ok) {
                    const shares = await sharesRes.json();
                    const fhirDocs = await fhirRes.json();
                    const recipients = recipientsRes.ok ? await recipientsRes.json() : { hospitals: [], doctors: [] };
                    const profile = profileRes.ok ? await profileRes.json() : {};

                    // Find the specific share by ID
                    const share = shares.find(s => String(s.id) === String(id) || String(s.shared_id) === String(id));

                    if (share) {
                        const orgMap = {};
                        recipients.hospitals.forEach(h => orgMap[h.organization_id] = h.name || h.first_name);

                        const docMap = {};
                        recipients.doctors.forEach(d => docMap[d.practitioner_id] = `Dr. ${d.first_name} ${d.last_name}`);

                        setPatientData({
                            patientId: share.patient_id || "N/A",
                            name: share.patient_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Patient",
                            illness: share.illness_reason || "N/A",
                            organisation: orgMap[share.organization_id] || "N/A",
                            practitioner: docMap[share.practitioner_id] || "N/A",
                            date: share.shared_at ? new Date(share.shared_at).toLocaleDateString() : 'N/A',
                            bloodGroup: share.blood_group || profile.blood_group || 'N/A',
                            allergies: share.allergies || 'N/A',
                            // Demographics (might be missing if coming from share object only)
                            dob: share.dob || profile.dob,
                            gender: share.gender || profile.gender,
                            email: share.email || profile.email,
                            phone: share.phone || profile.phone,
                            address: share.address || profile.address,
                            city: share.city || profile.city,
                            state: share.state || profile.state,
                            zip: share.zip || profile.zip,
                            // RAW Data
                            rawData: fhirDocs
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch detailed profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPatientData();
        }
    }, [id]);

    if (loading) return <Loader />;

    if (!patientData) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 font-medium">Profile record not found.</p>
                <button onClick={() => navigate('/doctor/dashboard')} className="mt-4 text-indigo-600 hover:underline">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return <PatientProfileViewer patientData={patientData} backPath="/hospital/dashboard" />;
};

export default PatientProfileView;
