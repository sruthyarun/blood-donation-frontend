

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
    FaProcedures,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";

const API_URL =
    "https://blood-donation-backend-olwl.onrender.com/api/recipients";

const getRecipientId = (recipient) =>
    recipient?._id || recipient?.id;

const extractRecipients = (data) => {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.recipients)) {
        return data.recipients;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.data?.recipients)) {
        return data.data.recipients;
    }

    return [];
};

const normalizeStatus = (status) =>
    String(status || "Pending").trim().toLowerCase();

function RecipientManagementADm() {
    const [recipients, setRecipients] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch recipients
    const fetchRecipients = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            const recipientList = extractRecipients(response.data);

            setRecipients(recipientList);

        } catch (err) {
            console.error(
                "Error fetching recipients:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Unable to load recipients. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipients();
    }, []);

    // Search recipients
    const filteredRecipients = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        if (!searchValue) return recipients;

        return recipients.filter((recipient) => {
            const fields = [
                recipient.fullName,
                recipient.name,
                recipient.email,
                recipient.bloodGroup,
                recipient.phone,
                recipient.city,
                recipient.district,
                recipient.patientName,
                recipient.status,
            ];

            return fields.some((field) =>
                String(field || "")
                    .toLowerCase()
                    .includes(searchValue)
            );
        });
    }, [recipients, search]);

    // Statistics
    const totalRecipients = recipients.length;

    const approvedCount = recipients.filter(
        (recipient) =>
            normalizeStatus(recipient.status) === "approved"
    ).length;

    const pendingCount = recipients.filter(
        (recipient) =>
            normalizeStatus(recipient.status) === "pending"
    ).length;

    const blockedCount = recipients.filter(
        (recipient) =>
            normalizeStatus(recipient.status) === "blocked"
    ).length;

    // Status style
    const getStatusStyle = (status) => {
        switch (normalizeStatus(status)) {
            case "approved":
                return "bg-green-100 text-green-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "blocked":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Update recipient status
    const updateStatus = async (id, status) => {
        if (!id) {
            alert("Recipient ID not found.");
            return;
        }

        try {
            setUpdatingId(id);
            setError("");

            await axios.patch(`${API_URL}/${id}`, {
                status,
            });

            setRecipients((previous) =>
                previous.map((recipient) =>
                    getRecipientId(recipient) === id
                        ? { ...recipient, status }
                        : recipient
                )
            );

            setSelectedRecipient((previous) =>
                previous && getRecipientId(previous) === id
                    ? { ...previous, status }
                    : previous
            );

        } catch (err) {
            console.error(
                "Error updating recipient:",
                err.response?.data || err.message
            );

            alert(
                err.response?.data?.message ||
                "Unable to update recipient status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Delete recipient
    const deleteRecipient = async (id) => {
        if (!id) {
            alert("Recipient ID not found.");
            return;
        }

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this recipient?"
        );

        if (!confirmDelete) return;

        try {
            setDeletingId(id);

            await axios.delete(`${API_URL}/${id}`);

            setRecipients((previous) =>
                previous.filter(
                    (recipient) => getRecipientId(recipient) !== id
                )
            );

            setSelectedRecipient((previous) =>
                previous && getRecipientId(previous) === id
                    ? null
                    : previous
            );

            alert("Recipient deleted successfully.");

        } catch (err) {
            console.error(
                "Error deleting recipient:",
                err.response?.data || err.message
            );

            alert(
                err.response?.data?.message ||
                "Unable to delete recipient."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // Recipient actions
    const renderActions = (recipient) => {
        const id = getRecipientId(recipient);
        const status = normalizeStatus(recipient.status);

        return (
            <div className="flex flex-wrap items-center gap-2">

                <button
                    onClick={() => setSelectedRecipient(recipient)}
                    title="View Recipient"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                >
                    <FaEye />
                </button>

                {status === "pending" && (
                    <button
                        onClick={() => updateStatus(id, "Approved")}
                        disabled={updatingId === id || deletingId === id}
                        title="Approve Recipient"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 transition"
                    >
                        <FaCheck />
                    </button>
                )}

                {status !== "blocked" && (
                    <button
                        onClick={() => updateStatus(id, "Blocked")}
                        disabled={updatingId === id || deletingId === id}
                        title="Block Recipient"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white disabled:opacity-50 transition"
                    >
                        <FaBan />
                    </button>
                )}

                {status === "blocked" && (
                    <button
                        onClick={() => updateStatus(id, "Approved")}
                        disabled={updatingId === id || deletingId === id}
                        title="Unblock Recipient"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 transition"
                    >
                        <FaCheck />
                    </button>
                )}

                <button
                    onClick={() => deleteRecipient(id)}
                    disabled={updatingId === id || deletingId === id}
                    title="Delete Recipient"
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
                            Recipient Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage all registered blood recipients.
                        </p>
                    </div>

                    <div className="flex items-center bg-white rounded-lg shadow px-4 py-3 w-full md:w-80">

                        <FaSearch className="text-gray-500" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search recipient..."
                            className="ml-2 outline-none w-full"
                        />

                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                    <StatCard
                        title="Total Recipients"
                        count={totalRecipients}
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
                            onClick={fetchRecipients}
                            className="font-semibold underline"
                        >
                            Retry
                        </button>

                    </div>
                )}

                {/* Recipient list */}
                <div className="space-y-4">

                    {loading ? (
                        <div className="bg-white rounded-xl p-10 text-center">
                            <p className="text-gray-500">
                                Loading recipients...
                            </p>
                        </div>
                    ) : filteredRecipients.length === 0 ? (
                        <div className="bg-white rounded-xl p-10 text-center">

                            <FaProcedures className="mx-auto text-gray-300 text-5xl mb-3" />

                            <p className="text-gray-500">
                                No recipients found.
                            </p>

                        </div>
                    ) : (
                        filteredRecipients.map((recipient) => {
                            const id = getRecipientId(recipient);

                            return (
                                <div
                                    key={id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5"
                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                        {/* Recipient information */}
                                        <div className="flex items-center gap-4 min-w-0">

                                            <div className="w-16 h-16 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                                                <FaUser className="text-red-600 text-2xl" />
                                            </div>

                                            <div className="min-w-0">

                                                <h2 className="text-lg font-bold text-gray-800">
                                                    {recipient.fullName ||
                                                        recipient.name ||
                                                        "Unknown Recipient"}
                                                </h2>

                                                <p className="text-sm text-gray-500 break-all">
                                                    Recipient ID: {id || "N/A"}
                                                </p>

                                                <p className="text-sm text-gray-500 break-all">
                                                    {recipient.email || "N/A"}
                                                </p>

                                                <div className="flex flex-wrap gap-3 mt-2 text-sm">

                                                    <span className="flex items-center gap-1">
                                                        <FaPhoneAlt className="text-red-600" />
                                                        {recipient.phone || "N/A"}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <FaMapMarkerAlt className="text-red-600" />
                                                        {recipient.city ||
                                                            recipient.district ||
                                                            "N/A"}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <FaCalendarAlt className="text-red-600" />
                                                        Registered: {
                                                            recipient.createdAt
                                                                ? new Date(
                                                                    recipient.createdAt
                                                                ).toLocaleDateString()
                                                                : "N/A"
                                                        }
                                                    </span>

                                                </div>

                                            </div>
                                        </div>

                                        {/* Blood group and status */}
                                        <div className="flex flex-wrap gap-3">

                                            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">
                                                <FaTint className="inline mr-1" />
                                                {recipient.bloodGroup || "N/A"}
                                            </span>

                                            <span
                                                className={`px-4 py-2 rounded-full font-semibold ${getStatusStyle(recipient.status)}`}
                                            >
                                                {recipient.status || "Pending"}
                                            </span>

                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-start lg:justify-end">
                                            {renderActions(recipient)}
                                        </div>

                                    </div>

                                </div>
                            );
                        })
                    )}

                </div>

                {/* Recipient Profile Modal */}
                {selectedRecipient && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedRecipient(null)}
                    >

                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >

                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b">

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Recipient Profile
                                    </h2>

                                    <p className="text-gray-500 text-sm break-all">
                                        Recipient ID: {getRecipientId(selectedRecipient)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedRecipient(null)}
                                    className="w-10 h-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600"
                                >
                                    <FaTimes />
                                </button>

                            </div>

                            {/* Modal Body */}
                            <div className="p-6">

                                <div className="flex items-center gap-4 mb-6">

                                    <div className="w-20 h-20 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                                        <FaUser className="text-red-600 text-3xl" />
                                    </div>

                                    <div className="min-w-0">

                                        <h3 className="text-2xl font-bold text-gray-800">
                                            {selectedRecipient.fullName ||
                                                selectedRecipient.name ||
                                                "Unknown Recipient"}
                                        </h3>

                                        <p className="text-gray-500 break-all">
                                            {selectedRecipient.email || "N/A"}
                                        </p>

                                    </div>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <ProfileItem
                                        label="Phone"
                                        value={selectedRecipient.phone}
                                    />

                                    <ProfileItem
                                        label="Blood Group"
                                        value={selectedRecipient.bloodGroup}
                                    />

                                    <ProfileItem
                                        label="Patient Name"
                                        value={selectedRecipient.patientName}
                                    />

                                    <ProfileItem
                                        label="Gender"
                                        value={selectedRecipient.gender}
                                    />

                                    <ProfileItem
                                        label="Date of Birth"
                                        value={selectedRecipient.dob}
                                    />

                                    <ProfileItem
                                        label="City"
                                        value={selectedRecipient.city}
                                    />

                                    <ProfileItem
                                        label="District"
                                        value={selectedRecipient.district}
                                    />

                                    <ProfileItem
                                        label="State"
                                        value={selectedRecipient.state}
                                    />

                                    <ProfileItem
                                        label="Pincode"
                                        value={selectedRecipient.pincode}
                                    />

                                    <ProfileItem
                                        label="Address"
                                        value={selectedRecipient.address}
                                    />

                                    <ProfileItem
                                        label="Registered Date"
                                        value={
                                            selectedRecipient.createdAt
                                                ? new Date(
                                                    selectedRecipient.createdAt
                                                ).toLocaleDateString()
                                                : "N/A"
                                        }
                                    />

                                </div>

                                {/* Account Status */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-xl">

                                    <p className="text-sm text-gray-500 mb-2">
                                        Account Status
                                    </p>

                                    <span
                                        className={`px-4 py-2 rounded-full font-semibold ${getStatusStyle(selectedRecipient.status)}`}
                                    >
                                        {selectedRecipient.status || "Pending"}
                                    </span>

                                </div>

                                {/* Modal Actions */}
                                <div className="mt-6">
                                    {renderActions(selectedRecipient)}
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

export default RecipientManagementADm;
