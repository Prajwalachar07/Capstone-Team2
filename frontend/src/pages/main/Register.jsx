import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const roleFromUrl = searchParams.get("role") || "patient";

    const [loading, setLoading] = useState(false);
    const [hospitals, setHospitals] = useState([]);

    const [formData, setFormData] = useState({
        role: roleFromUrl,
        firstName: "",
        lastName: "",
        specialization: "",
        hospital_id: "",
        Name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Fetch hospitals when role is doctor
    useEffect(() => {
        if (formData.role === "doctor") {
            fetch("http://localhost:8000/api/recipients/")
                .then((res) => res.json())
                .then((data) => setHospitals(data.hospitals || []))
                .catch(() => setHospitals([]));
        }
    }, [formData.role]);

    // For INPUT fields
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ For SELECT components
    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    console.log(formData);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            setLoading(false);
            return;
        }

        // Password complexity validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            alert("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).");
            setLoading(false);
            return;
        }

        let payload = {
            role: formData.role,
            email: formData.email,
            password: formData.password,
        };

        if (formData.role === "hospital" || formData.role === "loan_provider") {
            payload.name = formData.Name;
        } else if (formData.role === "doctor") {
            payload.first_name = formData.firstName;
            payload.last_name = formData.lastName;
            payload.specialization = formData.specialization;
            payload.hospital_id = formData.hospital_id; // ✅ now works
        } else {
            payload.first_name = formData.firstName;
            payload.last_name = formData.lastName;
        }

        try {
            const res = await fetch("http://localhost:8000/api/auth/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            alert("Registration successful!");
            navigate("/login");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded shadow">
                <h2 className="text-2xl text-center mb-4">Create Account</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ROLE (READ ONLY) */}
                    <Select
                        label="Who I Am"
                        value={formData.role}
                        disabled
                        options={[
                            { value: "patient", label: "Patient" },
                            { value: "doctor", label: "Doctor" },
                            { value: "hospital", label: "Hospital" },
                            { value: "loan_provider", label: "Loan Agency" },
                        ]}
                    />

                    {/* NAME */}
                    <Input
                        label={
                            formData.role === "hospital" || formData.role === "loan_provider"
                                ? "Organisation Name"
                                : "First Name"
                        }
                        name={
                            formData.role === "hospital" || formData.role === "loan_provider"
                                ? "Name"
                                : "firstName"
                        }
                        value={
                            formData.role === "hospital" || formData.role === "loan_provider"
                                ? formData.Name
                                : formData.firstName
                        }
                        onChange={handleChange}
                        required
                    />

                    {/* LAST NAME */}
                    {formData.role !== "hospital" && formData.role !== "loan_provider" && (
                        <Input
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    )}

                    {/* DOCTOR EXTRA FIELDS */}
                    {formData.role === "doctor" && (
                        <>
                            <Input
                                label="Specialization"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="Hospital"
                                value={formData.hospital_id}
                                onChange={(e) =>
                                    handleSelectChange("hospital_id", e.target.value)
                                }
                                placeholder="Select a hospital"
                                options={hospitals.map((h) => ({
                                    value: h.organization_id,
                                    label: h.name,
                                }))}
                                required
                            />
                        </>
                    )}

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Register
                    </Button>

                    <p className="text-sm text-center">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-500">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;