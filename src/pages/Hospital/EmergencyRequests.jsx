
import { useCallback, useEffect, useState } from "react";
import {
    FaPlus,
    FaSearch,
    FaTint,
    FaHospital,
    FaMapMarkerAlt,
    FaPhone,
    FaTrash,
    FaClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import HospitalPanel from "../../components/HospitalPanel";
import axiosInstance from "../../API/axiosInstance";

function ViewEmergencyRequests() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Get logged-in hospital from localStorage.
    const hospital = (() => {
        try {
            const storedUser = JSON.parse(
                localStorage.getItem("loggedInUser") || "null"
            );

            return storedUser?.hospital || storedUser;
        } catch {
            return null;
        }
    })();

    const hospitalEmail = (hospital?.email || "")
        .trim()
        .toLowerCase();

    // Extract arrays from common backend response formats.
    const extractRequests = (responseData) => {
        if (Array.isArray(responseData)) {
            return responseData;
        }

        if (Array.isArray(responseData?.data)) {
            return responseData.data;
        }

        if (Array.isArray(responseData?.emergencyRequests)) {
            return responseData.emergencyRequests;
        }

        if (Array.isArray(responseData?.requests)) {
            return responseData.requests;
        }

        return null;
    };

    // Load emergency requests from MongoDB.
    const loadRequests = useCallback(async () => {
        if (!hospitalEmail) {
            setRequests([]);
            setError("Hospital email not found. Please log in again.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                "/emergencyRequests",
                {
                    params: {
                        email: hospitalEmail,
                    },
                }
            );

            const data = extractRequests(response.data);

            if (!data) {
                throw new Error(
                    "Invalid emergency requests response from server."
                );
            }

            // Display requests associated with this hospital.
            // The request email should contain the hospital email.
            const hospitalRequests = data.filter((item) => {
                const requestEmail = (item.email || "")
                    .trim()
                    .toLowerCase();

                const requestHospital = (item.hospital || "")
                    .trim()
                    .toLowerCase();

                const hospitalName = (
                    hospital?.hospitalName ||
                    hospital?.name ||
                    ""
                )
                    .trim()
                    .toLowerCase();

                return (
                    requestEmail === hospitalEmail ||
                    (hospitalName &&
                        requestHospital === hospitalName)
                );
            });

            hospitalRequests.sort(
                (a, b) =>
                    new Date(b.createdAt || 0).getTime() -
                    new Date(a.createdAt || 0).getTime()
            );

            setRequests(hospitalRequests);
        } catch (err) {
            console.error(
                "Failed to load emergency requests:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load emergency requests."
            );
        } finally {
            setLoading(false);
        }
    }, [hospitalEmail, hospital?.hospitalName, hospital?.name]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    // Delete an emergency request.
    const deleteRequest = async (request) => {
        const requestId = request._id || request.id;

        if (!requestId) {
            setError("Emergency request ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this emergency request?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(requestId);
            setError("");
            setSuccess("");

            // Correct DELETE endpoint: no spaces in the URL.
            await axiosInstance.delete(
                `/emergencyRequests/${requestId}`
            );

            setRequests((previous) =>
                previous.filter(
                    (item) =>
                        String(item._id || item.id) !==
                        String(requestId)
                )
            );

            setSuccess("Emergency request deleted successfully.");
        } catch (err) {
            console.error(
                "Failed to delete emergency request:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete emergency request. Check the backend DELETE route."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // Search by patient name, blood group, or district.
    const query = search.trim().toLowerCase();

    const filtered = requests.filter((item) => {
        return (
            (item.patientName || "").toLowerCase().includes(query) ||
            (item.bloodGroup || "").toLowerCase().includes(query) ||
            (item.district || "").toLowerCase().includes(query) ||
            (item.hospital || "").toLowerCase().includes(query)
        );
    });

    // Summary counts.
    const activeCount = filtered.filter(
        (item) => (item.status || "").toLowerCase() === "active"
    ).length;

    const completedCount = filtered.filter(
        (item) => (item.status || "").toLowerCase() === "completed"
    ).length;

    // Format MongoDB creation date.
    const formatDate = (date) => {
        if (!date) return "Date not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Date not available";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusClass = (status) => {
        switch ((status || "").toLowerCase()) {
            case "active":
                return "bg-red-100 text-red-700";
            case "completed":
                return "bg-green-100 text-green-700";
            case "cancelled":
                return "bg-gray-200 text-gray-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <HospitalPanel />

            <main className="min-w-0 flex-1 p-4 md:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Emergency Requests
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Manage emergency blood requests
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/new-emergency")}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-white transition hover:bg-red-700"
                    >
                        <FaPlus />
                        New Request
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg bg-red-100 p-4 text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div
                        role="status"
                        className="mb-5 rounded-lg bg-green-100 p-4 text-green-700"
                    >
                        {success}
                    </div>
                )}

                {/* Search */}
                <div className="mb-8 flex items-center rounded-lg bg-white px-4 py-3 shadow">
                    <FaSearch className="shrink-0 text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search by patient, blood group, district, or hospital..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="ml-3 w-full bg-transparent outline-none"
                    />
                </div>

                {/* Summary cards */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl bg-white p-6 text-center shadow">
                        <h2 className="text-4xl font-bold text-red-600">
                            {filtered.length}
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Total Requests
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 text-center shadow">
                        <h2 className="text-4xl font-bold text-green-600">
                            {activeCount}
                        </h2>
                        <p className="mt-2 text-gray-600">Active</p>
                    </div>

                    <div className="rounded-xl bg-white p-6 text-center shadow">
                        <h2 className="text-4xl font-bold text-blue-600">
                            {completedCount}
                        </h2>
                        <p className="mt-2 text-gray-600">Completed</p>
                    </div>
                </div>

                {/* Request list */}
                {loading ? (
                    <div className="rounded-xl bg-white p-10 text-center shadow">
                        <p className="text-gray-600">
                            Loading emergency requests...
                        </p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {filtered.map((item) => {
                            const requestId = item._id || item.id;
                            const isDeleting =
                                String(deletingId) === String(requestId);

                            return (
                                <article
                                    key={requestId}
                                    className="rounded-xl bg-white p-6 shadow-lg"
                                >
                                    {/* Patient and status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="break-words text-xl font-bold text-red-600">
                                            {item.patientName ||
                                                "Patient name unavailable"}
                                        </h2>

                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-sm ${getStatusClass(
                                                item.status
                                            )}`}
                                        >
                                            {item.status || "Active"}
                                        </span>
                                    </div>

                                    {/* Request details */}
                                    <div className="mt-5 space-y-3 text-gray-700">
                                        <p className="flex items-center gap-2">
                                            <FaTint className="shrink-0 text-red-600" />
                                            <span>
                                                Blood Group:{" "}
                                                <b>{item.bloodGroup || "N/A"}</b>
                                            </span>
                                        </p>

                                        <p>
                                            Units: <b>{item.units ?? "N/A"}</b>
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <FaHospital className="shrink-0" />
                                            <span>
                                                {item.hospital ||
                                                    "Hospital not specified"}
                                            </span>
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="shrink-0" />
                                            <span>
                                                {item.district ||
                                                    "District not specified"}
                                            </span>
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <FaPhone className="shrink-0" />
                                            <span>
                                                {item.contact ||
                                                    "Contact not specified"}
                                            </span>
                                        </p>

                                        <p className="break-words">
                                            <b>Reason:</b>{" "}
                                            {item.reason || "Not specified"}
                                        </p>

                                        <p className="flex items-center gap-2 text-sm text-gray-500">
                                            <FaClock className="shrink-0" />
                                            <span>
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Delete button */}
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={() => deleteRequest(item)}
                                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <FaTrash />
                                            {isDeleting
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl bg-white p-10 text-center shadow">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            No Emergency Requests Found
                        </h2>

                        <p className="mt-2 text-gray-500">
                            {search
                                ? "Try a different search term."
                                : "Emergency requests associated with your hospital will appear here."}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                onClick={loadRequests}
                                className="mt-5 rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
                            >
                                Refresh Requests
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default ViewEmergencyRequests;
