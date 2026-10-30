
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaHospital,
    FaUserInjured,
    FaTint,
    FaMapMarkerAlt,
    FaPhone,
    FaNotesMedical,
    FaPaperPlane,
} from "react-icons/fa";

import HospitalPanel from "../../components/HospitalPanel";
import axiosInstance from "../../API/axiosInstance";

const initialForm = {
    patientName: "",
    bloodGroup: "",
    units: "",
    district: "",
    contact: "",
    reason: "",
};

function HospitalEmergencyRequest() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hospital] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("loggedInUser") || "null"
            );
        } catch {
            return null;
        }
    });

    const hospitalName =
        hospital?.hospitalName || hospital?.name || "";

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!hospital?.email || !hospitalName) {
            setError(
                "Hospital login information is missing. Please log in again."
            );
            return;
        }

        const {
            patientName,
            bloodGroup,
            units,
            district,
            contact,
            reason,
        } = formData;

        if (
            !patientName.trim() ||
            !bloodGroup ||
            !units ||
            !district.trim() ||
            !contact.trim() ||
            !reason.trim()
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (!Number.isInteger(Number(units)) || Number(units) < 1) {
            setError("Units required must be a positive whole number.");
            return;
        }

        const emergencyRequest = {
            requestedBy: "Hospital",
            requesterId: hospital._id || hospital.id || "",
            requesterName: hospitalName,
            email: hospital.email.trim().toLowerCase(),

            patientName: patientName.trim(),
            bloodGroup,
            units: Number(units),
            district: district.trim(),
            hospital: hospitalName,
            contact: contact.trim(),
            reason: reason.trim(),

            status: "Active",
            createdAt: new Date().toISOString(),
        };

        try {
            setLoading(true);

            const response = await axiosInstance.post(
                "/emergencyRequests",
                emergencyRequest
            );

            if (response.status === 200 || response.status === 201) {
                alert("Emergency request submitted successfully.");
                setFormData(initialForm);
                navigate("/hospital-emergency");
            }
        } catch (err) {
            console.error(
                "Emergency request submission failed:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to submit emergency request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <HospitalPanel />

            <div className="flex-1 min-w-0 p-4 md:p-8">
                <div className="bg-white rounded-2xl shadow-xl max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-red-600 text-white p-6 rounded-t-2xl">
                        <h1 className="text-3xl font-bold">
                            Emergency Blood Request
                        </h1>

                        <p className="mt-2 text-red-100">
                            Create an emergency blood request for donors.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="p-6 md:p-8 space-y-6"
                    >
                        {error && (
                            <div
                                role="alert"
                                className="bg-red-100 text-red-700 p-4 rounded-lg"
                            >
                                {error}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Patient Name */}
                            <div>
                                <label
                                    htmlFor="patientName"
                                    className="font-medium"
                                >
                                    Patient Name
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaUserInjured className="text-red-600" />

                                    <input
                                        id="patientName"
                                        type="text"
                                        name="patientName"
                                        value={formData.patientName}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                        placeholder="Patient Name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Blood Group */}
                            <div>
                                <label
                                    htmlFor="bloodGroup"
                                    className="font-medium"
                                >
                                    Blood Group
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaTint className="text-red-600" />

                                    <select
                                        id="bloodGroup"
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none bg-white"
                                        required
                                    >
                                        <option value="">
                                            Select Blood Group
                                        </option>

                                        {[
                                            "A+",
                                            "A-",
                                            "B+",
                                            "B-",
                                            "AB+",
                                            "AB-",
                                            "O+",
                                            "O-",
                                        ].map((group) => (
                                            <option
                                                key={group}
                                                value={group}
                                            >
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Units */}
                            <div>
                                <label
                                    htmlFor="units"
                                    className="font-medium"
                                >
                                    Units Required
                                </label>

                                <input
                                    id="units"
                                    type="number"
                                    name="units"
                                    min="1"
                                    step="1"
                                    value={formData.units}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 mt-2"
                                    placeholder="Enter units required"
                                    required
                                />
                            </div>

                            {/* District */}
                            <div>
                                <label
                                    htmlFor="district"
                                    className="font-medium"
                                >
                                    District
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaMapMarkerAlt className="text-red-600" />

                                    <input
                                        id="district"
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                        placeholder="District"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <label
                                    htmlFor="contact"
                                    className="font-medium"
                                >
                                    Contact Number
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaPhone className="text-red-600" />

                                    <input
                                        id="contact"
                                        type="tel"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                        placeholder="Contact Number"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Hospital */}
                            <div>
                                <label
                                    htmlFor="hospital"
                                    className="font-medium"
                                >
                                    Hospital
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 bg-gray-100">
                                    <FaHospital className="text-red-600" />

                                    <input
                                        id="hospital"
                                        type="text"
                                        value={hospitalName}
                                        readOnly
                                        className="w-full p-3 bg-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label
                                htmlFor="reason"
                                className="font-medium"
                            >
                                Reason
                            </label>

                            <div className="flex border rounded-lg mt-2 px-3">
                                <FaNotesMedical className="text-red-600 mt-4" />

                                <textarea
                                    id="reason"
                                    name="reason"
                                    rows="4"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    className="w-full p-3 outline-none resize-none"
                                    placeholder="Reason for emergency blood request"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaPaperPlane />

                            {loading
                                ? "Submitting..."
                                : "Submit Emergency Request"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default HospitalEmergencyRequest;