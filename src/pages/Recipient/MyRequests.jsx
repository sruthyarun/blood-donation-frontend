
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    FaSearch,
    FaHospital,
    FaCalendarAlt,
    FaEye,
    FaTrash,
    FaPlus,
    FaTint,
    FaTimes,
    FaBuilding,
} from "react-icons/fa";

import { toast } from "react-toastify";
import RecipientPanel from "../../components/RecipientPanel";
import API from "../../API/axiosInstance";

function MyRequests() {
    const reduxUser = useSelector(
        (state) => state.user?.currentUser
    );

    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    let storedUser = null;

    try {
        storedUser = JSON.parse(
            localStorage.getItem("loggedInUser") || "null"
        );
    } catch {
        storedUser = null;
    }

    const user =
        reduxUser?.recipient ||
        reduxUser ||
        storedUser?.recipient ||
        storedUser;

    const userId = String(
        user?._id ||
        user?.id ||
        user?.userId ||
        user?.recipientId ||
        ""
    );

    const userEmail = String(user?.email || "")
        .trim()
        .toLowerCase();

    const fetchRequests = useCallback(async () => {
        if (!userId && !userEmail) {
            setRequests([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch only this recipient's requests from the backend.
            const response = await API.get("/bloodRequests", {
                params: userEmail
                    ? { email: userEmail }
                    : { recipientId: userId },
            });

            const result = response.data;

            const allRequests = Array.isArray(result)
                ? result
                : result?.data ||
                result?.requests ||
                [];

            const myRequests = allRequests.filter((request) => {
                const requestId = String(
                    request.recipientId || ""
                );

                const requestEmail = String(
                    request.email || ""
                )
                    .trim()
                    .toLowerCase();

                return (
                    (userId && requestId === userId) ||
                    (userEmail && requestEmail === userEmail)
                );
            });

            setRequests(myRequests);
        } catch (error) {
            console.error(
                "Failed to fetch blood requests:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load your blood requests."
            );
        } finally {
            setLoading(false);
        }
    }, [userId, userEmail]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const getRequestId = (request) =>
        String(request._id || request.id || "");

    const getDestinationType = (request) => {
        if (request.requestToType) {
            return request.requestToType;
        }

        // Older requests may contain only the hospital field.
        return request.hospital ? "Hospital" : "Not specified";
    };

    const getDestinationName = (request) => {
        if (request.requestToName) {
            return request.requestToName;
        }

        if (typeof request.hospital === "string") {
            return request.hospital || "Not specified";
        }

        return (
            request.hospital?.hospitalName ||
            request.hospital?.name ||
            request.hospitalName ||
            "Not specified"
        );
    };

    const deleteRequest = async (request) => {
        const requestId = getRequestId(request);

        if (!requestId) {
            toast.error("Request ID is missing.");
            return;
        }

        if (
            String(request.status || "")
                .trim()
                .toLowerCase() !== "pending"
        ) {
            toast.error("Only pending requests can be deleted.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this blood request?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(requestId);

            // Correct URL: no spaces around the route.
            await API.delete(
                `/bloodRequests/${encodeURIComponent(requestId)}`
            );

            setRequests((previous) =>
                previous.filter(
                    (item) => getRequestId(item) !== requestId
                )
            );

            if (
                selectedRequest &&
                getRequestId(selectedRequest) === requestId
            ) {
                setSelectedRequest(null);
            }

            toast.success("Blood request deleted successfully.");
        } catch (error) {
            console.error(
                "Failed to delete blood request:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to delete the blood request. Check your backend DELETE route."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const filteredRequests = requests.filter((request) => {
        const query = search.trim().toLowerCase();

        if (!query) return true;

        const searchableFields = [
            request.patientName,
            request.recipientName,
            request.bloodGroup,
            getDestinationName(request),
            getDestinationType(request),
            request.status,
            request.priority,
            request.city,
            request.notes,
        ];

        return searchableFields.some((value) =>
            String(value || "")
                .toLowerCase()
                .includes(query)
        );
    });

    const total = requests.length;

    const pending = requests.filter(
        (item) =>
            String(item.status || "").toLowerCase() === "pending"
    ).length;

    const approved = requests.filter(
        (item) =>
            String(item.status || "").toLowerCase() === "approved"
    ).length;

    const completed = requests.filter((item) =>
        ["fulfilled", "completed"].includes(
            String(item.status || "").toLowerCase()
        )
    ).length;

    const getStatusColor = (status) => {
        switch (String(status || "").toLowerCase()) {
            case "approved":
                return "bg-green-100 text-green-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "fulfilled":
            case "completed":
                return "bg-blue-100 text-blue-700";

            case "rejected":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not specified";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <RecipientPanel />

            <main className="flex-1 min-w-0 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            My Blood Requests
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Track requests sent to hospitals and blood banks.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/blood-request")}
                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg shadow"
                        >
                            <FaPlus />
                            New Request
                        </button>

                        <button
                            type="button"
                            onClick={fetchRequests}
                            disabled={loading}
                            className="bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 px-4 py-3 rounded-lg"
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>

                        <div className="flex items-center bg-white rounded-lg shadow px-4 py-3">
                            <FaSearch className="text-gray-500" />

                            <input
                                type="text"
                                placeholder="Search requests..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="ml-2 outline-none min-w-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-5 text-center text-red-600">
                        <h2 className="text-3xl font-bold">{total}</h2>
                        <p>Total Requests</p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-5 text-center text-yellow-600">
                        <h2 className="text-3xl font-bold">{pending}</h2>
                        <p>Pending</p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-5 text-center text-green-600">
                        <h2 className="text-3xl font-bold">{approved}</h2>
                        <p>Approved</p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-5 text-center text-blue-600">
                        <h2 className="text-3xl font-bold">{completed}</h2>
                        <p>Fulfilled</p>
                    </div>
                </div>

                {/* Requests list */}
                <div className="space-y-5">
                    {loading ? (
                        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
                            Loading your blood requests...
                        </div>
                    ) : !userId && !userEmail ? (
                        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
                            Please log in to view your blood requests.
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
                            <FaTint className="mx-auto text-4xl text-gray-300 mb-3" />

                            <p className="font-semibold">
                                No blood requests found.
                            </p>

                            <p className="text-sm mt-2">
                                Your requests to hospitals and blood banks will appear here.
                            </p>
                        </div>
                    ) : (
                        filteredRequests.map((request) => {
                            const requestId = getRequestId(request);
                            const destinationType =
                                getDestinationType(request);
                            const destinationName =
                                getDestinationName(request);

                            return (
                                <div
                                    key={requestId}
                                    className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
                                >
                                    <div className="flex flex-col md:flex-row md:justify-between gap-5">
                                        <div className="space-y-3 min-w-0">
                                            <h2 className="text-xl font-bold text-red-600">
                                                {request.patientName || "Patient"}
                                            </h2>

                                            <p className="flex items-center gap-2 text-gray-700">
                                                {destinationType === "Blood Bank" ? (
                                                    <FaBuilding className="text-red-500 shrink-0" />
                                                ) : (
                                                    <FaHospital className="text-red-500 shrink-0" />
                                                )}

                                                <span className="break-words">
                                                    {destinationName}
                                                </span>
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Request destination:{" "}
                                                <span className="font-semibold text-gray-700">
                                                    {destinationType}
                                                </span>
                                            </p>

                                            <p>
                                                Blood Group:
                                                <span className="ml-2 inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full">
                                                    {request.bloodGroup || "-"}
                                                </span>
                                            </p>

                                            <p>
                                                Units Required: {request.units ?? "-"}
                                            </p>

                                            <p className="flex items-center gap-2 text-gray-700">
                                                <FaCalendarAlt className="text-red-500" />
                                                {formatDate(request.requiredDate)}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Priority: {request.priority || "-"}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Submitted:{" "}
                                                {formatDate(request.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
                                            <span
                                                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap ${getStatusColor(request.status)}`}
                                            >
                                                {request.status || "Pending"}
                                            </span>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRequest(request)
                                                    }
                                                    title="View details"
                                                    aria-label="View request details"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
                                                >
                                                    <FaEye />
                                                </button>

                                                {String(request.status || "")
                                                    .toLowerCase() === "pending" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteRequest(request)
                                                            }
                                                            disabled={
                                                                deletingId === requestId
                                                            }
                                                            title="Delete request"
                                                            aria-label="Delete blood request"
                                                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-3 rounded-lg"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Request details modal */}
                {selectedRequest && (
                    <div
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                        onClick={(event) => {
                            if (event.target === event.currentTarget) {
                                setSelectedRequest(null);
                            }
                        }}
                    >
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex items-center justify-between gap-3 mb-5">
                                <h2 className="text-2xl font-bold text-red-700">
                                    Blood Request Details
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="text-gray-500 hover:text-gray-800 p-2"
                                    aria-label="Close details"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-3 text-gray-700">
                                <p>
                                    <strong>Patient:</strong>{" "}
                                    {selectedRequest.patientName || "-"}
                                </p>

                                <p>
                                    <strong>Blood group:</strong>{" "}
                                    {selectedRequest.bloodGroup || "-"}
                                </p>

                                <p>
                                    <strong>Units:</strong>{" "}
                                    {selectedRequest.units ?? "-"}
                                </p>

                                <p>
                                    <strong>Request sent to:</strong>{" "}
                                    {getDestinationType(selectedRequest)}
                                </p>

                                <p>
                                    <strong>Destination:</strong>{" "}
                                    {getDestinationName(selectedRequest)}
                                </p>

                                <p>
                                    <strong>Required date:</strong>{" "}
                                    {formatDate(selectedRequest.requiredDate)}
                                </p>

                                <p>
                                    <strong>Priority:</strong>{" "}
                                    {selectedRequest.priority || "-"}
                                </p>

                                <p>
                                    <strong>Status:</strong>{" "}
                                    {selectedRequest.status || "Pending"}
                                </p>

                                <p>
                                    <strong>Contact:</strong>{" "}
                                    {selectedRequest.phone || "-"}
                                </p>

                                <p className="break-words">
                                    <strong>Email:</strong>{" "}
                                    {selectedRequest.email || "-"}
                                </p>

                                <p>
                                    <strong>Notes:</strong>{" "}
                                    {selectedRequest.notes || "None"}
                                </p>
                            </div>

                            {String(selectedRequest.status || "")
                                .toLowerCase() === "pending" && (
                                    <button
                                        type="button"
                                        onClick={() => deleteRequest(selectedRequest)}
                                        disabled={
                                            deletingId === getRequestId(selectedRequest)
                                        }
                                        className="mt-6 w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg"
                                    >
                                        {deletingId === getRequestId(selectedRequest)
                                            ? "Deleting..."
                                            : "Delete Request"}
                                    </button>
                                )}

                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
                                className="mt-3 w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyRequests;
