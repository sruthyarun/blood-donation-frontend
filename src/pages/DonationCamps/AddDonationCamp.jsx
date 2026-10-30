
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HospitalPanel from "../../components/HospitalPanel";
import axiosInstance from "../../API/axiosInstance";
import DonationCampForm from "./DonationCampForm";

function AddDonationCamp() {
    const user = useSelector((state) => state.user.currentUser);
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    let storedUser = {};

    try {
        storedUser = JSON.parse(
            localStorage.getItem("loggedInUser") || "{}"
        );
    } catch {
        storedUser = {};
    }

    const hospital = user || storedUser;

    const hospitalName =
        hospital.hospitalName || hospital.name || "";

    const hospitalEmail =
        hospital.email || hospital.hospitalEmail || "";

    const hospitalId =
        hospital._id || hospital.id || "";

    const handleSubmit = async (formData) => {
        if (!hospitalName || !hospitalEmail) {
            setError("Hospital profile information is missing. Please log in again.");
            return;
        }

        try {
            setBusy(true);
            setError("");

            await axiosInstance.post("/donationCamps", {
                ...formData,
                hospitalId,
                hospitalName,
                hospitalEmail,
            });

            window.alert("Donation camp added successfully.");
            navigate("/blood-donation-camps");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to add donation camp."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <HospitalPanel />

            <main className="min-w-0 flex-1 p-4 md:p-8">
                <div className="mx-auto max-w-4xl">
                    <h1 className="mb-2 text-2xl font-bold text-gray-800">
                        Add Donation Camp
                    </h1>
                    <p className="mb-6 text-gray-600">
                        Publish a blood donation camp for donors and recipients.
                    </p>

                    {error && (
                        <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
                            {error}
                        </p>
                    )}

                    <DonationCampForm
                        onSubmit={handleSubmit}
                        submitLabel="Create Donation Camp"
                        busy={busy}
                    />
                </div>
            </main>
        </div>
    );
}

export default AddDonationCamp;
