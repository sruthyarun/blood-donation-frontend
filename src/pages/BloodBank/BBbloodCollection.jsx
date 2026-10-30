
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaSearch,
    FaTint,
    FaUser,
    FaCalendarAlt,
    FaClock,
    FaSpinner,
    FaEye,
    FaTimes,
    FaEnvelope,
    FaMapMarkerAlt,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

function BloodCollection() {
    const user = useSelector((state) => state.user.currentUser);

    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCollection, setSelectedCollection] = useState(null);

    const bloodBankId =
        user?._id ||
        user?.id ||
        user?.bloodBankId ||
        user?.userId;

    const bloodBankName =
        user?.bloodBankName ||
        user?.name ||
        "";

    // Fetch appointments from MongoDB
    const fetchCollections = useCallback(async () => {
        if (!bloodBankId) {
            setError("Blood bank information not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/appointments", {
                params: {
                    destinationType: "BloodBank",
                    destinationId: bloodBankId,
                    bloodBankId,
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

            // Filter appointments for the logged-in blood bank
            const bankAppointments = appointmentList.filter((item) => {
                const destinationId =
                    item.destinationId?._id ||
                    item.destinationId ||
                    item.bloodBankId?._id ||
                    item.bloodBankId;

                const destinationName =
                    item.destinationName ||
                    item.bloodBankName ||
                    item.hospital;

                const type = item.destinationType?.toLowerCase();

                const matchesId =
                    destinationId &&
                    String(destinationId) === String(bloodBankId);

                const matchesName =
                    bloodBankName &&
                    destinationName?.toLowerCase() ===
                    bloodBankName.toLowerCase();

                return (
                    matchesId ||
                    (type === "bloodbank" && matchesName) ||
                    (!type && matchesName)
                );
            });

            setAppointments(bankAppointments);
        } catch (err) {
            console.error("Blood collection fetch error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load blood collection records."
            );
        } finally {
            setLoading(false);
        }
    }, [bloodBankId, bloodBankName]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    // Get appointment date
    const getDate = (item) => {
        const value =
            item.date ||
            item.appointmentDate ||
            item.createdAt;

        if (!value) return null;

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    };

    const formatDate = (item) => {
        const date = getDate(item);

        if (!date) return "Not specified";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const isToday = (item) => {
        const date = getDate(item);

        if (!date) return false;

        const today = new Date();

        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const getStatus = (item) => {
        const status = item.status?.toLowerCase();

        if (status === "completed" || status === "done") {
            return "Collected";
        }

        if (status === "confirmed") {
            return "Pending";
        }

        return item.status || "Unknown";
    };

    // Show completed/done donations and confirmed appointments
    const collectionRecords = useMemo(() => {
        return appointments.filter((item) => {
            const status = item.status?.toLowerCase();

            return (
                status === "completed" ||
                status === "done" ||
                status === "confirmed"
            );
        });
    }, [appointments]);

    // Search
    const filteredData = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return collectionRecords;

        return collectionRecords.filter((item) => {
            const fields = [
                item.donorName,
                item.donorEmail,
                item.email,
                item.bloodGroup,
                item.district,
                item.phone,
                getStatus(item),
            ];

            return fields.some((field) =>
                String(field || "").toLowerCase().includes(value)
            );
        });
    }, [collectionRecords, search]);

    // Summary calculations
    const collectedRecords = collectionRecords.filter((item) => {
        const status = item.status?.toLowerCase();

        return status === "completed" || status === "done";
    });

    const pendingRecords = collectionRecords.filter(
        (item) => item.status?.toLowerCase() === "confirmed"
    );

    const totalCollections = collectedRecords.length;

    const totalDonors = new Set(
        collectedRecords.map(
            (item) =>
                item.donorId?._id ||
                item.donorId ||
                item.donorEmail ||
                item.email ||
                item._id
        )
    ).size;

    const todayCollections = collectedRecords.filter(isToday).length;

    // Your existing completion action adds 1 unit for an appointment.
    const totalUnits = collectedRecords.length;

    const getStatusStyle = (status) => {
        switch (status) {
            case "Collected":
                return "bg-green-100 text-green-700";

            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <BloodBankPanel />

            <div className="flex-1 min-w-0 p-4 md:p-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Blood Collection
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage blood donations received from donors.
                        </p>
                    </div>

                    <button
                        onClick={fetchCollections}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                        <FaCalendarAlt />
                        Refresh Records
                    </button>

                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                    <div className="bg-red-600 text-white rounded-xl p-6 shadow-lg">
                        <FaTint className="text-4xl mb-3" />

                        <h2 className="text-3xl font-bold">
                            {totalCollections}
                        </h2>

                        <p>Total Collections</p>
                    </div>

                    <div className="bg-blue-600 text-white rounded-xl p-6 shadow-lg">
                        <FaUser className="text-4xl mb-3" />

                        <h2 className="text-3xl font-bold">
                            {totalDonors}
                        </h2>

                        <p>Total Donors</p>
                    </div>

                    <div className="bg-green-600 text-white rounded-xl p-6 shadow-lg">
                        <FaCalendarAlt className="text-4xl mb-3" />

                        <h2 className="text-3xl font-bold">
                            {todayCollections}
                        </h2>

                        <p>Today's Collections</p>
                    </div>

                    <div className="bg-yellow-500 text-white rounded-xl p-6 shadow-lg">
                        <FaClock className="text-4xl mb-3" />

                        <h2 className="text-3xl font-bold">
                            {pendingRecords.length}
                        </h2>

                        <p>Pending Collections</p>
                    </div>

                </div>

                {/* Collection Information */}
                <div className="bg-white rounded-xl shadow p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Total units collected
                            </p>

                            <h2 className="text-2xl font-bold text-red-600">
                                {totalUnits} units
                            </h2>
                        </div>

                        <FaTint className="text-4xl text-red-500" />
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 mb-6">

                    <FaSearch className="text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search donor, blood group, email or district..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full outline-none text-gray-700"
                    />

                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center">
                        <FaSpinner className="animate-spin text-red-600 text-3xl mx-auto mb-3" />

                        <p className="text-gray-500">
                            Loading collection records...
                        </p>
                    </div>
                ) : (

                    /* Table */
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

                        <table className="w-full min-w-[850px]">

                            <thead className="bg-red-600 text-white">
                                <tr>
                                    <th className="py-4 px-4">Donor Name</th>
                                    <th className="px-4">Blood Group</th>
                                    <th className="px-4">Units</th>
                                    <th className="px-4">Date</th>
                                    <th className="px-4">Blood Bank</th>
                                    <th className="px-4">Status</th>
                                    <th className="px-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => {
                                        const status = getStatus(item);

                                        return (
                                            <tr
                                                key={item._id}
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

                                                <td className="text-red-600 font-bold px-4">
                                                    {item.bloodGroup || "-"}
                                                </td>

                                                <td className="px-4">
                                                    {status === "Collected" ? 1 : "-"}
                                                </td>

                                                <td className="px-4">
                                                    {formatDate(item)}
                                                </td>

                                                <td className="px-4">
                                                    {item.destinationName ||
                                                        item.bloodBankName ||
                                                        bloodBankName ||
                                                        "-"}
                                                </td>

                                                <td className="px-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(status)}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                <td className="px-4">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedCollection(item)
                                                        }
                                                        title="View details"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                                                    >
                                                        <FaEye />
                                                    </button>
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
                                                ? "No matching collection records found."
                                                : "No blood collection records found."}
                                        </td>
                                    </tr>
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

                {/* Details Modal */}
                {selectedCollection && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Collection Details
                                </h2>

                                <button
                                    onClick={() => setSelectedCollection(null)}
                                    className="text-gray-500 hover:text-red-600 text-xl"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-4">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Donor Name
                                    </p>

                                    <p className="font-semibold">
                                        {selectedCollection.donorName || "-"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaTint className="text-red-600" />
                                    <span>
                                        Blood Group:{" "}
                                        <strong>
                                            {selectedCollection.bloodGroup || "-"}
                                        </strong>
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaEnvelope className="text-blue-600" />
                                    <span>
                                        {selectedCollection.donorEmail ||
                                            selectedCollection.email ||
                                            "-"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaMapMarkerAlt className="text-red-600" />
                                    <span>
                                        {selectedCollection.district || "-"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-blue-600" />
                                    <span>
                                        {formatDate(selectedCollection)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FaClock className="text-blue-600" />
                                    <span>
                                        {selectedCollection.time || "Not specified"}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Blood Bank
                                    </p>

                                    <p className="font-semibold">
                                        {selectedCollection.destinationName ||
                                            selectedCollection.bloodBankName ||
                                            bloodBankName ||
                                            "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Status
                                    </p>

                                    <span
                                        className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(getStatus(selectedCollection))}`}
                                    >
                                        {getStatus(selectedCollection)}
                                    </span>
                                </div>

                            </div>

                            <button
                                onClick={() => setSelectedCollection(null)}
                                className="w-full mt-6 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg"
                            >
                                Close
                            </button>

                        </div>

                    </div>
                )}

                {/* Guidelines */}
                <div className="mt-8 bg-blue-100 border-l-4 border-blue-600 rounded-lg p-5">

                    <h3 className="font-bold text-blue-700">
                        Blood Collection Guidelines
                    </h3>

                    <p className="text-gray-700 mt-2">
                        Verify donor details and blood group before collection.
                        Ensure the donor is medically fit and record the completed
                        donation accurately. Only completed donations should be
                        added to blood inventory.
                    </p>

                </div>

            </div>
        </div>
    );
}

export default BloodCollection;
