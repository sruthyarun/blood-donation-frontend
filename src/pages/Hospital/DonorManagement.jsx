
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
} from "react-icons/fa";

import HospitalPanel from "../../components/HospitalPanel";
import axiosInstance from "../../API/axiosInstance";

function DonorManagement() {
    const user = useSelector((state) => state.user.currentUser);

    const [donors, setDonors] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchDonors = useCallback(async () => {
        if (!user?.hospitalName) {
            setDonors([]);
            setError("Hospital name is missing from the logged-in user.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/appointments", {
                params: { hospital: user.hospitalName },
            });

            const data = response.data?.data ?? response.data;
            setDonors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(
                "Failed to fetch appointments:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Unable to load donation appointments."
            );
        } finally {
            setLoading(false);
        }
    }, [user?.hospitalName]);

    useEffect(() => {
        fetchDonors();
    }, [fetchDonors]);

    const filteredDonors = donors.filter((donor) => {
        const query = search.trim().toLowerCase();

        return (
            donor.donorName?.toLowerCase().includes(query) ||
            donor.donorEmail?.toLowerCase().includes(query) ||
            donor.email?.toLowerCase().includes(query) ||
            donor.bloodGroup?.toLowerCase().includes(query) ||
            donor.hospital?.toLowerCase().includes(query)
        );
    });

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
                    emailBy: user?.email || "hospital",
                }
            );

            if (response.data?.notificationCreated === false) {
                setError(
                    response.data.message ||
                    "Appointment updated, but notification creation failed."
                );
                await fetchDonors();
                return;
            }

            setSuccess(
                response.data?.message ||
                `Appointment ${status.toLowerCase()} successfully. Notification saved.`
            );

            await fetchDonors();
        } catch (err) {
            console.error(
                "Appointment update failed:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to update appointment."
            );

            if (err.response?.data?.appointmentUpdated) {
                await fetchDonors();
            }
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <HospitalPanel />

            <main className="flex-1 min-w-0 p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-2">
                    Donor Management
                </h1>

                <p className="text-gray-500 mb-8">
                    Manage donation appointments
                </p>

                <div className="bg-white p-3 rounded-lg shadow flex items-center mb-6">
                    <FaSearch className="text-gray-500" />

                    <input
                        className="ml-3 outline-none w-full"
                        placeholder="Search donor, email or blood group"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-5">
                        <p className="text-gray-500">Total appointments</p>
                        <h2 className="text-2xl font-bold">
                            {donors.length}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl shadow p-5">
                        <p className="text-gray-500">Pending</p>
                        <h2 className="text-2xl font-bold text-yellow-600">
                            {
                                donors.filter(
                                    (d) =>
                                        (d.status || "Pending").toLowerCase() ===
                                        "pending"
                                ).length
                            }
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl shadow p-5">
                        <p className="text-gray-500">Confirmed</p>
                        <h2 className="text-2xl font-bold text-green-600">
                            {
                                donors.filter(
                                    (d) =>
                                        d.status?.toLowerCase() === "confirmed"
                                ).length
                            }
                        </h2>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white p-10 rounded-xl text-center">
                        Loading appointments...
                    </div>
                ) : filteredDonors.length > 0 ? (
                    <div className="space-y-6">
                        {filteredDonors.map((donor) => {
                            const id = donor._id || donor.id;
                            const isUpdating = updatingId === id;
                            const status = donor.status || "Pending";
                            const isPending =
                                status.toLowerCase() === "pending";

                            return (
                                <div
                                    key={id}
                                    className="bg-white rounded-xl shadow p-6"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-red-600 flex gap-2 items-center">
                                                <FaUser />
                                                {donor.donorName || "Donor"}
                                            </h2>

                                            <p className="mt-3 flex gap-2 items-center">
                                                <FaTint className="text-red-600" />
                                                Blood group:{" "}
                                                <b>{donor.bloodGroup || "N/A"}</b>
                                            </p>

                                            <p className="flex gap-2 items-center mt-2">
                                                <FaPhoneAlt className="text-red-600" />
                                                {donor.phone || donor.donorPhone || "N/A"}
                                            </p>

                                            <p className="flex gap-2 items-center mt-2">
                                                <FaMapMarkerAlt className="text-red-600" />
                                                {donor.district || donor.city || "N/A"}
                                            </p>

                                            <p className="mt-2 text-gray-600">
                                                Email:{" "}
                                                {donor.donorEmail || donor.email || "N/A"}
                                            </p>
                                        </div>

                                        <span
                                            className={`px-4 py-2 rounded-full h-fit font-medium ${status.toLowerCase() === "confirmed"
                                                ? "bg-green-100 text-green-700"
                                                : status.toLowerCase() === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : status.toLowerCase() === "cancelled"
                                                        ? "bg-gray-200 text-gray-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {status}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid sm:grid-cols-3 gap-4">
                                        <div>
                                            <b className="flex items-center gap-2">
                                                <FaCalendarAlt />
                                                Date
                                            </b>
                                            <p>
                                                {formatDate(
                                                    donor.date ||
                                                    donor.appointmentDate
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <b>Time</b>
                                            <p>{donor.time || "N/A"}</p>
                                        </div>

                                        <div>
                                            <b>Hospital</b>
                                            <p>{donor.hospital || "N/A"}</p>
                                        </div>
                                    </div>


                                    {isPending && (
                                        <div className="flex flex-wrap gap-4 mt-6">
                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() => updateStatus(donor, "Confirmed")}
                                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 shadow transition"
                                            >
                                                <FaCheck />
                                                {isUpdating ? "Processing..." : "Approve Appointment"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() => updateStatus(donor, "Rejected")}
                                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 shadow transition"
                                            >
                                                <FaTimes />
                                                {isUpdating ? "Processing..." : "Reject Appointment"}
                                            </button>
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white p-10 rounded-xl text-center text-gray-500">
                        {search
                            ? "No matching appointments found."
                            : "No appointments found for this hospital."}
                    </div>
                )}
            </main>
        </div>
    );
}

export default DonorManagement;
