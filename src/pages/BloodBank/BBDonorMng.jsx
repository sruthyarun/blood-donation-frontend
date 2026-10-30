
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaSearch,
    FaUser,
    FaTint,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaCheck,
    FaTimes,
    FaCalendarAlt,
    FaSyncAlt,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

function BBDonorManagement() {
    const user = useSelector((state) => state.user.currentUser);

    const bloodBankId =
        user?._id ||
        user?.id ||
        user?.bloodBankId ||
        "";

    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchAppointments = useCallback(async () => {
        if (!bloodBankId) {
            setAppointments([]);
            setError("Blood Bank ID is missing. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/appointments", {
                params: { bloodBankId },
            });

            const data =
                response.data?.appointments ??
                response.data?.data ??
                response.data;

            setAppointments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(
                "Failed to fetch blood bank appointments:",
                err.response?.status,
                err.response?.data || err.message
            );

            setAppointments([]);
            setError(
                err.response?.data?.message ||
                "Unable to load donor appointments."
            );
        } finally {
            setLoading(false);
        }
    }, [bloodBankId]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const filteredAppointments = appointments.filter((appointment) => {
        const query = search.trim().toLowerCase();

        if (!query) return true;

        return [
            appointment.donorName,
            appointment.fullName,
            appointment.donorEmail,
            appointment.email,
            appointment.bloodGroup,
            appointment.phone,
            appointment.donorPhone,
            appointment.hospital,
            appointment.city,
            appointment.district,
            appointment.status,
        ].some((value) =>
            String(value || "").toLowerCase().includes(query)
        );
    });

    const pendingCount = appointments.filter(
        (appointment) =>
            (appointment.status || "Pending").toLowerCase() === "pending"
    ).length;

    const confirmedCount = appointments.filter(
        (appointment) =>
            appointment.status?.toLowerCase() === "confirmed"
    ).length;

    const rejectedCount = appointments.filter(
        (appointment) =>
            appointment.status?.toLowerCase() === "rejected"
    ).length;

    const updateStatus = async (appointment, status) => {
        const appointmentId = appointment._id || appointment.id;

        if (!appointmentId) {
            setError("Appointment ID is missing.");
            return;
        }

        if (!["Confirmed", "Rejected"].includes(status)) {
            setError("Invalid appointment status.");
            return;
        }

        try {
            setUpdatingId(appointmentId);
            setError("");
            setSuccess("");

            const response = await axiosInstance.patch(
                `/appointments/${appointmentId}`,
                {
                    status,
                    emailBy: user?.email || "bloodbank",
                }
            );

            if (response.data?.notificationCreated === false) {
                setError(
                    response.data.message ||
                    "Appointment updated, but notification creation failed."
                );
                await fetchAppointments();
                return;
            }

            setSuccess(
                response.data?.message ||
                `Appointment ${status.toLowerCase()} successfully.`
            );

            await fetchAppointments();
        } catch (err) {
            console.error(
                "Appointment status update failed:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to update appointment status."
            );

            if (err.response?.data?.appointmentUpdated) {
                await fetchAppointments();
            }
        } finally {
            setUpdatingId(null);
        }
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

    const getStatusStyle = (status) => {
        switch ((status || "Pending").toLowerCase()) {
            case "confirmed":
                return "bg-green-100 text-green-700";
            case "rejected":
                return "bg-red-100 text-red-700";
            case "cancelled":
                return "bg-gray-200 text-gray-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 md:flex">
            <BloodBankPanel />

            <main className="min-w-0 flex-1 p-4 md:p-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-800">
                            Donor Management
                        </h1>

                        <p className="text-gray-500">
                            Manage donation appointments for your blood bank.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchAppointments}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        <FaSyncAlt className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-center justify-between gap-3 rounded-lg bg-red-100 p-4 text-red-700"
                    >
                        <span>{error}</span>
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
                        className="mb-6 flex items-center justify-between gap-3 rounded-lg bg-green-100 p-4 text-green-700"
                    >
                        <span>{success}</span>
                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            aria-label="Dismiss success message"
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-gray-500">Total appointments</p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-800">
                            {appointments.length}
                        </h2>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-gray-500">Pending</p>
                        <h2 className="mt-2 text-2xl font-bold text-yellow-600">
                            {pendingCount}
                        </h2>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow">
                        <p className="text-gray-500">Confirmed</p>
                        <h2 className="mt-2 text-2xl font-bold text-green-600">
                            {confirmedCount}
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Rejected: {rejectedCount}
                        </p>
                    </div>
                </div>

                <div className="mb-6 flex items-center rounded-lg bg-white p-3 shadow">
                    <FaSearch className="text-gray-500" />

                    <input
                        type="search"
                        className="ml-3 w-full outline-none"
                        placeholder="Search donor, email, blood group, phone or status..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">
                        Loading appointments...
                    </div>
                ) : filteredAppointments.length > 0 ? (
                    <div className="space-y-6">
                        {filteredAppointments.map((appointment) => {
                            const id = appointment._id || appointment.id;
                            const status = appointment.status || "Pending";
                            const isPending =
                                status.toLowerCase() === "pending";
                            const isUpdating = updatingId === id;

                            return (
                                <div
                                    key={id}
                                    className="rounded-xl bg-white p-6 shadow"
                                >
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                        <div>
                                            <h2 className="flex items-center gap-2 text-xl font-bold text-red-600">
                                                <FaUser />
                                                {appointment.donorName ||
                                                    appointment.fullName ||
                                                    appointment.name ||
                                                    "Donor"}
                                            </h2>

                                            <p className="mt-3 flex items-center gap-2">
                                                <FaTint className="text-red-600" />
                                                Blood group:
                                                <b>
                                                    {appointment.bloodGroup ||
                                                        "N/A"}
                                                </b>
                                            </p>

                                            <p className="mt-2 flex items-center gap-2">
                                                <FaPhoneAlt className="text-red-600" />
                                                {appointment.phone ||
                                                    appointment.donorPhone ||
                                                    "N/A"}
                                            </p>

                                            <p className="mt-2 flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-red-600" />
                                                {appointment.district ||
                                                    appointment.city ||
                                                    appointment.address ||
                                                    "N/A"}
                                            </p>

                                            <p className="mt-2 text-gray-600">
                                                Email:{" "}
                                                {appointment.donorEmail ||
                                                    appointment.email ||
                                                    "N/A"}
                                            </p>
                                        </div>

                                        <span
                                            className={`h-fit rounded-full px-4 py-2 font-medium ${getStatusStyle(status)}`}
                                        >
                                            {status}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <b className="flex items-center gap-2">
                                                <FaCalendarAlt />
                                                Date
                                            </b>
                                            <p>
                                                {formatDate(
                                                    appointment.date ||
                                                    appointment.appointmentDate ||
                                                    appointment.createdAt
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <b>Time</b>
                                            <p>{appointment.time || "N/A"}</p>
                                        </div>

                                        <div>
                                            <b>Hospital / Location</b>
                                            <p>
                                                {appointment.hospital ||
                                                    appointment.hospitalName ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    {isPending && (
                                        <div className="mt-6 flex flex-wrap gap-4">
                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() =>
                                                    updateStatus(
                                                        appointment,
                                                        "Confirmed"
                                                    )
                                                }
                                                className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <FaCheck />
                                                {isUpdating
                                                    ? "Processing..."
                                                    : "Approve Appointment"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() =>
                                                    updateStatus(
                                                        appointment,
                                                        "Rejected"
                                                    )
                                                }
                                                className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <FaTimes />
                                                {isUpdating
                                                    ? "Processing..."
                                                    : "Reject Appointment"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">
                        {search
                            ? "No matching appointments found."
                            : "No appointments found for this blood bank."}
                    </div>
                )}
            </main>
        </div>
    );
}

export default BBDonorManagement;