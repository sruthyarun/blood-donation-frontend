
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    FaSearch,
    FaUser,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaEye,
    FaCheck,
    FaBan,
    FaTrash,
    FaTint,
    FaTimes,
    FaSyncAlt,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";

const API_URL =
    "https://blood-donation-backend-olwl.onrender.com/api/donors";

function getDonorId(donor) {
    return donor?._id || donor?.id;
}

function extractDonors(data) {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.donors)) return data.donors;

    if (Array.isArray(data?.data)) return data.data;

    if (Array.isArray(data?.data?.donors)) {
        return data.data.donors;
    }

    return [];
}

function DonorManagementADm() {
    const [donors, setDonors] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedDonor, setSelectedDonor] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDonors();
    }, []);

    // Fetch all donors
    const fetchDonors = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            const donorList = extractDonors(response.data);

            setDonors(donorList);

            // Refresh selected donor data if modal is open
            setSelectedDonor((previous) => {
                if (!previous) return null;

                const updated = donorList.find(
                    (item) =>
                        getDonorId(item) === getDonorId(previous)
                );

                return updated || null;
            });
        } catch (error) {
            console.error(
                "Error fetching donors:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load donors. Please try again."
            );

            setDonors([]);
        } finally {
            setLoading(false);
        }
    };

    // Search donors
    const filteredDonors = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        if (!searchValue) return donors;

        return donors.filter((donor) =>
            [
                donor.fullName,
                donor.name,
                donor.email,
                donor.bloodGroup,
                donor.phone,
                donor.city,
                donor.district,
                donor.status,
            ].some((value) =>
                String(value || "")
                    .toLowerCase()
                    .includes(searchValue)
            )
        );
    }, [donors, search]);

    // Statistics
    const totalDonors = donors.length;

    const approvedCount = donors.filter(
        (donor) =>
            String(donor.status || "").toLowerCase() === "approved"
    ).length;

    const pendingCount = donors.filter(
        (donor) =>
            String(donor.status || "").toLowerCase() === "pending"
    ).length;

    const blockedCount = donors.filter(
        (donor) =>
            String(donor.status || "").toLowerCase() === "blocked"
    ).length;

    const eligibleCount = donors.filter(
        (donor) =>
            String(donor.eligibility || "").toLowerCase() === "eligible"
    ).length;

    // Update donor status
    const updateStatus = async (id, status) => {
        if (!id) {
            alert("Donor ID not found.");
            return;
        }

        try {
            setActionLoading(true);

            // Update only the status field
            await axios.patch(`${API_URL}/${id}`, {
                status,
            });

            setDonors((previous) =>
                previous.map((donor) =>
                    getDonorId(donor) === id
                        ? { ...donor, status }
                        : donor
                )
            );

            setSelectedDonor((previous) =>
                previous && getDonorId(previous) === id
                    ? { ...previous, status }
                    : previous
            );

            alert(`Donor ${status.toLowerCase()} successfully!`);
        } catch (error) {
            console.error(
                "Error updating donor status:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to update donor status."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // Delete donor
    const deleteDonor = async (id) => {
        if (!id) {
            alert("Donor ID not found.");
            return;
        }

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this donor?"
        );

        if (!confirmDelete) return;

        try {
            setActionLoading(true);

            await axios.delete(`${API_URL}/${id}`);

            setDonors((previous) =>
                previous.filter(
                    (donor) => getDonorId(donor) !== id
                )
            );

            setSelectedDonor((previous) =>
                previous && getDonorId(previous) === id
                    ? null
                    : previous
            );

            alert("Donor deleted successfully!");
        } catch (error) {
            console.error(
                "Error deleting donor:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete donor."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const viewDonor = (donor) => {
        setSelectedDonor(donor);
    };

    const getStatusStyle = (status) => {
        const normalized = String(status || "Pending").toLowerCase();

        if (normalized === "approved") {
            return "bg-green-100 text-green-700";
        }

        if (normalized === "pending") {
            return "bg-yellow-100 text-yellow-700";
        }

        if (normalized === "blocked") {
            return "bg-red-100 text-red-700";
        }

        return "bg-gray-100 text-gray-700";
    };

    const formatDate = (value) => {
        if (!value) return "Never";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <main className="min-h-screen p-4 md:p-8 flex-1 min-w-0">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Donor Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage all registered blood donors.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="flex items-center bg-white rounded-lg shadow px-4 py-3 w-full md:w-80">

                        <FaSearch className="text-gray-500" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search donor..."
                            className="ml-2 outline-none w-full"
                        />

                    </div>

                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

                    <StatCard
                        title="Total Donors"
                        count={totalDonors}
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
                        title="Eligible"
                        count={eligibleCount}
                        color="blue"
                    />

                    <StatCard
                        title="Blocked"
                        count={blockedCount}
                        color="gray"
                    />

                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 flex justify-between items-center gap-3">
                        <span>{error}</span>

                        <button
                            onClick={fetchDonors}
                            className="font-semibold underline shrink-0"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Donor list */}
                <div className="space-y-4">

                    {loading ? (

                        <div className="bg-white rounded-xl p-10 text-center">
                            <FaSyncAlt className="animate-spin text-red-600 text-3xl mx-auto mb-3" />

                            <p className="text-gray-500">
                                Loading donors...
                            </p>
                        </div>

                    ) : filteredDonors.length === 0 ? (

                        <div className="bg-white rounded-xl p-10 text-center">
                            <FaUser className="mx-auto text-gray-300 text-5xl mb-3" />

                            <p className="text-gray-500">
                                No donors found.
                            </p>
                        </div>

                    ) : (

                        filteredDonors.map((donor) => {
                            const id = getDonorId(donor);

                            const status = donor.status || "Pending";

                            return (
                                <div
                                    key={id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5"
                                >

                                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                                        {/* Donor information */}
                                        <div className="flex items-center gap-4 min-w-0">

                                            <div className="w-16 h-16 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                                                <FaUser className="text-red-600 text-2xl" />
                                            </div>

                                            <div className="min-w-0">

                                                <h2 className="text-lg font-bold text-gray-800">
                                                    {donor.fullName || donor.name || "Unknown Donor"}
                                                </h2>

                                                <p className="text-sm text-gray-500 break-all">
                                                    Donor ID: {id}
                                                </p>

                                                <p className="text-sm text-gray-500 break-all">
                                                    {donor.email}
                                                </p>

                                                <div className="flex flex-wrap gap-3 mt-2 text-sm">

                                                    <span className="flex items-center gap-1">
                                                        <FaPhoneAlt className="text-red-600" />
                                                        {donor.phone || "N/A"}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <FaMapMarkerAlt className="text-red-600" />
                                                        {donor.city || donor.district || "N/A"}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <FaCalendarAlt className="text-red-600" />
                                                        Last Donation: {formatDate(donor.lastDonation)}
                                                    </span>

                                                </div>

                                            </div>
                                        </div>

                                        {/* Status information */}
                                        <div className="flex flex-wrap gap-2">

                                            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">
                                                <FaTint className="inline mr-1" />
                                                {donor.bloodGroup || "N/A"}
                                            </span>

                                            <span
                                                className={`px-4 py-2 rounded-full font-semibold ${donor.eligibility === "Eligible"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {donor.eligibility || "Not Checked"}
                                            </span>

                                            <span
                                                className={`px-4 py-2 rounded-full font-semibold ${getStatusStyle(status)}`}
                                            >
                                                {status}
                                            </span>

                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-2">

                                            <button
                                                onClick={() => viewDonor(donor)}
                                                disabled={actionLoading}
                                                title="View Profile"
                                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 transition"
                                            >
                                                <FaEye />
                                            </button>

                                            {status === "Pending" && (
                                                <button
                                                    onClick={() => updateStatus(id, "Approved")}
                                                    disabled={actionLoading}
                                                    title="Approve Donor"
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 transition"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}

                                            {status !== "Blocked" && (
                                                <button
                                                    onClick={() => updateStatus(id, "Blocked")}
                                                    disabled={actionLoading}
                                                    title="Block Donor"
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white disabled:opacity-50 transition"
                                                >
                                                    <FaBan />
                                                </button>
                                            )}

                                            {status === "Blocked" && (
                                                <button
                                                    onClick={() => updateStatus(id, "Approved")}
                                                    disabled={actionLoading}
                                                    title="Unblock Donor"
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 transition"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => deleteDonor(id)}
                                                disabled={actionLoading}
                                                title="Delete Donor"
                                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 transition"
                                            >
                                                <FaTrash />
                                            </button>

                                        </div>

                                    </div>
                                </div>
                            );
                        })
                    )}

                </div>

            </main>

            {/* Donor profile modal */}
            {selectedDonor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        {/* Modal header */}
                        <div className="flex justify-between items-center p-6 border-b">

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Donor Profile
                                </h2>

                                <p className="text-gray-500 text-sm break-all">
                                    Donor ID: {getDonorId(selectedDonor)}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedDonor(null)}
                                className="w-10 h-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div className="p-6">

                            {/* Donor heading */}
                            <div className="flex items-center gap-4 mb-6">

                                <div className="w-20 h-20 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                                    <FaUser className="text-red-600 text-3xl" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                                        {selectedDonor.fullName || selectedDonor.name}
                                    </h3>

                                    <p className="text-gray-500 break-all">
                                        {selectedDonor.email}
                                    </p>
                                </div>

                            </div>

                            {/* Profile details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <ProfileItem
                                    label="Phone"
                                    value={selectedDonor.phone}
                                />

                                <ProfileItem
                                    label="Blood Group"
                                    value={selectedDonor.bloodGroup}
                                />

                                <ProfileItem
                                    label="Gender"
                                    value={selectedDonor.gender}
                                />

                                <ProfileItem
                                    label="Date of Birth"
                                    value={formatDate(selectedDonor.dob)}
                                />

                                <ProfileItem
                                    label="Weight"
                                    value={
                                        selectedDonor.weight
                                            ? `${selectedDonor.weight} kg`
                                            : "N/A"
                                    }
                                />

                                <ProfileItem
                                    label="Last Donation"
                                    value={formatDate(selectedDonor.lastDonation)}
                                />

                                <ProfileItem
                                    label="City"
                                    value={selectedDonor.city}
                                />

                                <ProfileItem
                                    label="District"
                                    value={selectedDonor.district}
                                />

                                <ProfileItem
                                    label="State"
                                    value={selectedDonor.state}
                                />

                                <ProfileItem
                                    label="Pincode"
                                    value={selectedDonor.pincode}
                                />

                                <ProfileItem
                                    label="Eligibility"
                                    value={selectedDonor.eligibility || "Not Checked"}
                                />

                                <ProfileItem
                                    label="Availability"
                                    value={selectedDonor.availability || "Not Available"}
                                />

                            </div>

                            {/* Account status */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">

                                <p className="text-sm text-gray-500 mb-2">
                                    Account Status
                                </p>

                                <span
                                    className={`px-4 py-2 rounded-full font-semibold ${getStatusStyle(selectedDonor.status)}`}
                                >
                                    {selectedDonor.status || "Pending"}
                                </span>

                            </div>

                            {/* Modal actions */}
                            <div className="flex flex-wrap gap-3 mt-6">

                                {selectedDonor.status === "Pending" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                getDonorId(selectedDonor),
                                                "Approved"
                                            )
                                        }
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <FaCheck />
                                        Approve
                                    </button>
                                )}

                                {selectedDonor.status !== "Blocked" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                getDonorId(selectedDonor),
                                                "Blocked"
                                            )
                                        }
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                                    >
                                        <FaBan />
                                        Block
                                    </button>
                                )}

                                {selectedDonor.status === "Blocked" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                getDonorId(selectedDonor),
                                                "Approved"
                                            )
                                        }
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <FaCheck />
                                        Unblock
                                    </button>
                                )}

                                <button
                                    onClick={() =>
                                        deleteDonor(getDonorId(selectedDonor))
                                    }
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    <FaTrash />
                                    Delete
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// Statistics card
function StatCard({ title, count, color }) {
    const colors = {
        red: "border-red-600 text-red-600",
        green: "border-green-600 text-green-600",
        yellow: "border-yellow-500 text-yellow-600",
        blue: "border-blue-600 text-blue-600",
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

// Profile detail item
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

export default DonorManagementADm;
