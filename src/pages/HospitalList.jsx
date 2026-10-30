
import { useEffect, useState } from "react";
import { getHospitals } from "../services/getHospitals";

function HospitalList() {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const response = await getHospitals();

                // Supports common API response formats
                const hospitalData = Array.isArray(response)
                    ? response
                    : response.data || response.hospitals || [];

                setHospitals(hospitalData);
            } catch (err) {
                setError("Unable to load hospitals. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchHospitals();
    }, []);

    if (loading) {
        return <p className="p-6">Loading hospitals...</p>;
    }

    if (error) {
        return <p className="p-6 text-red-600">{error}</p>;
    }

    if (hospitals.length === 0) {
        return <p className="p-6">No hospitals registered yet.</p>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="mb-6 text-2xl font-bold">
                Registered Hospitals
            </h1>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {hospitals.map((hospital) => (
                    <div
                        key={hospital._id}
                        className="rounded-lg bg-white p-5 shadow"
                    >
                        <h2 className="mb-2 text-xl font-semibold">
                            {hospital.hospitalName}
                        </h2>

                        <p>
                            <strong>Type:</strong>{" "}
                            {hospital.hospitalType || "Not provided"}
                        </p>

                        <p>
                            <strong>Contact:</strong>{" "}
                            {hospital.contactPerson || "Not provided"}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {hospital.email || "Not provided"}
                        </p>

                        <p>
                            <strong>Phone:</strong>{" "}
                            {hospital.phone || "Not provided"}
                        </p>

                        <p>
                            <strong>Location:</strong>{" "}
                            {[hospital.city, hospital.state]
                                .filter(Boolean)
                                .join(", ") || "Not provided"}
                        </p>

                        <p className="mt-3">
                            <strong>Status:</strong>{" "}
                            {hospital.status || "Pending"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HospitalList;
