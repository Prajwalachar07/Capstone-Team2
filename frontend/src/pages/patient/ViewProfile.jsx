import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PatientProfileViewer from '../../components/common/PatientProfileViewer';
import Loader from '../../components/common/Loader';

const ViewProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const headers = { "Authorization": `Bearer ${token}` };

                const [profileRes, fhirRes] = await Promise.all([
                    fetch("http://localhost:8000/api/profile/", { headers }),
                    fetch("http://localhost:8000/patient/fhir-profiles/", { headers })
                ]);

                if (profileRes.ok) {
                    const data = await profileRes.json();
                    const fhirData = fhirRes.ok ? await fhirRes.json() : null;

                    // Map API data to PatientProfileViewer expected format
                    setProfileData({
                        patientId: data.patient_id || "P-1001",
                        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                        illness: "General Profile",
                        practitioner: "N/A",
                        date: new Date().toISOString().split('T')[0],
                        dob: data.dob,
                        gender: data.gender,
                        email: data.email,
                        phone: data.phone,
                        address: data.address,
                        city: data.city,
                        state: data.state,
                        zip: data.zip,
                        rawData: fhirData
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <Loader />;

    if (!profileData) return <div>Error loading profile</div>;

    return (
        <PatientProfileViewer
            patientData={profileData}
            backPath="/patient/dashboard"
            hideRawView={true}
            hideClinicalDetails={true}
        />
    );
};

export default ViewProfile;
