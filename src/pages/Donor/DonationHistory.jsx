
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaTint,
    FaHospital,
    FaCalendarAlt,
    FaCertificate,
    FaSearch,
    FaDownload,
} from "react-icons/fa";

import DonorPanel from "../../components/donorPanel";
import axiosInstance from "../../API/axiosInstance";
import jsPDF from "jspdf";

function DonationHistory() {
    const currentUser = useSelector(
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
        currentUser?.donor ||
        currentUser ||
        storedUser?.donor ||
        storedUser;

    const email = String(
        user?.email || user?.donorEmail || ""
    )
        .trim()
        .toLowerCase();

    const [donations, setDonations] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloadingId, setDownloadingId] = useState("");

    // Fetch completed appointments from the backend
    const fetchDonations = useCallback(async () => {
        if (!email) {
            setDonations([]);
            setError(
                "Unable to identify the logged-in donor. Please log in again."
            );
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                "/appointments",
                {
                    params: {
                        email,
                        status: "completed",
                    },
                }
            );

            const result = response.data;

            const appointments = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.appointments)
                        ? result.appointments
                        : [];

            const completedAppointments = appointments.filter(
                (item) => {
                    const appointmentEmail = String(
                        item.email ||
                        item.donorEmail ||
                        ""
                    )
                        .trim()
                        .toLowerCase();

                    const status = String(item.status || "")
                        .trim()
                        .toLowerCase();

                    return (
                        appointmentEmail === email &&
                        status === "completed"
                    );
                }
            );

            setDonations(completedAppointments);
        } catch (err) {
            console.error(
                "Donation history error:",
                err.response?.data || err
            );

            setDonations([]);

            setError(
                err.response?.data?.message ||
                "Unable to load donation history. Please check the appointments API."
            );
        } finally {
            setLoading(false);
        }
    }, [email]);

    useEffect(() => {
        fetchDonations();
    }, [fetchDonations]);

    // Get hospital name safely
    const getHospitalName = (item) => {
        if (typeof item.hospital === "string") {
            return item.hospital;
        }

        if (item.hospital?.hospitalName) {
            return item.hospital.hospitalName;
        }

        if (typeof item.hospitalName === "string") {
            return item.hospitalName;
        }

        if (typeof item.destinationName === "string") {
            return item.destinationName;
        }

        return "Not available";
    };

    // Get donation date
    const getAppointmentDate = (item) =>
        item.donationDate ||
        item.appointmentDate ||
        item.date ||
        item.createdAt ||
        null;

    // Format date for the page
    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Get blood group
    const getBloodGroup = (item) =>
        item.bloodGroup ||
        item.donorBloodGroup ||
        user?.bloodGroup ||
        "Not available";

    // Get donor name
    const getDonorName = () =>
        user?.fullName ||
        user?.donorName ||
        user?.name ||
        "Blood Donor";

    // Download certificate for a selected donation
    const handleDownloadCertificate = (donation, index) => {
        const donationId = String(
            donation._id ||
            donation.id ||
            `DONATION - ${index + 1} `
        );

        try {
            setDownloadingId(donationId);

            const doc = new jsPDF("landscape", "mm", "a4");

            const donorName = getDonorName();
            const hospitalName = getHospitalName(donation);
            const bloodGroup = getBloodGroup(donation);

            const dateValue = getAppointmentDate(donation);

            const donationDate = formatDate(dateValue);

            const certificateId =
                donation._id ||
                donation.id ||
                `DONATION - ${index + 1} `;

            // Page dimensions: A4 landscape
            const pageWidth = 297;
            const pageHeight = 210;

            // Outer border
            doc.setDrawColor(160, 0, 0);
            doc.setLineWidth(1.5);
            doc.rect(10, 10, 277, 190);

            // Inner border
            doc.setDrawColor(205, 160, 110);
            doc.setLineWidth(0.5);
            doc.rect(15, 15, 267, 180);

            // Decorative top line
            doc.setDrawColor(160, 0, 0);
            doc.setLineWidth(1);
            doc.line(75, 24, 222, 24);

            // Main heading
            doc.setTextColor(160, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(25);

            doc.text(
                "BLOOD DONATION CERTIFICATE",
                pageWidth / 2,
                38,
                { align: "center" }
            );

            // Subtitle
            doc.setTextColor(90, 90, 90);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(13);

            doc.text(
                "CERTIFICATE OF APPRECIATION",
                pageWidth / 2,
                48,
                { align: "center" }
            );

            doc.setDrawColor(160, 0, 0);
            doc.line(65, 55, 232, 55);

            // Introductory text
            doc.setTextColor(55, 55, 55);
            doc.setFontSize(14);

            doc.text(
                "This certificate is proudly presented to",
                pageWidth / 2,
                70,
                { align: "center" }
            );

            // Donor name
            doc.setTextColor(160, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(25);

            const donorNameLines = doc.splitTextToSize(
                donorName,
                220
            );

            doc.text(
                donorNameLines,
                pageWidth / 2,
                84,
                { align: "center" }
            );

            // Appreciation message
            doc.setTextColor(55, 55, 55);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(13);

            doc.text(
                "In recognition of your valuable contribution through blood donation.",
                pageWidth / 2,
                101,
                { align: "center" }
            );

            doc.text(
                "Your generosity helps support patients and save lives.",
                pageWidth / 2,
                110,
                { align: "center" }
            );

            // Donation details
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(50, 50, 50);

            doc.text(
                `Blood Group: ${bloodGroup} `,
                40,
                129
            );

            doc.text(
                `Donation Date: ${donationDate} `,
                155,
                129
            );

            // Hospital name may be long, so wrap it
            doc.setFont("helvetica", "normal");

            const hospitalLines = doc.splitTextToSize(
                `Hospital / Center: ${hospitalName} `,
                215
            );

            doc.text(hospitalLines, 40, 141);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);

            doc.text(
                `Certificate Reference: ${certificateId} `,
                40,
                158
            );

            // Footer separator
            doc.setDrawColor(160, 0, 0);
            doc.line(110, 169, 187, 169);

            doc.setTextColor(50, 50, 50);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);

            doc.text(
                "Blood Donation System",
                pageWidth / 2,
                178,
                { align: "center" }
            );

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);

            doc.text(
                "Thank you for being a life saver!",
                pageWidth / 2,
                185,
                { align: "center" }
            );

            // Download PDF
            doc.save(
                `Blood_Donation_Certificate_${donationId}.pdf`
            );
        } catch (err) {
            console.error(
                "Certificate download error:",
                err
            );

            window.alert(
                "Unable to generate the certificate. Please try again."
            );
        } finally {
            setDownloadingId("");
        }
    };

    // Search and sort donations
    const filtered = donations
        .filter((item) => {
            const query = search.trim().toLowerCase();

            return (
                getHospitalName(item)
                    .toLowerCase()
                    .includes(query) ||
                getBloodGroup(item)
                    .toLowerCase()
                    .includes(query)
            );
        })
        .sort((a, b) => {
            const dateA = new Date(
                getAppointmentDate(a) || 0
            ).getTime();

            const dateB = new Date(
                getAppointmentDate(b) || 0
            ).getTime();

            return dateB - dateA;
        });

    // Summary cards
    const totalDonations = donations.length;

    const hospitalsVisited = new Set(
        donations
            .map(getHospitalName)
            .filter((name) => name !== "Not available")
    ).size;

    const lastDonation = [...donations].sort(
        (a, b) =>
            new Date(getAppointmentDate(b) || 0).getTime() -
            new Date(getAppointmentDate(a) || 0).getTime()
    )[0];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <DonorPanel />

            <main className="flex-1 min-w-0 p-4 md:p-8">
                {/* Page heading and search */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Donation History
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Your completed blood donations
                        </p>
                    </div>

                    <div className="flex items-center bg-white rounded-lg shadow px-4 py-3">
                        <FaSearch className="text-gray-500" />

                        <input
                            type="text"
                            placeholder="Search hospital or blood group"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="ml-2 outline-none w-full"
                        />
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <p className="text-center py-8 text-gray-500">
                        Loading donation history...
                    </p>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={fetchDonations}
                            className="mt-3 underline font-semibold"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Donation history */}
                {!loading && !error && (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow p-6 text-center text-red-600">
                                <FaTint className="text-3xl mx-auto mb-3" />

                                <h2 className="text-3xl font-bold">
                                    {totalDonations}
                                </h2>

                                <p className="text-gray-600">
                                    Total Donations
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6 text-center text-red-600">
                                <FaHospital className="text-3xl mx-auto mb-3" />

                                <h2 className="text-3xl font-bold">
                                    {hospitalsVisited}
                                </h2>

                                <p className="text-gray-600">
                                    Hospitals Visited
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6 text-center text-red-600">
                                <FaCalendarAlt className="text-3xl mx-auto mb-3" />

                                <h2 className="text-lg font-bold">
                                    {lastDonation
                                        ? formatDate(
                                            getAppointmentDate(
                                                lastDonation
                                            )
                                        )
                                        : "No Donations"}
                                </h2>

                                <p className="text-gray-600">
                                    Last Donation
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6 text-center text-red-600">
                                <FaCertificate className="text-3xl mx-auto mb-3" />

                                <h2 className="text-3xl font-bold">
                                    {totalDonations}
                                </h2>

                                <p className="text-gray-600">
                                    Completed Donations
                                </p>
                            </div>
                        </div>

                        {/* Donations table */}
                        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                            <table className="w-full min-w-[850px]">
                                <thead className="bg-red-600 text-white">
                                    <tr>
                                        <th className="py-4 px-4 text-left">
                                            Date
                                        </th>

                                        <th className="px-4 text-left">
                                            Hospital
                                        </th>

                                        <th className="px-4 text-left">
                                            Blood Group
                                        </th>

                                        <th className="px-4 text-left">
                                            Units
                                        </th>

                                        <th className="px-4 text-left">
                                            Status
                                        </th>

                                        <th className="px-4 text-center">
                                            Certificate
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filtered.length > 0 ? (
                                        filtered.map(
                                            (item, index) => {
                                                const donationId =
                                                    String(
                                                        item._id ||
                                                        item.id ||
                                                        `DONATION - ${index + 1} `
                                                    );

                                                return (
                                                    <tr
                                                        key={donationId}
                                                        className="border-b hover:bg-gray-50"
                                                    >
                                                        <td className="py-4 px-4">
                                                            {formatDate(
                                                                getAppointmentDate(
                                                                    item
                                                                )
                                                            )}
                                                        </td>

                                                        <td className="px-4">
                                                            {getHospitalName(
                                                                item
                                                            )}
                                                        </td>

                                                        <td className="px-4">
                                                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                                                                {getBloodGroup(
                                                                    item
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td className="px-4">
                                                            {item.units || 1}
                                                        </td>

                                                        <td className="px-4">
                                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full capitalize">
                                                                {item.status}
                                                            </span>
                                                        </td>

                                                        <td className="text-center px-4 py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDownloadCertificate(
                                                                        item,
                                                                        index
                                                                    )
                                                                }
                                                                disabled={
                                                                    downloadingId ===
                                                                    donationId
                                                                }
                                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                <FaDownload />

                                                                {downloadingId ===
                                                                    donationId
                                                                    ? "Generating..."
                                                                    : "Download Certificate"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="text-center py-8 text-gray-500"
                                            >
                                                {search.trim()
                                                    ? "No donations match your search."
                                                    : "No completed donations found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default DonationHistory;
