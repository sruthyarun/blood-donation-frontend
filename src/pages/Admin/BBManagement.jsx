

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
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";

const API_URL =
    "https://blood-donation-backend-olwl.onrender.com/api/bloodBanks";

// MongoDB ID helper
const getBbankId = (bbank) => bbank?._id || bbank?.id;

// Handle different API response formats
const extractBbanks = (data) => {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.bloodBanks)) {
        return data.bloodBanks;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.data?.bloodBanks)) {
        return data.data.bloodBanks;
    }

    return [];
};

function BBManagementADm() {
    const [bbanks, setBbanks] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedBbank, setSelectedBbank] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBbanks();
    }, []);

    // Fetch blood banks
    const fetchBbanks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            const data = extractBbanks(response.data);

            setBbanks(data);
        } catch (error) {
            console.error(
                "Error fetching blood banks:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load blood banks. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Search
    const filteredBbanks = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return bbanks.filter((bbank) => {
            const searchableFields = [
                bbank.bloodBankName,
                bbank.bankName,
                bbank.email,
                bbank.phone,
                bbank.city,
                bbank.district,
                bbank.registrationNumber,
                bbank.licenseNumber,
                bbank.status,
            ];

            return searchableFields.some((field) =>
                String(field || "")
                    .toLowerCase()
                    .includes(searchValue)
            );
        });
    }, [bbanks, search]);

    // Statistics
    const totalBbanks = bbanks.length;

    const approvedCount = bbanks.filter(
        (bbank) => bbank.status?.toLowerCase() === "approved"
    ).length;

    const pendingCount = bbanks.filter(
        (bbank) => bbank.status?.toLowerCase() === "pending"
    ).length;

    const rejectedCount = bbanks.filter(
        (bbank) => bbank.status?.toLowerCase() === "rejected"
    ).length;

    const blockedCount = bbanks.filter(
        (bbank) => bbank.status?.toLowerCase() === "blocked"
    ).length;

    // Update status
    const updateStatus = async (id, status) => {
        try {
            if (!id) {
                alert("Blood bank ID is missing.");
                return;
            }

            // PATCH updates only the status field
            await axios.patch(`${API_URL}/${id}`, {
                status,
            });

            // Update local list
            setBbanks((previous) =>
                previous.map((bbank) =>
                    getBbankId(bbank) === id
                        ? { ...bbank, status }
                        : bbank
                )
            );

            // Update opened profile
            setSelectedBbank((previous) =>
                previous && getBbankId(previous) === id
                    ? { ...previous, status }
                    : previous
            );
        } catch (error) {
            console.error(
                "Error updating blood bank:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Unable to update blood bank status."
            );
        }
    };

    // Delete blood bank
    const deleteBbank = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this blood bank?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`${API_URL}/${id}`);

            setBbanks((previous) =>
                previous.filter(
                    (bbank) => getBbankId(bbank) !== id
                )
            );

            if (
                selectedBbank &&
                getBbankId(selectedBbank) === id
            ) {
                setSelectedBbank(null);
            }

            alert("Blood bank deleted successfully.");
        } catch (error) {
            console.error(
                "Error deleting blood bank:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete blood bank."
            );
        }
    };

    // Status colors
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
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

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <div className="min-h-screen bg-gray-100 p-5 md:p-8 flex-1">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Blood Bank Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage registered blood banks and
                            registration requests.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="flex items-center bg-white shadow rounded-lg px-4 py-3 w-full md:w-80">

                        <FaSearch className="text-gray-500" />

                        <input
                            type="text"
                            placeholder="Search blood bank..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="ml-2 outline-none w-full"
                        />

                    </div>

                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

                    <StatCard
                        title="Total Blood Banks"
                        count={totalBbanks}
                        color="border-red-600"
                        textColor="text-red-600"
                    />

                    <StatCard
                        title="Approved"
                        count={approvedCount}
                        color="border-green-600"
                        textColor="text-green-600"
                    />

                    <StatCard
                        title="Pending"
                        count={pendingCount}
                        color="border-yellow-500"
                        textColor="text-yellow-600"
                    />

                    <StatCard
                        title="Rejected"
                        count={rejectedCount}
                        color="border-red-500"
                        textColor="text-red-500"
                    />

                    <StatCard
                        title="Blocked"
                        count={blockedCount}
                        color="border-gray-600"
                        textColor="text-gray-600"
                    />

                </div>

                {/* Blood Bank List */}
                <div className="space-y-4">

                    {loading ? (

                        <div className="bg-white rounded-xl shadow p-10 text-center">
                            <p className="text-gray-500">
                                Loading blood banks...
                            </p>
                        </div>

                    ) : error ? (

                        <div className="bg-white rounded-xl shadow p-10 text-center">

                            <p className="text-red-600 mb-4">
                                {error}
                            </p>

                            <button
                                onClick={fetchBbanks}
                                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                            >
                                Try Again
                            </button>

                        </div>

                    ) : filteredBbanks.length === 0 ? (

                        <div className="bg-white rounded-xl shadow p-10 text-center">

                            <FaHospital className="mx-auto text-gray-300 text-5xl mb-3" />

                            <p className="text-gray-500">
                                No blood banks found.
                            </p>

                        </div>

                    ) : (

                        filteredBbanks.map((bbank) => {
                            const id = getBbankId(bbank);

                            return (
                                <div
                                    key={id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5"
                                >

                                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                                        {/* Blood Bank Details */}
                                        <div className="flex items-center gap-4 flex-1">

                                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                <FaHospital className="text-red-600 text-2xl" />
                                            </div>

                                            <div>

                                                <h2 className="text-lg font-bold text-gray-800">
                                                    {bbank.bloodBankName ||
                                                        bbank.bankName ||
                                                        "Unknown Blood Bank"}
                                                </h2>

                                                <p className="text-sm text-gray-500">
                                                    Blood Bank ID: {id}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    {bbank.email || "No email"}
                                                </p>

                                                <div className="flex flex-wrap gap-3 mt-2 text-sm">

                                                    <span className="flex items-center gap-1">
                                                        <FaPhoneAlt className="text-red-600" />
                                                        {bbank.phone || "N/A"}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <FaMapMarkerAlt className="text-red-600" />
                                                        {bbank.city ||
                                                            bbank.district ||
                                                            "N/A"}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-3">

                                            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">
                                                <FaBuilding className="inline mr-1" />
                                                Blood Bank
                                            </span>

                                            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                                                License: {bbank.registrationNumber ||
                                                    bbank.licenseNumber ||
                                                    "N/A"}
                                            </span>

                                            <span
                                                className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                                                    bbank.status
                                                )}`}
                                            >
                                                {bbank.status || "Pending"}
                                            </span>

                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end w-full xl:w-auto">

                                            <div className="flex items-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        setSelectedBbank(bbank)
                                                    }
                                                    title="View Profile"
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                                >
                                                    <FaEye />
                                                </button>

                                                {bbank.status?.toLowerCase() === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                updateStatus(id, "Approved")
                                                            }
                                                            title="Approve Blood Bank"
                                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                                        >
                                                            <FaCheck />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                updateStatus(id, "Rejected")
                                                            }
                                                            title="Reject Blood Bank"
                                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </>
                                                )}

                                                {bbank.status?.toLowerCase() === "approved" && (
                                                    <button
                                                        onClick={() =>
                                                            updateStatus(id, "Blocked")
                                                        }
                                                        title="Block Blood Bank"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white transition"
                                                    >
                                                        <FaBan />
                                                    </button>
                                                )}

                                                {bbank.status?.toLowerCase() === "blocked" && (
                                                    <button
                                                        onClick={() =>
                                                            updateStatus(id, "Approved")
                                                        }
                                                        title="Unblock Blood Bank"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() =>
                                                        deleteBbank(id)
                                                    }
                                                    title="Delete Blood Bank"
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                                                >
                                                    <FaTrash />
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            );
                        })

                    )}

                </div>

            </div>

            {/* Blood Bank Profile Modal */}
            {selectedBbank && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b">

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Blood Bank Profile
                                </h2>

                                <p className="text-gray-500 text-sm">
                                    Blood Bank ID: {getBbankId(selectedBbank)}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedBbank(null)}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600"
                            >
                                <FaTimesCircle />
                            </button>

                        </div>

                        {/* Modal Body */}
                        <div className="p-6">

                            <div className="flex items-center gap-4 mb-6">

                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                    <FaHospital className="text-red-600 text-3xl" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {selectedBbank.bloodBankName ||
                                            selectedBbank.bankName ||
                                            "Blood Bank"}
                                    </h3>

                                    <p className="text-gray-500">
                                        {selectedBbank.email || "No email"}
                                    </p>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <ProfileItem
                                    label="Blood Bank Name"
                                    value={selectedBbank.bloodBankName ||
                                        selectedBbank.bankName}
                                />

                                <ProfileItem
                                    label="Manager / Contact Person"
                                    value={selectedBbank.managerName ||
                                        selectedBbank.contactPerson}
                                />

                                <ProfileItem
                                    label="Phone"
                                    value={selectedBbank.phone}
                                />

                                <ProfileItem
                                    label="Email"
                                    value={selectedBbank.email}
                                />

                                <ProfileItem
                                    label="Registration / License Number"
                                    value={selectedBbank.registrationNumber ||
                                        selectedBbank.licenseNumber}
                                />

                                <ProfileItem
                                    label="City"
                                    value={selectedBbank.city}
                                />

                                <ProfileItem
                                    label="District"
                                    value={selectedBbank.district}
                                />

                                <ProfileItem
                                    label="State"
                                    value={selectedBbank.state}
                                />

                                <ProfileItem
                                    label="Pincode"
                                    value={selectedBbank.pincode}
                                />

                            </div>

                            <div className="mt-4">
                                <ProfileItem
                                    label="Address"
                                    value={selectedBbank.address}
                                />
                            </div>

                            {/* Registration Status */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">

                                <p className="text-sm text-gray-500 mb-2">
                                    Registration Status
                                </p>

                                <span
                                    className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                                        selectedBbank.status
                                    )}`}
                                >
                                    {selectedBbank.status || "Pending"}
                                </span>

                            </div>

                            {/* Modal Actions */}
                            <div className="flex flex-wrap gap-3 mt-6">

                                {selectedBbank.status?.toLowerCase() === "pending" && (
                                    <>
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    getBbankId(selectedBbank),
                                                    "Approved"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            <FaCheck />
                                            Approve
                                        </button>

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    getBbankId(selectedBbank),
                                                    "Rejected"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                                        >
                                            <FaTimes />
                                            Reject
                                        </button>
                                    </>
                                )}

                                {selectedBbank.status?.toLowerCase() === "approved" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                getBbankId(selectedBbank),
                                                "Blocked"
                                            )
                                        }
                                        className="flex items-center gap-2 bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600"
                                    >
                                        <FaBan />
                                        Block
                                    </button>
                                )}

                                {selectedBbank.status?.toLowerCase() === "blocked" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                getBbankId(selectedBbank),
                                                "Approved"
                                            )
                                        }
                                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                                    >
                                        <FaCheck />
                                        Unblock
                                    </button>
                                )}

                                <button
                                    onClick={() =>
                                        deleteBbank(
                                            getBbankId(selectedBbank)
                                        )
                                    }
                                    className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
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
function StatCard({ title, count, color, textColor }) {
    return (
        <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color}`}>
            <h2 className="text-gray-500">
                {title}
            </h2>

            <p className={`text-4xl font-bold mt-2 ${textColor}`}>
                {count}
            </p>
        </div>
    );
}

// Profile item
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

export default BBManagementADm;
