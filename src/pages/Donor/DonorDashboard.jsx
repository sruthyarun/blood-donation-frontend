
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import jsPDF from "jspdf";

import {
    FaTint,
    FaCalendarCheck,
    FaCertificate,
    FaHospital,
    FaClock,
    FaDownload,
    FaEye,
    FaExclamationCircle,
    FaRedo,
} from "react-icons/fa";

import DonorPanel from "../../components/donorPanel";
import axiosInstance from "../../API/axiosInstance";

function DonorDashboard() {
    const navigate = useNavigate();

    const reduxUser = useSelector(
        (state) => state.user.currentUser
    );

    const storedUser = (() => {
        try {
            return JSON.parse(
                localStorage.getItem("loggedInUser") || "null"
            );
        } catch {
            return null;
        }
    })();

    const user =
        reduxUser?.donor ||
        reduxUser ||
        storedUser?.donor ||
        storedUser;

    const donorEmail = String(user?.email || "")
        .trim()
        .toLowerCase();

    const donorBloodGroup = String(
        user?.bloodGroup || user?.donorBloodGroup || ""
    )
        .trim()
        .toUpperCase();

    const [appointments, setAppointments] = useState([]);
    const [emergencyRequests, setEmergencyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch dashboard data from the local Express/MongoDB backend.
    const fetchDashboardData = useCallback(async () => {
        if (!donorEmail) {
            setAppointments([]);
            setEmergencyRequests([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [appointmentsResponse, requestsResponse] =
                await Promise.all([
                    axiosInstance.get("/appointments"),
                    axiosInstance.get("/emergencyRequests"),
                ]);

            const appointmentData =
                appointmentsResponse.data?.appointments ??
                appointmentsResponse.data?.data ??
                appointmentsResponse.data;

            const requestData =
                requestsResponse.data?.emergencyRequests ??
                requestsResponse.data?.requests ??
                requestsResponse.data?.data ??
                requestsResponse.data;

            setAppointments(
                Array.isArray(appointmentData)
                    ? appointmentData
                    : []
            );

            setEmergencyRequests(
                Array.isArray(requestData)
                    ? requestData
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load donor dashboard:",
                err.response?.data || err.message
            );

            setError(
                "Unable to load dashboard data. Please check your backend connection."
            );
        } finally {
            setLoading(false);
        }
    }, [donorEmail]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Match appointment records to the logged-in donor.
    const donorAppointments = appointments.filter((appointment) => {
        const email = String(
            appointment.donorEmail ||
            appointment.email ||
            appointment.donor?.email ||
            ""
        )
            .trim()
            .toLowerCase();

        return email === donorEmail;
    });

    // Completed donations.
    const completedDonations = donorAppointments.filter(
        (appointment) =>
            String(appointment.status || "")
                .trim()
                .toLowerCase() === "completed"
    );

    const totalDonations = completedDonations.length;

    // Find the next confirmed appointment.
    const now = new Date();

    const getAppointmentDateTime = (appointment) => {
        const date = appointment.date || appointment.appointmentDate;
        const time = appointment.time || appointment.appointmentTime;

        if (!date) return null;

        const dateString =
            date instanceof Date
                ? date.toISOString().slice(0, 10)
                : String(date).slice(0, 10);

        const dateTime = new Date(
            time ? `${dateString}T${time} ` : `${dateString} T23: 59: 59`
        );

        return Number.isNaN(dateTime.getTime())
            ? null
            : dateTime;
    };

    const nextAppointment = donorAppointments
        .filter((appointment) => {
            const status = String(appointment.status || "")
                .trim()
                .toLowerCase();

            const appointmentDateTime =
                getAppointmentDateTime(appointment);

            return (
                status === "confirmed" &&
                appointmentDateTime &&
                appointmentDateTime >= now
            );
        })
        .sort(
            (a, b) =>
                getAppointmentDateTime(a) -
                getAppointmentDateTime(b)
        )[0];

    // Show the latest three completed donations.
    const recentDonations = [...completedDonations]
        .sort((a, b) => {
            const dateA = new Date(
                a.date || a.appointmentDate || a.createdAt || 0
            ).getTime();

            const dateB = new Date(
                b.date || b.appointmentDate || b.createdAt || 0
            ).getTime();

            return dateB - dateA;
        })
        .slice(0, 3);

    // Show emergency requests with exactly the same blood group.
    const matchingRequests = emergencyRequests
        .filter((request) => {
            const requestBloodGroup = String(
                request.bloodGroup || ""
            )
                .trim()
                .toUpperCase();

            const status = String(request.status || "")
                .trim()
                .toLowerCase();

            return (
                donorBloodGroup !== "" &&
                requestBloodGroup === donorBloodGroup &&
                ["pending", "active"].includes(status)
            );
        })
        .sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );

    // Display a hospital name regardless of whether it is a string or object.
    const getHospitalName = (record) => {
        if (typeof record?.hospital === "string") {
            return record.hospital;
        }

        return (
            record?.hospital?.hospitalName ||
            record?.hospital?.name ||
            record?.hospitalName ||
            "-"
        );
    };

    const formatDate = (date) => {
        if (!date) return "-";

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

    const formatTime = (time) => {
        if (!time) return "";

        if (/^\d{2}:\d{2}$/.test(time)) {
            const [hours, minutes] = time.split(":").map(Number);
            const suffix = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;

            return `${displayHours}:${String(minutes).padStart(
                2,
                "0"
            )
                } ${suffix} `;
        }

        return String(time);
    };

    // Generate a PDF certificate for a completed donation.
    const generateCertificate = (donation) => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const donorName =
            user?.fullName ||
            user?.name ||
            donation.donorName ||
            donation.donor?.fullName ||
            "Blood Donor";

        const donationDate = formatDate(
            donation.date ||
            donation.appointmentDate ||
            donation.createdAt
        );

        const hospitalName = getHospitalName(donation);

        const certificateId =
            donation.certificateId ||
            donation._id ||
            donation.id ||
            "N/A";

        // Certificate border.
        doc.setDrawColor(180, 20, 35);
        doc.setLineWidth(1.5);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        doc.setDrawColor(210, 80, 90);
        doc.setLineWidth(0.5);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Certificate heading.
        doc.setTextColor(170, 20, 35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.text(
            "BLOOD DONATION CERTIFICATE",
            pageWidth / 2,
            38,
            { align: "center" }
        );

        doc.setTextColor(70, 70, 70);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(13);
        doc.text(
            "Certificate of Appreciation",
            pageWidth / 2,
            49,
            { align: "center" }
        );

        doc.setFontSize(12);
        doc.text(
            "This certificate is presented to",
            pageWidth / 2,
            66,
            { align: "center" }
        );

        doc.setTextColor(170, 20, 35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(25);
        doc.text(
            donorName,
            pageWidth / 2,
            82,
            { align: "center" }
        );

        doc.setTextColor(65, 65, 65);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        doc.text(
            "In recognition of their completed blood donation.",
            pageWidth / 2,
            96,
            { align: "center" }
        );

        // Donation details.
        doc.setFont("helvetica", "bold");
        doc.text("Blood Group:", 55, 116);
        doc.text("Donation Date:", 55, 128);
        doc.text("Hospital:", 55, 140);

        doc.setFont("helvetica", "normal");
        doc.text(
            String(donation.bloodGroup || donorBloodGroup || "N/A"),
            95,
            116
        );
        doc.text(String(donationDate), 95, 128);

        const hospitalLines = doc.splitTextToSize(
            String(hospitalName),
            115
        );

        doc.text(hospitalLines, 95, 140);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(
            `Certificate Reference: ${String(certificateId)} `,
            pageWidth / 2,
            pageHeight - 23,
            { align: "center" }
        );

        doc.setFontSize(10);
        doc.text(
            "Thank you for helping save lives.",
            pageWidth / 2,
            pageHeight - 17,
            { align: "center" }
        );

        return doc;
    };

    // Open the generated certificate for viewing.
    const handleViewCertificate = (donation) => {
        try {
            const doc = generateCertificate(donation);
            const pdfUrl = doc.output("bloburl");

            const certificateWindow = window.open(
                pdfUrl,
                "_blank"
            );

            if (!certificateWindow) {
                alert(
                    "Your browser blocked the certificate popup. Please allow popups and try again."
                );
            }
        } catch (err) {
            console.error("Unable to generate certificate:", err);
            alert("Unable to generate the certificate. Please try again.");
        }
    };

    // Download the generated certificate.
    const handleDownloadCertificate = (donation, index) => {
        try {
            const doc = generateCertificate(donation);

            const donationId =
                donation._id ||
                donation.id ||
                `donation - ${index + 1} `;

            doc.save(`Blood - Donation - Certificate - ${donationId}.pdf`);
        } catch (err) {
            console.error("Unable to download certificate:", err);
            alert("Unable to download the certificate. Please try again.");
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow text-center">
                    <h2 className="text-2xl font-semibold mb-4">
                        Please Login First
                    </h2>

                    <button
                        onClick={() => navigate("/login")}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <DonorPanel />

            <main className="flex-1 min-w-0 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h2 className="text-3xl font-bold">
                        Welcome, {user.fullName || user.name || "Donor"}
                    </h2>

                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 px-4 py-2 rounded-lg"
                    >
                        <FaRedo />
                        Refresh
                    </button>
                </div>

                {loading && (
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6">
                        Loading dashboard data...
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                        <p>{error}</p>

                        <button
                            onClick={fetchDashboardData}
                            className="mt-3 inline-flex items-center gap-2 underline font-semibold"
                        >
                            <FaRedo />
                            Try Again
                        </button>
                    </div>
                )}

                {/* Dashboard statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500">Blood Group</h3>
                            <FaTint className="text-red-600 text-2xl" />
                        </div>

                        <p className="text-3xl font-bold text-red-600 mt-3">
                            {donorBloodGroup || "-"}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500">Total Donations</h3>
                            <FaTint className="text-green-600 text-2xl" />
                        </div>

                        <p className="text-3xl font-bold text-green-600 mt-3">
                            {totalDonations}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500">Next Appointment</h3>
                            <FaCalendarCheck className="text-blue-600 text-2xl" />
                        </div>

                        <p className="font-semibold mt-3">
                            {nextAppointment
                                ? formatDate(
                                    nextAppointment.date ||
                                    nextAppointment.appointmentDate
                                )
                                : "No Upcoming Appointment"}
                        </p>

                        {nextAppointment && (
                            <p className="text-gray-500 mt-1">
                                {formatTime(
                                    nextAppointment.time ||
                                    nextAppointment.appointmentTime
                                )}
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500">Certificates</h3>
                            <FaCertificate className="text-purple-600 text-2xl" />
                        </div>

                        <p className="text-3xl font-bold text-purple-600 mt-3">
                            {totalDonations}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Completed donations
                        </p>
                    </div>
                </div>

                {/* Upcoming appointment */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <section className="bg-white rounded-xl shadow p-6">
                        <h3 className="text-xl font-bold mb-5 text-red-600">
                            Upcoming Appointment
                        </h3>

                        {nextAppointment ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <FaHospital className="text-red-600 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Hospital
                                        </p>
                                        <p className="font-semibold">
                                            {getHospitalName(nextAppointment)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FaCalendarCheck className="text-red-600 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Appointment Date
                                        </p>
                                        <p className="font-medium">
                                            {formatDate(
                                                nextAppointment.date ||
                                                nextAppointment.appointmentDate
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FaClock className="text-red-600 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Appointment Time
                                        </p>
                                        <p className="font-medium">
                                            {formatTime(
                                                nextAppointment.time ||
                                                nextAppointment.appointmentTime
                                            ) || "-"}
                                        </p>
                                    </div>
                                </div>

                                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    {nextAppointment.status}
                                </span>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    No upcoming appointments.
                                </p>

                                <button
                                    onClick={() => navigate("/appointments")}
                                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Recent completed donations and certificates */}
                    <section className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <FaCertificate className="text-red-600 text-xl" />
                            <h3 className="text-xl font-bold text-red-600">
                                Recent Donations & Certificates
                            </h3>
                        </div>

                        {recentDonations.length > 0 ? (
                            <div className="space-y-4">
                                {recentDonations.map((donation, index) => (
                                    <div
                                        key={
                                            donation._id ||
                                            donation.id ||
                                            index
                                        }
                                        className="bg-red-50 border border-red-100 rounded-xl p-4"
                                    >
                                        <div className="flex flex-wrap justify-between items-start gap-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">
                                                    {getHospitalName(donation)}
                                                </h4>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Donation Date
                                                </p>

                                                <p className="font-medium">
                                                    {formatDate(
                                                        donation.date ||
                                                        donation.appointmentDate ||
                                                        donation.createdAt
                                                    )}
                                                </p>

                                                <p className="text-sm text-gray-600 mt-1">
                                                    Blood Group:{" "}
                                                    {donation.bloodGroup ||
                                                        donorBloodGroup ||
                                                        "-"}
                                                </p>
                                            </div>

                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                Completed
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 mt-4">
                                            <button
                                                onClick={() =>
                                                    handleViewCertificate(donation)
                                                }
                                                className="inline-flex items-center gap-2 bg-white border border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg"
                                            >
                                                <FaEye />
                                                View Certificate
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDownloadCertificate(
                                                        donation,
                                                        index
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                            >
                                                <FaDownload />
                                                Download PDF
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <FaCertificate className="text-4xl text-gray-300 mx-auto mb-3" />

                                <h4 className="text-lg font-semibold text-gray-700">
                                    No Certificates Yet
                                </h4>

                                <p className="text-gray-500 mt-2">
                                    Certificates are available for your completed donations.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Emergency blood requests */}
                <section className="bg-white rounded-xl shadow p-6 mt-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <h3 className="text-xl font-bold text-red-600">
                            Emergency Blood Requests
                        </h3>

                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                            Your group: {donorBloodGroup || "Not available"}
                        </span>
                    </div>

                    {matchingRequests.length > 0 ? (
                        <div className="space-y-4">
                            {matchingRequests.map((request, index) => (
                                <div
                                    key={request._id || request.id || index}
                                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200 py-4 last:border-b-0"
                                >
                                    <div>
                                        <p className="font-semibold text-lg text-red-600">
                                            {request.bloodGroup} Blood Needed
                                        </p>

                                        <p className="text-gray-700 mt-1">
                                            {getHospitalName(request)}
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {request.city ||
                                                request.district ||
                                                "-"}
                                            {request.state
                                                ? `, ${request.state} `
                                                : ""}
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Units Required: {request.units ?? "-"}
                                        </p>

                                        {request.requiredDate && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Required Date:{" "}
                                                {formatDate(request.requiredDate)}
                                            </p>
                                        )}

                                        <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                                            {request.status}
                                        </span>
                                    </div>


                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            {loading ? (
                                <p className="text-gray-500">
                                    Loading emergency requests...
                                </p>
                            ) : !donorBloodGroup ? (
                                <p className="text-gray-500">
                                    Your blood group is missing from your profile.
                                    Please update your donor profile.
                                </p>
                            ) : (
                                <div>
                                    <FaExclamationCircle className="text-3xl text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        No active emergency requests match your blood group ({donorBloodGroup}).
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default DonorDashboard;
