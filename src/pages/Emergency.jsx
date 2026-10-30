
import Navbar from "../components/Navbar";
import axiosInstance from "../API/axiosInstance";

import {
    FaAmbulance,
    FaTint,
    FaHospital,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaClock,
    FaHeartbeat,
    FaArrowRight,
    FaSearch,
    FaBell,
    FaUsers,
    FaProcedures,
    FaSpinner,
    FaExclamationTriangle,
    FaRedo,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";

function Emergency() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [emergencyRequests, setEmergencyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch emergency requests from MongoDB
    const fetchEmergencyRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/emergencyRequests");

            console.log("Emergency API response:", response.data);

            // Handle different backend response formats
            let data = [];

            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response.data?.emergencyRequests)) {
                data = response.data.emergencyRequests;
            } else if (Array.isArray(response.data?.requests)) {
                data = response.data.requests;
            } else if (Array.isArray(response.data?.data)) {
                data = response.data.data;
            }

            console.log("Fetched emergency requests:", data);

            setEmergencyRequests(data);

        } catch (err) {
            console.error(
                "Emergency requests error:",
                err.response?.data || err.message
            );

            setEmergencyRequests([]);

            setError(
                err.response?.data?.message ||
                "Unable to load emergency requests. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmergencyRequests();
    }, [fetchEmergencyRequests]);

    // Show only active requests
    const activeRequests = useMemo(() => {
        return emergencyRequests.filter((request) => {
            return (
                String(request.status || "").trim().toLowerCase() === "active"
            );
        });
    }, [emergencyRequests]);

    // Search emergency requests
    const filteredRequests = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) return activeRequests;

        return activeRequests.filter((request) => {
            const searchableFields = [
                request.requesterName,
                request.hospital,
                request.district,
                request.bloodGroup,
                request.patientName,
                request.reason,
                request.contact,
            ];

            return searchableFields.some((field) =>
                String(field || "").toLowerCase().includes(searchText)
            );
        });
    }, [activeRequests, search]);

    // Statistics
    const totalRequests = activeRequests.length;

    const totalUnits = activeRequests.reduce(
        (total, request) =>
            total + (Number(request.units) || 0),
        0
    );

    const totalHospitals = new Set(
        activeRequests
            .map((request) =>
                request.requesterName || request.hospital
            )
            .filter(Boolean)
    ).size;

    const totalDistricts = new Set(
        activeRequests
            .map((request) => request.district)
            .filter(Boolean)
    ).size;

    // Blood group requirements
    const bloodGroups = [
        "A+", "A-", "B+", "B-",
        "AB+", "AB-", "O+", "O-",
    ];

    const bloodGroupRequirements = bloodGroups.map((group) => {
        const units = activeRequests
            .filter(
                (request) =>
                    String(request.bloodGroup || "").trim().toUpperCase() === group
            )
            .reduce(
                (total, request) =>
                    total + (Number(request.units) || 0),
                0
            );

        return { group, units };
    });

    const maxUnits = Math.max(
        ...bloodGroupRequirements.map((item) => item.units),
        1
    );

    // Format date
    const formatDate = (date) => {
        if (!date) return "As soon as possible";

        const formattedDate = new Date(date);

        if (Number.isNaN(formattedDate.getTime())) {
            return "Date not available";
        }

        return formattedDate.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    // Donate Now
    const handleDonate = (request) => {
        navigate("/login", {
            state: {
                requestId: request._id,
                emergencyRequest: {
                    _id: request._id,
                    requestedBy: request.requestedBy,
                    requesterId: request.requesterId,
                    requesterName: request.requesterName,
                    email: request.email,
                    patientName: request.patientName,
                    bloodGroup: request.bloodGroup,
                    units: request.units,
                    district: request.district,
                    hospital: request.hospital,
                    contact: request.contact,
                    reason: request.reason,
                    status: request.status,
                    createdAt: request.createdAt,
                },
            },
        });
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">

                {/* Hero Section */}
                <section className="bg-gradient-to-r from-red-800 via-red-600 to-red-400 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-20">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">

                            <div>
                                <span className="inline-flex items-center gap-2 bg-red-900 px-4 py-2 rounded-full animate-pulse">
                                    <FaBell />
                                    Live Emergency Alerts
                                </span>

                                <h1 className="text-5xl lg:text-6xl font-extrabold mt-6 leading-tight">
                                    Donate Blood,
                                    <br />
                                    Save Lives
                                </h1>

                                <p className="mt-6 text-lg text-red-100 leading-8">
                                    Respond to emergency blood requests
                                    from hospitals and become someone's
                                    real-life hero.
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl">
                                    <FaAmbulance className="text-9xl text-white mx-auto" />
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Statistics */}
                <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
                    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

                        <div className="bg-white rounded-2xl shadow-xl p-6 hover:-translate-y-2 transition">
                            <FaTint className="text-5xl text-red-600 mb-4" />
                            <h2 className="text-4xl font-bold text-red-600">
                                {loading ? "..." : totalRequests}
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Active Requests
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6 hover:-translate-y-2 transition">
                            <FaProcedures className="text-5xl text-orange-500 mb-4" />
                            <h2 className="text-4xl font-bold text-orange-500">
                                {loading ? "..." : totalUnits}
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Units Required
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6 hover:-translate-y-2 transition">
                            <FaHospital className="text-5xl text-blue-600 mb-4" />
                            <h2 className="text-4xl font-bold text-blue-600">
                                {loading ? "..." : totalHospitals}
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Requesting Hospitals
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6 hover:-translate-y-2 transition">
                            <FaMapMarkerAlt className="text-5xl text-green-600 mb-4" />
                            <h2 className="text-4xl font-bold text-green-600">
                                {loading ? "..." : totalDistricts}
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Districts
                            </p>
                        </div>

                    </div>
                </section>

                {/* Search */}
                <section className="max-w-7xl mx-auto px-6 mt-14">
                    <div className="relative">
                        <FaSearch className="absolute left-5 top-5 text-gray-400" />

                        <input
                            type="text"
                            placeholder="Search hospital, district, blood group or patient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border rounded-2xl pl-14 pr-5 py-4 shadow-md focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                </section>

                {/* Emergency Requests */}
                <section className="max-w-7xl mx-auto px-6 py-14">

                    <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-red-600">
                                Active Emergency Requests
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Urgent blood requirements from hospitals
                            </p>
                        </div>

                        <button
                            onClick={fetchEmergencyRequests}
                            disabled={loading}
                            className="flex items-center gap-2 bg-red-100 text-red-700 px-5 py-3 rounded-xl hover:bg-red-200 transition disabled:opacity-50"
                        >
                            <FaRedo className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
                            <FaSpinner className="text-5xl text-red-600 mx-auto animate-spin" />
                            <p className="mt-5 text-gray-600">
                                Loading emergency requests...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                            <FaExclamationTriangle className="text-5xl text-red-500 mx-auto" />

                            <h3 className="text-2xl font-bold mt-5">
                                Unable to Load Requests
                            </h3>

                            <p className="text-gray-600 mt-3">
                                {error}
                            </p>

                            <button
                                onClick={fetchEmergencyRequests}
                                className="mt-6 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && filteredRequests.length === 0 && (
                        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                            <FaTint className="text-6xl text-gray-300 mx-auto" />

                            <h3 className="text-2xl font-bold text-gray-700 mt-5">
                                No Emergency Requests Found
                            </h3>

                            <p className="text-gray-500 mt-3">
                                {search
                                    ? "Try another search term."
                                    : activeRequests.length === 0
                                        ? "There are currently no active emergency requests."
                                        : "No requests match your search."}
                            </p>
                        </div>
                    )}

                    {/* Request Cards */}
                    {!loading && !error && filteredRequests.length > 0 && (
                        <div className="grid lg:grid-cols-2 gap-8">

                            {filteredRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-red-200 hover:-translate-y-2 transition duration-300"
                                >

                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-red-800 to-red-600 text-white p-6 flex justify-between items-center gap-3">

                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold">
                                                {request.requesterName ||
                                                    request.hospital ||
                                                    "Hospital"}
                                            </h3>

                                            <p className="text-red-100 mt-2 text-sm">
                                                Request ID: {String(request._id || "").slice(-8)}
                                            </p>

                                            <p className="text-red-100 text-sm mt-1">
                                                Requested by: {request.requestedBy || "Hospital"}
                                            </p>
                                        </div>

                                        <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold whitespace-nowrap">
                                            {request.status || "Active"}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 md:p-8 space-y-5">

                                        <div className="grid grid-cols-2 gap-5">

                                            <div className="bg-red-50 rounded-xl p-4">
                                                <FaTint className="text-red-600 text-2xl mb-2" />

                                                <p className="text-gray-500 text-sm">
                                                    Blood Group
                                                </p>

                                                <h4 className="text-3xl font-bold text-red-700">
                                                    {request.bloodGroup || "N/A"}
                                                </h4>
                                            </div>

                                            <div className="bg-pink-50 rounded-xl p-4">
                                                <FaProcedures className="text-pink-600 text-2xl mb-2" />

                                                <p className="text-gray-500 text-sm">
                                                    Units Required
                                                </p>

                                                <h4 className="text-3xl font-bold text-pink-700">
                                                    {request.units ?? 0}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="space-y-4 text-gray-700">

                                            <div className="flex items-center gap-3">
                                                <FaUsers className="text-red-600 shrink-0" />
                                                Patient: {request.patientName || "Not specified"}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <FaMapMarkerAlt className="text-red-600 shrink-0" />
                                                District: {request.district || "Not specified"}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <FaPhoneAlt className="text-red-600 shrink-0" />
                                                {request.contact || "Contact not available"}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <FaHeartbeat className="text-red-600 shrink-0" />
                                                Reason: {request.reason || "Not specified"}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <FaClock className="text-red-600 shrink-0" />
                                                {formatDate(request.createdAt)}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDonate(request)}
                                            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-3 transition"
                                        >
                                            Donate Now
                                            <FaArrowRight />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Blood Group Requirement */}
                {!loading && !error && (
                    <section className="max-w-7xl mx-auto px-6 pb-16">
                        <div className="bg-white rounded-3xl shadow-xl p-10">

                            <h2 className="text-3xl md:text-4xl font-bold text-center text-red-600 mb-4">
                                Blood Group Requirement
                            </h2>

                            <p className="text-center text-gray-500 mb-10">
                                Units required from active emergency requests
                            </p>

                            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">

                                {bloodGroupRequirements.map((item) => (
                                    <div
                                        key={item.group}
                                        className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-lg transition"
                                    >
                                        <h3 className="text-2xl font-bold text-center">
                                            {item.group}
                                        </h3>

                                        <div className="w-full bg-gray-200 rounded-full h-4 mt-5">
                                            <div
                                                className="bg-red-600 h-4 rounded-full transition-all"
                                                style={{
                                                    width: `${(item.units / maxUnits) * 100}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="text-center mt-3 font-semibold">
                                            {item.units} Units Required
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Guidelines */}
                <section className="max-w-7xl mx-auto px-6 pb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-red-600 mb-12">
                        Emergency Donation Guidelines
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:-translate-y-2 transition">
                            <FaHeartbeat className="text-6xl text-red-600 mx-auto mb-5" />

                            <h3 className="text-2xl font-bold mb-3">
                                Stay Healthy
                            </h3>

                            <p className="text-gray-600 leading-7">
                                Ensure you are healthy, hydrated and have eaten
                                before donating blood.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:-translate-y-2 transition">
                            <FaHospital className="text-6xl text-blue-600 mx-auto mb-5" />

                            <h3 className="text-2xl font-bold mb-3">
                                Reach Hospital
                            </h3>

                            <p className="text-gray-600 leading-7">
                                Carry a valid ID card and contact the hospital
                                before travelling.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:-translate-y-2 transition">
                            <FaTint className="text-6xl text-pink-600 mx-auto mb-5" />

                            <h3 className="text-2xl font-bold mb-3">
                                Save Lives
                            </h3>

                            <p className="text-gray-600 leading-7">
                                Your eligible blood donation can make a
                                meaningful difference to someone in need.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Register Donor */}
                <section className="max-w-7xl mx-auto px-6 pb-20">
                    <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-12 text-center">

                        <FaHeartbeat className="text-7xl text-red-600 mx-auto animate-pulse mb-6" />

                        <h2 className="text-3xl md:text-5xl font-bold text-gray-800">
                            Become an Emergency Donor
                        </h2>

                        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-8">
                            Register today and help patients who urgently
                            need blood. Your contribution could save lives.
                        </p>

                        <button
                            onClick={() => navigate("/register/donor")}
                            className="mt-10 bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-xl text-lg font-bold shadow-lg transition"
                        >
                            Register as Donor
                        </button>
                    </div>
                </section>

            </div>
        </>
    );
}

export default Emergency;
