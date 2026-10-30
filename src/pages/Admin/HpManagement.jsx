

import { useState, useEffect, useMemo } from "react";
import axios from "axios";

import {
    FaSearch,
    FaHospital,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaEye,
    FaTrash,
    FaCheck,
    FaTimes,
    FaBuilding,
    FaBan,
    FaTimesCircle,
    FaEnvelope,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";

const API_URL =
    "https://blood-donation-backend-olwl.onrender.com/api/hospitals";

const getHospitalId = (hospital) =>
    hospital?._id || hospital?.id;

const extractHospitals = (data) => {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.hospitals)) {
        return data.hospitals;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.data?.hospitals)) {
        return data.data.hospitals;
    }

    return [];
};

const normalizeStatus = (status) =>
    String(status || "Pending").trim().toLowerCase();

function HospitalManagementADm() {
    const [hospitals, setHospitals] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedHospital, setSelectedHospital] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch hospitals
    const fetchHospitals = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            const hospitalList = extractHospitals(response.data);

            setHospitals(hospitalList);

        } catch (err) {
            console.error(
                "Error fetching hospitals:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Unable to load hospitals. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    // Search hospitals
    const filteredHospitals = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        if (!searchValue) return hospitals;

        return hospitals.filter((hospital) => {
            const fields = [
                hospital.hospitalName,
                hospital.name,
                hospital.email,
                hospital.phone,
                hospital.hospitalType,
                hospital.city,
                hospital.district,
                hospital.registrationNumber,
                hospital.licenseNumber,
                hospital.status,
            ];

            return fields.some((field) =>
                String(field || "")
                    .toLowerCase()
                    .includes(searchValue)
            );
        });
    }, [hospitals, search]);

    // Statistics
    const totalHospitals = hospitals.length;

    const approvedCount = hospitals.filter(
        (hospital) =>
            normalizeStatus(hospital.status) === "approved"
    ).length;

    const pendingCount = hospitals.filter(
        (hospital) =>
            normalizeStatus(hospital.status) === "pending"
    ).length;

    const rejectedCount = hospitals.filter(
        (hospital) =>
            normalizeStatus(hospital.status) === "rejected"
    ).length;

    const blockedCount = hospitals.filter(
        (hospital) =>
            normalizeStatus(hospital.status) === "blocked"
    ).length;

    // Status color
    const getStatusColor = (status) => {
        switch (normalizeStatus(status)) {
            case "approved":
                return "bg-green-100 text-green-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "rejected":
                return "bg-red-100 text-red-700";

            case "blocked":
                return "bg-gray-200 text-gray-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Update hospital status
    const updateStatus = async (id, status) => {
        if (!id) {
            alert("Hospital ID not found.");
            return;
        }

        try {
            setUpdatingId(id);
            setError("");

            // Backend must support PATCH /:id
            await axios.patch(`${API_URL}/${id}`, {
                status,
            });

            // Update hospital list immediately
            setHospitals((previous) =>
                previous.map((hospital) =>
                    getHospitalId(hospital) === id
                        ? { ...hospital, status }
                        : hospital
                )
            );

            // Update selected profile
            setSelectedHospital((previous) =>
                previous && getHospitalId(previous) === id
                    ? { ...previous, status }
                    : previous
            );

        } catch (err) {
            console.error(
                "Error updating hospital:",
                err.response?.data || err.message
            );

            alert(
                err.response?.data?.message ||
                "Unable to update hospital status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Delete hospital
    const deleteHospital = async (id) => {
        if (!id) {
            alert("Hospital ID not found.");
            return;
        }

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this hospital?"
        );

        if (!confirmDelete) return;

        try {
            setDeletingId(id);

            await axios.delete(`${API_URL}/${id}`);

            setHospitals((previous) =>
                previous.filter(
                    (hospital) => getHospitalId(hospital) !== id
                )
            );

            setSelectedHospital((previous) =>
                previous && getHospitalId(previous) === id
                    ? null
                    : previous
            );

            alert("Hospital deleted successfully.");

        } catch (err) {
            console.error(
                "Error deleting hospital:",
                err.response?.data || err.message
            );

            alert(
                err.response?.data?.message ||
                "Unable to delete hospital."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // Hospital action buttons
    const renderActions = (hospital) => {
        const id = getHospitalId(hospital);
        const status = normalizeStatus(hospital.status);

        return (
            <div className="flex flex-wrap items-center gap-2">

                {/* View */}
                <button
                    onClick={() => setSelectedHospital(hospital)}
                    title="View Profile"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                >
                    <FaEye />
                </button>

                {/* Approve */}
                {status === "pending" && (
                    <button
                        onClick={() => updateStatus(id, "Approved")}
                        disabled={updatingId === id || deletingId === id}
                        title="Approve Hospital"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 transition"
                    >
                        <FaCheck />
                    </button>
                )}

                {/* Reject */}
                {status === "pending" && (
                    <button
                        onClick={() => updateStatus(id, "Rejected")}
                        disabled={updatingId === id || deletingId === id}
                        title="Reject Hospital"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 transition"
                    >
                        <FaTimes />
                    </button>
                )}

                {/* Block */}
                {status === "approved" && (
                    <button
                        onClick={() => updateStatus(id, "Blocked")}
                        disabled={updatingId === id || deletingId === id}
                        title="Block Hospital"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white disabled:opacity-50 transition"
                    >
                        <FaBan />
                    </button>
                )}

                {/* Unblock */}
                {status === "blocked" && (
                    <button
                        onClick={() => updateStatus(id, "Approved")}
                        disabled={updatingId === id || deletingId === id}
                        title="Unblock Hospital"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 transition"
                    >
                        <FaCheck />
                    </button>
                )}

                {/* Delete */}
                <button
                    onClick={() => deleteHospital(id)}
                    disabled={updatingId === id || deletingId === id}
                    title="Delete Hospital"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 transition"
                >
                    <FaTrash />
                </button>

                {updatingId === id && (
                    <span className="text-xs text-gray-500">
                        Updating...
                    </span>
                )}

                {deletingId === id && (
                    <span className="text-xs text-gray-500">
                        Deleting...
                    </span>
                )}

            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <main className="min-h-screen bg-gray-100 p-4 md:p-8 flex-1 min-w-0">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Hospital Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage registered hospitals and registration requests.
                        </p>
                    </div>

                    <div className="flex items-center bg-white shadow rounded-lg px-4 py-3 w-full md:w-80">

                        <FaSearch className="text-gray-500" />

                        <input
                            type="text"
                            placeholder="Search hospital..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="ml-2 outline-none w-full"
                        />

                    </div>

                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

                    <StatCard
                        title="Total Hospitals"
                        count={totalHospitals}
                        color="red"
                    />

                    <StatCard
                        title="Approved"
                        count={approvedCount}
                        color="green"
                    />

                    <StatCard
                        title="Pending"
                        count={pendingCount}
                        color="yellow"
                    />

                    <StatCard
                        title="Rejected"
                        count={rejectedCount}
                        color="red"
                    />

                    <StatCard
                        title="Blocked"
                        count={blockedCount}
                        color="gray"
                    />

                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-5 flex justify-between items-center gap-3">

                        <p>{error}</p>

                        <button
                            onClick={fetchHospitals}
                            className="font-semibold underline"
                        >
                            Retry
                        </button>

                    </div>
                )}

                {/* Hospital list */}
                <div className="space-y-4">

                    {loading ? (
                        <div className="bg-white rounded-xl shadow p-10 text-center">
                            <p className="text-gray-500">
                                Loading hospitals...
                            </p>
                        </div>
                    ) : filteredHospitals.length === 0 ? (
                        <div className="bg-white rounded-xl shadow p-10 text-center">

                            <FaHospital className="mx-auto text-gray-300 text-5xl mb-3" />

                            <p className="text-gray-500">
                                No hospitals found.
                            </p>

                        </div>
                    ) : (
                        filteredHospitals.map((hospital) => {
                            const id = getHospitalId(hospital);

                            return (
                                <div
                                    key={id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5"
                                >

                                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                                        {/* Hospital information */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">

                                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                <FaHospital className="text-red-600 text-2xl" />
                                            </div>

                                            <div className="min-w-0">

                                                <h2 className="text-lg font-bold text-gray-800">
                                                    {hospital.hospitalName ||
                                                        hospital.name ||
                                                        "Unknown Hospital"}
                                                </h2>

                                                <p className="text-sm text-gray-500 break-all">
                                                    Hospital ID: {id || "N/A"}
                                                </p>

                                                <p className="text-sm text-gray-500 break-all">
                                                    {hospital.email || "No email"}
                                                </p>

                                                <div className="flex flex-wrap gap-3 mt-2 text-sm">

                                                    <span className="flex items-center gap-1">
                                                        <FaPhoneAlt className="text-red-600" />
                                                        {hospital.phone || "N/A"}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <FaMapMarkerAlt className="text-red-600" />
                                                        {hospital.city ||
                                                            hospital.district ||
                                                            "N/A"}
                                                    </span>

                                                </div>

                                            </div>
                                        </div>

                                        {/* Hospital status */}
                                        <div className="flex flex-wrap gap-3">

                                            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">
                                                <FaBuilding className="inline mr-1" />
                                                {hospital.hospitalType || "Hospital"}
                                            </span>

                                            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                                                License: {
                                                    hospital.registrationNumber ||
                                                    hospital.licenseNumber ||
                                                    "N/A"
                                                }
                                            </span>

                                            <span
                                                className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(hospital.status)}`}
                                            >
                                                {hospital.status || "Pending"}
                                            </span>

                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-start xl:justify-end">
                                            {renderActions(hospital)}
                                        </div>

                                    </div>

                                </div>
                            );
                        })
                    )}

                </div>

                {/* Hospital Profile Modal */}
                {selectedHospital && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedHospital(null)}
                    >

                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >

                            {/* Modal header */}
                            <div className="flex justify-between items-center p-6 border-b">

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Hospital Profile
                                    </h2>

                                    <p className="text-gray-500 text-sm break-all">
                                        Hospital ID: {getHospitalId(selectedHospital)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedHospital(null)}
                                    className="w-10 h-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600"
                                >
                                    <FaTimesCircle />
                                </button>

                            </div>

                            {/* Modal body */}
                            <div className="p-6">

                                <div className="flex items-center gap-4 mb-6">

                                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <FaHospital className="text-red-600 text-3xl" />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-2xl font-bold text-gray-800">
                                            {selectedHospital.hospitalName ||
                                                selectedHospital.name ||
                                                "Unknown Hospital"}
                                        </h3>

                                        <p className="text-gray-500 break-all">
                                            {selectedHospital.email || "No email"}
                                        </p>
                                    </div>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <ProfileItem
                                        label="Hospital Name"
                                        value={selectedHospital.hospitalName || selectedHospital.name}
                                    />

                                    <ProfileItem
                                        label="Hospital Type"
                                        value={selectedHospital.hospitalType}
                                    />

                                    <ProfileItem
                                        label="Phone"
                                        value={selectedHospital.phone}
                                    />

                                    <ProfileItem
                                        label="Email"
                                        value={selectedHospital.email}
                                    />

                                    <ProfileItem
                                        label="Registration / License Number"
                                        value={
                                            selectedHospital.registrationNumber ||
                                            selectedHospital.licenseNumber
                                        }
                                    />

                                    <ProfileItem
                                        label="City"
                                        value={selectedHospital.city}
                                    />

                                    <ProfileItem
                                        label="District"
                                        value={selectedHospital.district}
                                    />

                                    <ProfileItem
                                        label="State"
                                        value={selectedHospital.state}
                                    />

                                    <ProfileItem
                                        label="Pincode"
                                        value={selectedHospital.pincode}
                                    />

                                    <ProfileItem
                                        label="Contact Person"
                                        value={
                                            selectedHospital.contactPerson ||
                                            selectedHospital.managerName
                                        }
                                    />

                                </div>

                                <div className="mt-4">
                                    <ProfileItem
                                        label="Address"
                                        value={selectedHospital.address}
                                    />
                                </div>

                                {/* Registration status */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-xl">

                                    <p className="text-sm text-gray-500 mb-2">
                                        Registration Status
                                    </p>

                                    <span
                                        className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(selectedHospital.status)}`}
                                    >
                                        {selectedHospital.status || "Pending"}
                                    </span>

                                </div>

                                {/* Modal actions */}
                                <div className="mt-6">
                                    {renderActions(selectedHospital)}
                                </div>

                            </div>

                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

// Statistics card
function StatCard({ title, count, color }) {
    const colors = {
        red: "border-red-600 text-red-600",
        green: "border-green-600 text-green-600",
        yellow: "border-yellow-500 text-yellow-600",
        gray: "border-gray-600 text-gray-600",
    };

    return (
        <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${colors[color]}`}>
            <h2 className="text-gray-500">
                {title}
            </h2>

            <p className={`text-4xl font-bold mt-2 ${colors[color].split(" ")[1]}`}>
                {count}
            </p>
        </div>
    );
}

// Profile information
function ProfileItem({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4">

            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="font-semibold text-gray-800 mt-1 break-words">
                {value || "N/A"}
            </p>

        </div>
    );
}

export default HospitalManagementADm;
