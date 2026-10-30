
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
    FaSearch,
    FaCheck,
    FaTimes,
    FaEye,
    FaExclamationTriangle,
    FaHospital,
    FaTint,
    FaClock,
    FaSyncAlt,
    FaCalendarAlt,
    FaPhoneAlt,
    FaEnvelope,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

const extractRequests = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.bloodRequests)) return data.bloodRequests;
    if (Array.isArray(data?.requests)) return data.requests;
    return [];
};

const getPatientName = (item) =>
    item.patientName ||
    item.recipientName ||
    item.patient ||
    "Not provided";

const getHospitalName = (item) =>
    item.hospitalName ||
    item.hospital ||
    "Not provided";

const normalizeStatus = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (["approved", "accepted", "confirmed"].includes(value)) {
        return "Approved";
    }

    if (["rejected", "declined"].includes(value)) {
        return "Rejected";
    }

    if (value === "completed") return "Completed";

    return "Pending";
};

const formatDate = (date) => {
    if (!date) return "N/A";

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

const isEmergencyRequest = (item) =>
    String(item.priority || "").trim().toLowerCase() === "emergency";

function BBEmergencyRequests() {
    const user = useSelector((state) => state.user.currentUser);

    const bloodBankId =
        user?._id ||
        user?.id ||
        user?.bloodBankId ||
        "";

    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Fetch emergency requests for the logged-in Blood Bank.
    const fetchRequests = useCallback(async () => {
        if (!bloodBankId) {
            setRequests([]);
            setError("Blood Bank ID is missing. Please log in again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axiosInstance.get("/bloodRequests", {
                params: { bloodBankId },
            });

            const allRequests = extractRequests(response.data);

            // Only emergency requests appear on this page.
            const emergencyRequests = allRequests.filter(isEmergencyRequest);

            setRequests(emergencyRequests);

            console.log(
                "Emergency requests loaded:",
                emergencyRequests.length
            );
        } catch (err) {
            console.error(
                "Failed to load emergency requests:",
                err.response?.data || err.message
            );

            setRequests([]);
            setError(
                err.response?.data?.message ||
                "Unable to load emergency requests."
            );
        } finally {
            setLoading(false);
        }
    }, [bloodBankId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Search and status filter.
    const filteredRequests = useMemo(() => {
        const query = search.trim().toLowerCase();

        return requests.filter((item) => {
            const matchesSearch = [
                getPatientName(item),
                getHospitalName(item),
                item.bloodGroup,
                item.email,
                item.phone,
                item.priority,
                item.units,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(query)
            );

            const matchesStatus =
                statusFilter === "All" ||
                normalizeStatus(item.status) === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [requests, search, statusFilter]);

    // Summary counts are calculated from actual emergency requests.
    const pendingCount = requests.filter(
        (item) => normalizeStatus(item.status) === "Pending"
    ).length;

    const approvedCount = requests.filter(
        (item) => normalizeStatus(item.status) === "Approved"
    ).length;

    const rejectedCount = requests.filter(
        (item) => normalizeStatus(item.status) === "Rejected"
    ).length;

    const hospitalCount = new Set(
        requests
            .map(getHospitalName)
            .filter((name) => name !== "Not provided")
            .map((name) => name.toLowerCase())
    ).size;

    // Approve or reject a pending emergency request.
    const updateStatus = async (item, newStatus) => {
        const requestId = item._id || item.id;

        if (!requestId) {
            setError("This request does not have a valid database ID.");
            return;
        }

        if (!["Approved", "Rejected"].includes(newStatus)) {
            setError("Invalid request status.");
            return;
        }

        if (normalizeStatus(item.status) !== "Pending") {
            setError("Only pending requests can be approved or rejected.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to ${newStatus.toLowerCase()} this emergency request?`
        );

        if (!confirmed) return;

        setUpdatingId(requestId);
        setError("");
        setSuccess("");

        try {
            const response = await axiosInstance.patch(
                `/bloodRequests/${requestId}`,
                { status: newStatus }
            );

            if (response.data?.success === false) {
                throw new Error(
                    response.data.message || "Unable to update request."
                );
            }

            setRequests((previous) =>
                previous.map((request) =>
                    (request._id || request.id) === requestId
                        ? { ...request, status: newStatus }
                        : request
                )
            );

            setSelectedRequest((previous) =>
                previous &&
                    (previous._id || previous.id) === requestId
                    ? { ...previous, status: newStatus }
                    : previous
            );

            setSuccess(
                response.data?.message ||
                `Emergency request ${newStatus.toLowerCase()} successfully.`
            );
        } catch (err) {
            console.error(
                "Failed to update emergency request:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update the emergency request."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-700";
            case "Rejected":
                return "bg-red-100 text-red-700";
            case "Completed":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 md:flex">
            <BloodBankPanel />

            <main className="min-w-0 flex-1 p-4 md:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Emergency Blood Requests
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Review and manage urgent blood requests from hospitals.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchRequests}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        <FaSyncAlt className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                    >
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
                    >
                        <p>{success}</p>

                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            aria-label="Dismiss success"
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* Summary cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<FaExclamationTriangle />}
                        label="Total Emergency Requests"
                        value={requests.length}
                        color="text-red-600"
                    />

                    <SummaryCard
                        icon={<FaClock />}
                        label="Pending"
                        value={pendingCount}
                        color="text-yellow-600"
                    />

                    <SummaryCard
                        icon={<FaCheck />}
                        label="Approved"
                        value={approvedCount}
                        color="text-green-600"
                    />

                    <SummaryCard
                        icon={<FaHospital />}
                        label="Hospitals"
                        value={hospitalCount}
                        color="text-blue-600"
                    />
                </div>

                {/* Emergency alert */}
                {pendingCount > 0 && (
                    <div className="mb-6 flex items-start gap-3 rounded-lg border-l-4 border-red-600 bg-red-50 p-5">
                        <FaExclamationTriangle className="mt-1 text-2xl text-red-600" />

                        <div>
                            <h3 className="font-bold text-red-700">
                                Emergency Alert
                            </h3>

                            <p className="mt-1 text-gray-700">
                                {pendingCount} emergency request(s) are awaiting
                                review. Verify blood availability and compatibility
                                before approving.
                            </p>
                        </div>
                    </div>
                )}

                {/* Search and status filter */}
                <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-4 shadow md:flex-row">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <FaSearch className="text-gray-500" />

                        <input
                            type="search"
                            placeholder="Search patient, hospital, blood group, phone..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full outline-none"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="rounded-lg border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {/* Emergency request cards — same structure as Donor Management */}
                {loading ? (
                    <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">
                        Loading emergency requests...
                    </div>
                ) : filteredRequests.length > 0 ? (
                    <div className="space-y-6">
                        {filteredRequests.map((item) => {
                            const id = item._id || item.id;
                            const status = normalizeStatus(item.status);
                            const isPending = status === "Pending";
                            const isUpdating = updatingId === id;

                            return (
                                <div
                                    key={id}
                                    className="rounded-xl bg-white p-6 shadow transition hover:shadow-md"
                                >
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                        <div>
                                            <h2 className="flex items-center gap-2 text-xl font-bold text-red-600">
                                                <FaTint />
                                                {getPatientName(item)}
                                            </h2>

                                            <p className="mt-3 flex items-center gap-2 text-gray-600">
                                                <FaHospital className="text-red-600" />
                                                {getHospitalName(item)}
                                            </p>

                                            <p className="mt-2 flex items-center gap-2 text-gray-600">
                                                <FaEnvelope className="text-red-600" />
                                                {item.email || "Email not provided"}
                                            </p>

                                            <p className="mt-2 flex items-center gap-2 text-gray-600">
                                                <FaPhoneAlt className="text-red-600" />
                                                {item.phone || "Phone not provided"}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-start gap-2 sm:items-end">
                                            <StatusBadge
                                                status={status}
                                                className={getStatusStyle(status)}
                                            />

                                            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                <FaExclamationTriangle />
                                                Emergency
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 md:grid-cols-4">
                                        <InfoItem
                                            label="Blood Group"
                                            value={item.bloodGroup || "N/A"}
                                            highlight
                                        />

                                        <InfoItem
                                            label="Units Required"
                                            value={item.units ?? "N/A"}
                                        />

                                        <InfoItem
                                            label="Required Date"
                                            value={formatDate(
                                                item.requiredDate ||
                                                item.requestDate ||
                                                item.createdAt
                                            )}
                                        />

                                        <InfoItem
                                            label="Request Time"
                                            value={
                                                item.requestTime ||
                                                item.time ||
                                                "N/A"
                                            }
                                        />
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRequest(item)}
                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                                        >
                                            <FaEye />
                                            View Details
                                        </button>

                                        {isPending && (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        updateStatus(item, "Approved")
                                                    }
                                                    className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <FaCheck />
                                                    {isUpdating
                                                        ? "Updating..."
                                                        : "Approve Request"}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        updateStatus(item, "Rejected")
                                                    }
                                                    className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <FaTimes />
                                                    {isUpdating
                                                        ? "Updating..."
                                                        : "Reject Request"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl bg-white p-10 text-center shadow">
                        <FaExclamationTriangle className="mx-auto mb-3 text-4xl text-gray-300" />

                        <h3 className="font-bold text-gray-700">
                            No emergency requests found
                        </h3>

                        <p className="mt-2 text-gray-500">
                            {search || statusFilter !== "All"
                                ? "Try changing your search or status filter."
                                : "No emergency requests are available for this Blood Bank."}
                        </p>
                    </div>
                )}

                {/* Important information */}
                <div className="mt-8 flex gap-4 rounded-lg border-l-4 border-red-600 bg-red-50 p-5">
                    <FaExclamationTriangle className="mt-1 shrink-0 text-2xl text-red-600" />

                    <div>
                        <h3 className="font-bold text-red-700">
                            Emergency Alert
                        </h3>

                        <p className="mt-2 text-gray-700">
                            Process emergency requests promptly. Verify blood
                            availability, compatibility, and the requested quantity
                            before approving. Approval does not automatically deduct
                            inventory unless the backend implements that operation.
                        </p>
                    </div>
                </div>
            </main>

            {/* Request details modal */}
            {selectedRequest && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedRequest(null);
                        }
                    }}
                >
                    <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Emergency Request Details
                            </h2>

                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
                                aria-label="Close details"
                                className="text-xl text-gray-500 hover:text-gray-800"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <DetailRow
                                label="Patient"
                                value={getPatientName(selectedRequest)}
                            />

                            <DetailRow
                                label="Hospital"
                                value={getHospitalName(selectedRequest)}
                            />

                            <DetailRow
                                label="Blood Group"
                                value={selectedRequest.bloodGroup}
                            />

                            <DetailRow
                                label="Units Required"
                                value={selectedRequest.units}
                            />

                            <DetailRow
                                label="Required Date"
                                value={formatDate(
                                    selectedRequest.requiredDate ||
                                    selectedRequest.requestDate
                                )}
                            />

                            <DetailRow
                                label="Priority"
                                value={selectedRequest.priority}
                            />

                            <DetailRow
                                label="Status"
                                value={normalizeStatus(selectedRequest.status)}
                            />

                            <DetailRow
                                label="Email"
                                value={selectedRequest.email}
                            />

                            <DetailRow
                                label="Phone"
                                value={selectedRequest.phone}
                            />

                            <DetailRow
                                label="Notes"
                                value={selectedRequest.notes}
                            />
                        </div>

                        {normalizeStatus(selectedRequest.status) === "Pending" && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={
                                        updatingId ===
                                        (selectedRequest._id || selectedRequest.id)
                                    }
                                    onClick={() =>
                                        updateStatus(selectedRequest, "Approved")
                                    }
                                    className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    <FaCheck className="mr-2 inline" />
                                    Approve
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        updatingId ===
                                        (selectedRequest._id || selectedRequest.id)
                                    }
                                    onClick={() =>
                                        updateStatus(selectedRequest, "Rejected")
                                    }
                                    className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    <FaTimes className="mr-2 inline" />
                                    Reject
                                </button>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setSelectedRequest(null)}
                            className="mt-4 w-full rounded-lg bg-gray-700 px-4 py-3 text-white hover:bg-gray-800"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ icon, label, value, color }) {
    return (
        <div className="rounded-xl bg-white p-5 shadow">
            <div className={`mb-3 text-3xl ${color}`}>{icon}</div>
            <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
            <p className="mt-1 text-gray-500">{label}</p>
        </div>
    );
}

function StatusBadge({ status, className }) {
    return (
        <span
            className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${className ||
                (status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : status === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-800")
                }`}
        >
            {status}
        </span>
    );
}

function InfoItem({ label, value, highlight = false }) {
    return (
        <div>
            <p className="mb-1 text-sm text-gray-500">{label}</p>
            <p
                className={`font-semibold ${highlight ? "text-red-600" : "text-gray-800"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex flex-col justify-between gap-1 border-b pb-2 sm:flex-row">
            <span className="font-semibold text-gray-600">{label}</span>

            <span className="break-words text-gray-800">
                {value === undefined || value === null || value === ""
                    ? "Not provided"
                    : String(value)}
            </span>
        </div>
    );
}

export default BBEmergencyRequests;
