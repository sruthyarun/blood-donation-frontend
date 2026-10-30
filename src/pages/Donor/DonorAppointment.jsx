
import { useEffect, useState, useCallback } from "react";
import {
    FaCalendarAlt,
    FaHospital,
    FaMapMarkerAlt,
    FaClock,
    FaPlus,
    FaTint,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import axiosInstance from "../../API/axiosInstance";
import DonorPanel from "../../components/donorPanel";

function Appointment() {
    const navigate = useNavigate();
    const reduxUser = useSelector(
        (state) => state.user.currentUser
    );

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    // Get logged-in user from Redux or localStorage
    const user = reduxUser || (() => {
        try {
            return JSON.parse(
                localStorage.getItem("loggedInUser")
            );
        } catch {
            return null;
        }
    })();

    const userEmail = (
        user?.email ||
        user?.donorEmail ||
        ""
    ).trim().toLowerCase();

    // Load appointments from MongoDB through the backend
    const loadAppointments = useCallback(async () => {
        if (!userEmail) {
            setAppointments([]);
            setLoading(false);
            setErrorMessage(
                "Please log in to view your appointments."
            );
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const response = await axiosInstance.get(
                "/appointments",
                {
                    params: {
                        email: userEmail,
                    },
                }
            );

            // Support both { success, data } and direct array responses
            const result = response.data;
            const appointmentList = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.appointments)
                        ? result.appointments
                        : [];

            // Exclude completed and cancelled appointments
            setAppointments(
                appointmentList.filter((appointment) => {
                    const status = (
                        appointment.status || "Pending"
                    ).toLowerCase();

                    return ![
                        "completed",
                        "cancelled",
                    ].includes(status);
                })
            );
        } catch (error) {
            console.error(
                "Failed to load appointments:",
                error.response?.data || error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Unable to load appointments. Please check your backend."
            );
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    // Cancel appointment
    const handleCancel = async (appointment) => {
        const id = appointment._id || appointment.id;

        if (!id) {
            window.alert(
                "This appointment has no valid ID."
            );
            return;
        }

        if (
            !window.confirm(
                "Are you sure you want to cancel this appointment?"
            )
        ) {
            return;
        }

        try {
            setCancellingId(id);

            await axiosInstance.patch(
                `/appointments/${id}/cancel`
            );

            await loadAppointments();

            window.alert(
                "Appointment cancelled successfully."
            );
        } catch (error) {
            console.error(
                "Failed to cancel appointment:",
                error.response?.data || error
            );

            window.alert(
                error.response?.data?.message ||
                "Unable to cancel the appointment."
            );
        } finally {
            setCancellingId(null);
        }
    };

    // Status badge styles
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
            case "confirmed":
                return "bg-green-100 text-green-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "cancelled":
            case "rejected":
                return "bg-red-100 text-red-700";

            case "completed":
                return "bg-blue-100 text-blue-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Destination name and type
    const getDestinationName = (appointment) => {
        return (
            appointment.destinationName ||
            appointment.hospital ||
            appointment.bloodBankName ||
            "Donation Center"
        );
    };

    const getDestinationType = (appointment) => {
        if (appointment.destinationType) {
            return appointment.destinationType;
        }

        if (
            appointment.bloodBankId ||
            appointment.bloodBankName
        ) {
            return "BloodBank";
        }

        return "Hospital";
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <DonorPanel />

            <main className="min-h-screen bg-gray-100 p-4 sm:p-8 flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            My Appointments
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Manage your blood donation appointments
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/bookappointment")
                        }
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg transition"
                    >
                        <FaPlus />
                        Book Appointment
                    </button>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow text-center">
                        Loading appointments...
                    </div>
                ) : errorMessage ? (
                    /* Error */
                    <div className="bg-white rounded-xl p-8 shadow text-center">
                        <p className="text-red-600">
                            {errorMessage}
                        </p>

                        <button
                            type="button"
                            onClick={loadAppointments}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                ) : appointments.length === 0 ? (
                    /* Empty state */
                    <div className="bg-white rounded-xl p-8 shadow text-center">
                        <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-4" />

                        <h2 className="text-xl font-semibold text-gray-800">
                            No Appointments Found
                        </h2>

                        <p className="text-gray-500 mt-2">
                            You do not have any active appointments.
                            Book your first blood donation appointment.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/bookappointment")
                            }
                            className="mt-5 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg"
                        >
                            Book Appointment
                        </button>
                    </div>
                ) : (
                    /* Appointment list */
                    <div className="space-y-6">
                        {appointments.map((appointment) => {
                            const id =
                                appointment._id ||
                                appointment.id;

                            const status =
                                appointment.status || "Pending";

                            const destinationType =
                                getDestinationType(appointment);

                            const destinationName =
                                getDestinationName(appointment);

                            const isDisabled = [
                                "completed",
                                "cancelled",
                                "rejected",
                            ].includes(status.toLowerCase());

                            const isCancelling =
                                cancellingId === id;

                            return (
                                <div
                                    key={id}
                                    className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        {/* Appointment details */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                {destinationType ===
                                                    "BloodBank" ? (
                                                    <FaTint className="text-red-600 text-xl" />
                                                ) : (
                                                    <FaHospital className="text-red-600 text-xl" />
                                                )}

                                                <h2 className="text-xl sm:text-2xl font-semibold text-red-600">
                                                    {destinationName}
                                                </h2>
                                            </div>

                                            <p className="text-sm text-gray-500">
                                                Destination:{" "}
                                                {destinationType ===
                                                    "BloodBank"
                                                    ? "Blood Bank"
                                                    : "Hospital"}
                                            </p>

                                            <p className="flex items-center gap-2 text-gray-700">
                                                <FaMapMarkerAlt className="text-red-500 shrink-0" />
                                                {appointment.district ||
                                                    "District not provided"}
                                            </p>

                                            <p className="flex items-center gap-2 text-gray-700">
                                                <FaCalendarAlt className="text-red-500 shrink-0" />
                                                {appointment.date ||
                                                    "Date not available"}
                                            </p>

                                            <p className="flex items-center gap-2 text-gray-700">
                                                <FaClock className="text-red-500 shrink-0" />
                                                {appointment.time ||
                                                    "Time not available"}
                                            </p>

                                            {appointment.bloodGroup && (
                                                <p className="flex items-center gap-2 text-gray-700">
                                                    <FaTint className="text-red-500 shrink-0" />
                                                    Blood Group:{" "}
                                                    {appointment.bloodGroup}
                                                </p>
                                            )}

                                            {appointment.phone && (
                                                <p className="text-gray-700">
                                                    Phone:{" "}
                                                    {appointment.phone}
                                                </p>
                                            )}

                                            {appointment.notes && (
                                                <p className="text-gray-600">
                                                    Notes:{" "}
                                                    {appointment.notes}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status and cancellation */}
                                        <div className="flex flex-col md:items-end justify-between gap-4">
                                            <span
                                                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(status)}`}
                                            >
                                                {status}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCancel(
                                                        appointment
                                                    )
                                                }
                                                disabled={
                                                    isDisabled ||
                                                    isCancelling
                                                }
                                                className={`px-4 py-2 rounded-lg text-white transition ${isDisabled ||
                                                        isCancelling
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-red-600 hover:bg-red-700"
                                                    }`}
                                            >
                                                {isCancelling
                                                    ? "Cancelling..."
                                                    : status.toLowerCase() ===
                                                        "cancelled"
                                                        ? "Cancelled"
                                                        : status.toLowerCase() ===
                                                            "completed"
                                                            ? "Completed"
                                                            : status.toLowerCase() ===
                                                                "rejected"
                                                                ? "Rejected"
                                                                : "Cancel Appointment"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Appointment;
