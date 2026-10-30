
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaCalendarAlt,
    FaSearch,
    FaEye,
    FaCheck,
    FaTimes,
    FaUserFriends,
    FaTint,
    FaPhone,
    FaMapMarkerAlt,
    FaClock,
    FaEnvelope,
    FaSpinner,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

function BBAppointments() {
    const user = useSelector((state) => state.user.currentUser);

    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Logged-in blood bank details
    const bloodBankId =
        user?._id ||
        user?.id ||
        user?.bloodBankId ||
        user?.userId;

    const bloodBankName =
        user?.bloodBankName ||
        user?.name ||
        user?.hospitalName ||
        "";

    // Fetch appointments belonging to this blood bank
    const fetchAppointments = useCallback(async () => {
        if (!bloodBankId) {
            setError("Blood bank information is not available. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/appointments", {
                params: {
                    bloodBankId,
                    destinationType: "BloodBank",
                    destinationId: bloodBankId,
                },
            });

            const data = response.data;

            let appointmentList = [];

            if (Array.isArray(data)) {
                appointmentList = data;
            } else if (Array.isArray(data?.appointments)) {
                appointmentList = data.appointments;
            } else if (Array.isArray(data?.data)) {
                appointmentList = data.data;
            }

            // Keep appointments associated with the logged-in blood bank.
            const bankAppointments = appointmentList.filter((item) => {
                const destinationId =
                    item.destinationId?._id ||
                    item.destinationId ||
                    item.bloodBankId?._id ||
                    item.bloodBankId;

                const destinationType = item.destinationType;

                const belongsById =
                    destinationId &&
                    String(destinationId) === String(bloodBankId);

                const belongsByType =
                    destinationType?.toLowerCase() === "bloodbank";

                const belongsByName =
                    bloodBankName &&
                    (
                        item.destinationName?.toLowerCase() === bloodBankName.toLowerCase() ||
                        item.bloodBankName?.toLowerCase() === bloodBankName.toLowerCase()
                    );

                return belongsById || (belongsByType && belongsByName);
            });

            setAppointments(bankAppointments);
        } catch (err) {
            console.error("Fetch appointments error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load appointments. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [bloodBankId, bloodBankName]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Convert appointment date into a comparable date
    const getAppointmentDate = (appointment) => {
        const value =
            appointment.date ||
            appointment.appointmentDate ||
            appointment.createdAt;

        if (!value) return null;

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    };

    const isToday = (appointment) => {
        const date = getAppointmentDate(appointment);

        if (!date) return false;

        const today = new Date();

        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    // Search appointments
    const filteredAppointments = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return appointments;

        return appointments.filter((item) => {
            const searchableFields = [
                item.donorName,
                item.donorEmail,
                item.email,
                item.bloodGroup,
                item.district,
                item.phone,
                item.status,
                item.destinationName,
                item.bloodBankName,
            ];

            return searchableFields.some((field) =>
                String(field || "").toLowerCase().includes(value)
            );
        });
    }, [appointments, search]);

    // Summary counts
    const totalAppointments = appointments.length;

    const todayAppointments = appointments.filter(isToday).length;

    const completedAppointments = appointments.filter(
        (item) => item.status?.toLowerCase() === "completed"
    ).length;

    const pendingAppointments = appointments.filter(
        (item) => item.status?.toLowerCase() === "pending"
    ).length;

    // Approve or reject appointment
    const updateStatus = async (appointment, status) => {
        const appointmentId = appointment._id || appointment.id;

        if (!appointmentId) {
            alert("Appointment ID is missing.");
            return;
        }

        if (appointment.status?.toLowerCase() !== "pending") {
            alert("Only pending appointments can be updated.");
            return;
        }

        const actionText =
            status === "Confirmed" ? "approve" : "reject";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this appointment?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(appointmentId);

            await axiosInstance.patch(
                `/appointments/${appointmentId}`,
                { status }
            );

            alert(
                status === "Confirmed"
                    ? "Appointment approved successfully."
                    : "Appointment rejected successfully."
            );

            setSelectedAppointment(null);

            await fetchAppointments();
        } catch (err) {
            console.error("Update appointment error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to update appointment."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
            case "approved":
                return "bg-green-100 text-green-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "completed":
                return "bg-blue-100 text-blue-700";

            case "rejected":
            case "cancelled":
            case "canceled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatDate = (appointment) => {
        const date = getAppointmentDate(appointment);

        if (!date) return "Not specified";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <BloodBankPanel />

            <div className="flex-1 min-w-0 p-4 md:p-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Appointment Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage donor appointments for your blood bank.
                        </p>
                    </div>

                    <button
                        onClick={fetchAppointments}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                        <FaCalendarAlt />
                        Refresh Appointments
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                    <div className="bg-red-600 text-white rounded-xl shadow p-6">
                        <FaCalendarAlt className="text-3xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {totalAppointments}
                        </h2>
                        <p>Total Appointments</p>
                    </div>

                    <div className="bg-blue-600 text-white rounded-xl shadow p-6">
                        <FaUserFriends className="text-3xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {todayAppointments}
                        </h2>
                        <p>Today's Appointments</p>
                    </div>

                    <div className="bg-green-600 text-white rounded-xl shadow p-6">
                        <FaCheck className="text-3xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {completedAppointments}
                        </h2>
                        <p>Completed</p>
                    </div>

                    <div className="bg-yellow-500 text-white rounded-xl shadow p-6">
                        <FaClock className="text-3xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {pendingAppointments}
                        </h2>
                        <p>Pending</p>
                    </div>

                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 mb-6">
                    <FaSearch className="text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search donor, email, blood group, district..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full outline-none text-gray-700"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-5">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center">
                        <FaSpinner className="animate-spin text-red-600 text-3xl mx-auto mb-3" />
                        <p className="text-gray-500">
                            Loading appointments...
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow overflow-x-auto">

                        <table className="w-full min-w-[900px]">

                            <thead className="bg-red-600 text-white">
                                <tr>
                                    <th className="py-4 px-4">Donor</th>
                                    <th className="px-4">Blood Group</th>
                                    <th className="px-4">Date</th>
                                    <th className="px-4">Time</th>
                                    <th className="px-4">District</th>
                                    <th className="px-4">Status</th>
                                    <th className="px-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAppointments.length > 0 ? (
                                    filteredAppointments.map((item) => {
                                        const id = item._id || item.id;

                                        return (
                                            <tr
                                                key={id}
                                                className="text-center border-b hover:bg-gray-50"
                                            >
                                                <td className="py-4 px-4">
                                                    <p className="font-semibold text-gray-800">
                                                        {item.donorName || "Unknown donor"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.donorEmail || item.email || ""}
                                                    </p>
                                                </td>

                                                <td className="font-bold text-red-600 px-4">
                                                    {item.bloodGroup || "-"}
                                                </td>

                                                <td className="px-4">
                                                    {formatDate(item)}
                                                </td>

                                                <td className="px-4">
                                                    {item.time || "Not specified"}
                                                </td>

                                                <td className="px-4">
                                                    {item.district || "-"}
                                                </td>

                                                <td className="px-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(item.status)}`}
                                                    >
                                                        {item.status || "Pending"}
                                                    </span>
                                                </td>

                                                <td className="px-4">
                                                    <div className="flex justify-center gap-2">

                                                        <button
                                                            onClick={() => setSelectedAppointment(item)}
                                                            title="View details"
                                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                                                        >
                                                            <FaEye />
                                                        </button>

                                                        {item.status?.toLowerCase() === "pending" && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateStatus(item, "Confirmed")}
                                                                    disabled={updatingId === id}
                                                                    title="Approve appointment"
                                                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-2 rounded-lg"
                                                                >
                                                                    {updatingId === id ? (
                                                                        <FaSpinner className="animate-spin" />
                                                                    ) : (
                                                                        <FaCheck />
                                                                    )}
                                                                </button>

                                                                <button
                                                                    onClick={() => updateStatus(item, "Rejected")}
                                                                    disabled={updatingId === id}
                                                                    title="Reject appointment"
                                                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-2 rounded-lg"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        )}

                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center py-12 text-gray-500"
                                        >
                                            {search
                                                ? "No matching appointments found."
                                                : "No appointments found for this blood bank."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                )}

                {/* Appointment Details Modal */}
                {selectedAppointment && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">

                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Appointment Details
                                </h2>

                                <button
                                    onClick={() => setSelectedAppointment(null)}
                                    className="text-gray-500 hover:text-red-600 text-xl"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-4">

                                <div>
                                    <p className="text-sm text-gray-500">Donor Name</p>
                                    <p className="font-semibold">
                                        {selectedAppointment.donorName || "-"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaTint className="text-red-600" />
                                    <span>
                                        Blood Group:{" "}
                                        <strong>
                                            {selectedAppointment.bloodGroup || "-"}
                                        </strong>
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaEnvelope className="text-blue-600" />
                                    <span>
                                        {selectedAppointment.donorEmail ||
                                            selectedAppointment.email ||
                                            "-"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaPhone className="text-green-600" />
                                    <span>
                                        {selectedAppointment.phone || "-"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaMapMarkerAlt className="text-red-600" />
                                    <span>
                                        {selectedAppointment.district || "-"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-blue-600" />
                                    <span>{formatDate(selectedAppointment)}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaClock className="text-blue-600" />
                                    <span>
                                        {selectedAppointment.time || "Not specified"}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Notes</p>
                                    <p className="text-gray-700">
                                        {selectedAppointment.notes || "No notes provided."}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span
                                        className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(selectedAppointment.status)}`}
                                    >
                                        {selectedAppointment.status}
                                    </span>
                                </div>

                            </div>

                            {selectedAppointment.status?.toLowerCase() === "pending" && (
                                <div className="flex gap-3 mt-6">

                                    <button
                                        onClick={() => updateStatus(selectedAppointment, "Confirmed")}
                                        disabled={updatingId === (selectedAppointment._id || selectedAppointment.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <FaCheck />
                                        Approve
                                    </button>

                                    <button
                                        onClick={() => updateStatus(selectedAppointment, "Rejected")}
                                        disabled={updatingId === (selectedAppointment._id || selectedAppointment.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <FaTimes />
                                        Reject
                                    </button>

                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* Guidelines */}
                <div className="mt-8 bg-blue-100 border-l-4 border-blue-600 rounded-lg p-5">
                    <h3 className="font-bold text-blue-700">
                        Appointment Guidelines
                    </h3>

                    <p className="text-gray-700 mt-2">
                        Donors should arrive at least 15 minutes before the
                        scheduled time with a valid ID. Ensure the donor is
                        medically fit before blood collection.
                    </p>
                </div>

            </div>
        </div>
    );
}

export default BBAppointments;
