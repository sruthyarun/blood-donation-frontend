
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaTint,
    FaHospital,
    FaUser,
    FaMapMarkerAlt,
    FaPhone,
    FaSearch,
    FaClock,
    FaExclamationTriangle,
    FaRedo,
} from "react-icons/fa";

import DonorPanel from "../../components/donorPanel";
import axiosInstance from "../../API/axiosInstance";

function DonorEmergencyRequests() {
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

    const donorBloodGroup = String(
        user?.bloodGroup || user?.donorBloodGroup || ""
    )
        .trim()
        .toUpperCase();

    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch emergency requests from the local backend
    const loadEmergencyRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                "/emergencyRequests"
            );

            const result = response.data;

            const data = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.requests)
                        ? result.requests
                        : [];

            // Show only active requests matching the donor's blood group
            const matchingRequests = data.filter((item) => {
                const requestBloodGroup = String(
                    item.bloodGroup || ""
                )
                    .trim()
                    .toUpperCase();

                const isActive =
                    String(item.status || "")
                        .trim()
                        .toLowerCase() === "active";

                return (
                    isActive &&
                    donorBloodGroup !== "" &&
                    requestBloodGroup === donorBloodGroup
                );
            });

            setRequests(matchingRequests);
        } catch (err) {
            console.error(
                "Failed to load emergency requests:",
                err.response?.data || err
            );

            setRequests([]);

            setError(
                err.response?.data?.message ||
                "Unable to load emergency requests. Please check your backend."
            );
        } finally {
            setLoading(false);
        }
    }, [donorBloodGroup]);

    useEffect(() => {
        loadEmergencyRequests();
    }, [loadEmergencyRequests]);

    // Search only within matching blood-group requests
    const filteredRequests = requests.filter((item) => {
        const query = search.trim().toLowerCase();

        const bloodGroup = String(item.bloodGroup || "")
            .toLowerCase();

        const district = String(
            item.district || item.city || ""
        ).toLowerCase();

        const hospital =
            typeof item.hospital === "string"
                ? item.hospital
                : item.hospital?.hospitalName ||
                item.hospitalName ||
                "";

        return (
            bloodGroup.includes(query) ||
            district.includes(query) ||
            hospital.toLowerCase().includes(query)
        );
    });

    // Format date safely
    const formatDate = (date) => {
        if (!date) return "Date not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Date not available";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Get hospital name
    const getHospitalName = (request) => {
        if (typeof request.hospital === "string") {
            return request.hospital;
        }

        return (
            request.hospital?.hospitalName ||
            request.hospitalName ||
            "Hospital not specified"
        );
    };

    // Contact the requester
    const handleRespond = (request) => {
        const contact = String(
            request.contact ||
            request.phone ||
            request.contactNumber ||
            ""
        ).trim();

        if (!contact) {
            window.alert(
                "Contact information is not available for this request."
            );
            return;
        }

        const confirmed = window.confirm(
            `Contact ${contact} regarding the ${request.bloodGroup} blood request ? `
        );

        if (confirmed) {
            window.location.href = `tel:${contact.replace(/[^\d+]/g, "")} `;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <DonorPanel />

            <main className="flex-1 min-w-0 p-4 md:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Emergency Blood Requests
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Find urgent requests matching your blood group.
                        </p>

                        <p className="mt-2 text-red-600 font-semibold">
                            Your Blood Group:{" "}
                            {donorBloodGroup || "Not available"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadEmergencyRequests}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        <FaRedo />
                        Refresh
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center mb-8">
                    <FaSearch className="text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search hospital or district"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="ml-3 outline-none w-full bg-transparent"
                    />
                </div>

                {/* Missing blood group */}
                {!donorBloodGroup && (
                    <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                        <p className="font-semibold">
                            Donor blood group not found.
                        </p>

                        <p className="mt-1 text-sm">
                            Please update your donor profile with your blood group and log in again if needed.
                        </p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
                        Loading emergency requests...
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                        <div className="flex items-center gap-2 font-semibold">
                            <FaExclamationTriangle />
                            Unable to load requests
                        </div>

                        <p className="mt-2">{error}</p>

                        <button
                            type="button"
                            onClick={loadEmergencyRequests}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Matching requests */}
                {!loading && !error && (
                    <>
                        <p className="text-gray-600 mb-4">
                            Matching active requests:{" "}
                            <span className="font-bold text-red-600">
                                {filteredRequests.length}
                            </span>
                        </p>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map(
                                    (request, index) => {
                                        const requestId =
                                            request._id ||
                                            request.id ||
                                            `request - ${index} `;

                                        const contact = String(
                                            request.contact ||
                                            request.phone ||
                                            request.contactNumber ||
                                            ""
                                        ).trim();

                                        return (
                                            <div
                                                key={requestId}
                                                className="bg-white rounded-2xl shadow-lg p-6"
                                            >
                                                {/* Blood group and status */}
                                                <div className="flex flex-wrap justify-between items-center gap-3">
                                                    <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                                                        <FaTint />
                                                        {request.bloodGroup}
                                                    </h2>

                                                    <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm font-semibold">
                                                        {request.status}
                                                    </span>
                                                </div>

                                                {/* Request details */}
                                                <div className="mt-5 space-y-4">
                                                    <p className="flex items-start gap-2 text-gray-700">
                                                        <FaUser className="text-red-600 mt-1 shrink-0" />
                                                        <span>
                                                            Patient:{" "}
                                                            <b>
                                                                {request.patientName ||
                                                                    "Not specified"}
                                                            </b>
                                                        </span>
                                                    </p>

                                                    <p className="flex items-start gap-2 text-gray-700">
                                                        <FaHospital className="text-red-600 mt-1 shrink-0" />
                                                        <span>
                                                            {getHospitalName(request)}
                                                        </span>
                                                    </p>

                                                    <p className="flex items-start gap-2 text-gray-700">
                                                        <FaMapMarkerAlt className="text-red-600 mt-1 shrink-0" />
                                                        <span>
                                                            {request.district ||
                                                                request.city ||
                                                                "District not specified"}
                                                        </span>
                                                    </p>

                                                    <p className="text-gray-700">
                                                        Required Units:{" "}
                                                        <b>
                                                            {request.units ??
                                                                "Not specified"}
                                                        </b>
                                                    </p>

                                                    <p className="text-gray-700">
                                                        Requested By:{" "}
                                                        <b>
                                                            {request.requestedBy ||
                                                                request.recipientName ||
                                                                request.contactPerson ||
                                                                "Not specified"}
                                                        </b>
                                                    </p>

                                                    <p className="text-gray-700 break-words">
                                                        Reason:{" "}
                                                        <b>
                                                            {request.reason ||
                                                                "Not specified"}
                                                        </b>
                                                    </p>

                                                    <p className="flex items-center gap-2 text-gray-500">
                                                        <FaClock />
                                                        {formatDate(
                                                            request.createdAt ||
                                                            request.date
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Contact and response */}
                                                <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                                    <div className="flex items-center gap-2 text-gray-700 break-all">
                                                        <FaPhone className="text-green-600 shrink-0" />
                                                        <span>
                                                            {contact ||
                                                                "Contact not available"}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRespond(request)
                                                        }
                                                        disabled={!contact}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        Respond
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }
                                )
                            ) : (
                                <div className="xl:col-span-2 bg-white rounded-xl shadow p-10 text-center">
                                    <FaTint className="text-4xl text-gray-300 mx-auto mb-4" />

                                    <h2 className="text-xl font-semibold text-gray-800">
                                        No Matching Emergency Requests
                                    </h2>

                                    <p className="text-gray-500 mt-2">
                                        {search.trim()
                                            ? "No matching blood requests match your search."
                                            : donorBloodGroup
                                                ? `There are no active ${donorBloodGroup} blood requests currently.`
                                                : "Add your blood group to your donor profile to see matching requests."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default DonorEmergencyRequests;
