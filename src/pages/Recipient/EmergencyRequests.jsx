
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    FaArrowLeft,
    FaExclamationTriangle,
    FaTint,
    FaCalendarAlt,
    FaHospital,
    FaPhoneAlt,
    FaTimes,
} from "react-icons/fa";

import RecipientPanel from "../../components/RecipientPanel";
import axiosInstance from "../../API/axiosInstance";

const initialForm = {
    patientName: "",
    bloodGroup: "",
    units: "1",
    district: "",
    hospital: "",
    contact: "",
    reason: "",
};

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("loggedInUser") || "null");
    } catch {
        return null;
    }
}

function getRequestList(response) {
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.emergencyRequests)) {
        return data.emergencyRequests;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.requests)) return data.requests;

    return [];
}

function formatDate(date) {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
        ? "Date unavailable"
        : parsed.toLocaleString();
}

function RecipientEmergencyRequest() {
    const reduxUser = useSelector(
        (state) => state.user.currentUser
    );

    const [storedUser] = useState(getStoredUser);
    const user = reduxUser || storedUser;

    const [formData, setFormData] = useState(initialForm);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [updatingId, setUpdatingId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const requesterId = String(user?._id || user?.id || "");
    const requesterName = user?.fullName || user?.name || "";
    const email = String(user?.email || "").trim().toLowerCase();

    const loadRequests = useCallback(async () => {
        if (!email && !requesterId) {
            setRequests([]);
            setFetching(false);
            return;
        }

        setFetching(true);

        try {
            const response = await axiosInstance.get(
                "/emergencyRequests",
                {
                    params: {
                        ...(email ? { email } : {}),
                        ...(requesterId ? { requesterId } : {}),
                    },
                }
            );

            const list = getRequestList(response);

            // Filter again on the frontend to show only this recipient's requests.
            const mine = list.filter((request) => {
                const emailMatches =
                    email &&
                    String(request.email || "").trim().toLowerCase() === email;

                const idMatches =
                    requesterId &&
                    String(request.requesterId || "") === requesterId;

                return Boolean(emailMatches || idMatches);
            });

            setRequests(mine);
            setError("");
        } catch (err) {
            console.error("Failed to load emergency requests:", err);
            setError(
                err.response?.data?.message ||
                "Could not load emergency requests. Check your backend."
            );
        } finally {
            setFetching(false);
        }
    }, [email, requesterId]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!requesterId || !requesterName || !email) {
            setError(
                "Recipient details are missing. Please sign in again."
            );
            return;
        }

        if (Number(formData.units) < 1 ||
            !Number.isInteger(Number(formData.units))) {
            setError("Units must be a positive whole number.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                requestedBy: "Recipient",
                requesterId,
                requesterName,
                email,
                patientName: formData.patientName.trim(),
                bloodGroup: formData.bloodGroup,
                units: Number(formData.units),
                district: formData.district.trim(),
                hospital: formData.hospital.trim(),
                contact: formData.contact.trim(),
                reason: formData.reason.trim(),
            };

            const response = await axiosInstance.post(
                "/emergencyRequests",
                payload
            );

            setSuccess(
                response.data?.message ||
                "Emergency request submitted successfully."
            );

            setFormData(initialForm);
            await loadRequests();
        } catch (err) {
            console.error("Failed to submit emergency request:", err);

            setError(
                err.response?.data?.message ||
                "Failed to submit emergency request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const cancelRequest = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this emergency request?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");
        setUpdatingId(id);

        try {
            const response = await axiosInstance.patch(
                `/emergencyRequests/${id}/status`,
                { status: "Cancelled" }
            );

            setSuccess(
                response.data?.message || "Request cancelled successfully."
            );

            await loadRequests();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not cancel this request."
            );
        } finally {
            setUpdatingId("");
        }
    };

    const statusClass = (status) => {
        switch (status) {
            case "Resolved":
                return "bg-green-100 text-green-700";
            case "Approved":
                return "bg-blue-100 text-blue-700";
            case "Cancelled":
                return "bg-gray-200 text-gray-700";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-red-100 text-red-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 md:flex">
            <RecipientPanel />

            <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>


                            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                                Emergency Blood Request
                            </h1>

                            <p className="mt-2 text-gray-600">
                                Submit urgent blood requirements and track
                                your requests.
                            </p>
                        </div>

                        <FaExclamationTriangle className="text-4xl text-red-600" />
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700"
                        >
                            {success}
                        </div>
                    )}

                    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-7">
                        <h2 className="mb-5 text-xl font-semibold text-gray-800">
                            Request Details
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Patient Name *
                                    </label>
                                    <input
                                        name="patientName"
                                        value={formData.patientName}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-red-500"
                                        placeholder="Enter patient name"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Blood Group *
                                    </label>
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-red-500"
                                    >
                                        <option value="">Select blood group</option>
                                        {[
                                            "A+", "A-", "B+", "B-",
                                            "AB+", "AB-", "O+", "O-",
                                        ].map((group) => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Units Required *
                                    </label>
                                    <input
                                        type="number"
                                        name="units"
                                        value={formData.units}
                                        onChange={handleChange}
                                        min="1"
                                        step="1"
                                        required
                                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        District *
                                    </label>
                                    <input
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-red-500"
                                        placeholder="Enter district"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Hospital *
                                    </label>
                                    <input
                                        name="hospital"
                                        value={formData.hospital}
                                        onChange={handleChange}
                                        required
                                        maxLength={150}
                                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-red-500"
                                        placeholder="Hospital name"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Contact Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        required
                                        maxLength={20}
                                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-red-500"
                                        placeholder="Contact number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Reason for Emergency *
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                    maxLength={1000}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-red-500"
                                    placeholder="Describe the urgent blood requirement"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                <FaTint />
                                {loading
                                    ? "Submitting..."
                                    : "Send Emergency Request"}
                            </button>
                        </form>
                    </section>

                    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-7">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    My Emergency Requests
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {requests.length} request(s)
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={loadRequests}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                                Refresh
                            </button>
                        </div>

                        {fetching ? (
                            <p className="py-6 text-gray-500">
                                Loading requests...
                            </p>
                        ) : requests.length === 0 ? (
                            <p className="rounded-lg bg-gray-50 p-5 text-gray-500">
                                You have not submitted any emergency requests yet.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((request) => (
                                    <article
                                        key={request._id}
                                        className="rounded-lg border border-gray-200 p-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {request.patientName}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Requested by {request.requesterName}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(request.status)}`}
                                            >
                                                {request.status || "Active"}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                                            <p className="flex items-center gap-2">
                                                <FaTint className="text-red-600" />
                                                <strong>{request.bloodGroup}</strong>
                                                — {request.units} unit(s)
                                            </p>

                                            <p className="flex items-center gap-2">
                                                <FaHospital className="text-red-600" />
                                                {request.hospital}
                                            </p>

                                            <p className="flex items-center gap-2">
                                                <FaPhoneAlt className="text-red-600" />
                                                {request.contact}
                                            </p>

                                            <p className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-red-600" />
                                                {formatDate(request.createdAt)}
                                            </p>

                                            <p className="sm:col-span-2">
                                                <strong>District:</strong>{" "}
                                                {request.district}
                                            </p>

                                            <p className="sm:col-span-2">
                                                <strong>Reason:</strong>{" "}
                                                {request.reason}
                                            </p>
                                        </div>

                                        {request.status !== "Cancelled" &&
                                            request.status !== "Resolved" && (
                                                <button
                                                    type="button"
                                                    disabled={updatingId === request._id}
                                                    onClick={() =>
                                                        cancelRequest(request._id)
                                                    }
                                                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <FaTimes />
                                                    {updatingId === request._id
                                                        ? "Cancelling..."
                                                        : "Cancel Request"}
                                                </button>
                                            )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default RecipientEmergencyRequest;
