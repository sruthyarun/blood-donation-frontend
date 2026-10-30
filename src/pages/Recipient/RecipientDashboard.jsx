
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
    FaTint,
    FaHospital,
    FaCheckCircle,
    FaClock,
    FaPhone,
    FaMapMarkerAlt,
    FaSyncAlt,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaClipboardList,
    FaArrowRight,
} from "react-icons/fa";

import RecipientPanel from "../../components/RecipientPanel";
import axiosInstance from "../../API/axiosInstance";

function getStoredUser() {
    try {
        return JSON.parse(
            localStorage.getItem("loggedInUser") || "null"
        );
    } catch {
        return null;
    }
}

function extractList(response, keys = []) {
    const data = response?.data;

    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }

    if (Array.isArray(data?.data)) return data.data;

    return [];
}

function formatDate(date) {
    if (!date) return "N/A";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
        ? "N/A"
        : parsed.toLocaleString();
}

function RecipientDashboard() {
    const reduxUser = useSelector(
        (state) => state.user.currentUser
    );

    const [storedUser] = useState(getStoredUser);

    const user =
        reduxUser?.recipient ||
        reduxUser ||
        storedUser?.recipient ||
        storedUser;

    const userEmail = String(user?.email || "")
        .trim()
        .toLowerCase();

    const recipientId = String(
        user?._id || user?.id || ""
    );

    const [requests, setRequests] = useState([]);
    const [emergencyRequests, setEmergencyRequests] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [emergencyError, setEmergencyError] = useState("");

    const loadDashboard = useCallback(async () => {
        if (!userEmail && !recipientId) {
            setRequests([]);
            setEmergencyRequests([]);
            setHospitals([]);
            setInventory([]);
            setLoading(false);
            setErrorMessage("Please log in to view your dashboard.");
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setEmergencyError("");

        const [
            requestsResult,
            hospitalsResult,
            inventoryResult,
            emergencyResult,
        ] = await Promise.allSettled([
            axiosInstance.get("/bloodRequests", {
                params: userEmail ? { email: userEmail } : {},
            }),

            axiosInstance.get("/hospitals"),

            axiosInstance.get("/bloodInventory"),

            axiosInstance.get("/emergencyRequests", {
                params: {
                    ...(userEmail ? { email: userEmail } : {}),
                    ...(recipientId
                        ? { requesterId: recipientId }
                        : {}),
                },
            }),
        ]);

        // Blood requests
        const bloodRequestList = extractList(
            requestsResult.status === "fulfilled"
                ? requestsResult.value
                : null,
            ["requests"]
        );

        setRequests(
            bloodRequestList
                .filter(
                    (item) =>
                        String(item.email || "")
                            .trim()
                            .toLowerCase() === userEmail
                )
                .sort((a, b) => {
                    const dateA = new Date(
                        a.createdAt || a.requiredDate || 0
                    ).getTime();

                    const dateB = new Date(
                        b.createdAt || b.requiredDate || 0
                    ).getTime();

                    return dateB - dateA;
                })
        );

        if (requestsResult.status === "rejected") {
            console.error(
                "Blood requests loading error:",
                requestsResult.reason?.response?.data ||
                requestsResult.reason?.message
            );

            setErrorMessage(
                "Unable to load blood requests. Please refresh."
            );
        }

        // Hospitals
        const hospitalList = extractList(
            hospitalsResult.status === "fulfilled"
                ? hospitalsResult.value
                : null,
            ["hospitals"]
        );

        setHospitals(
            hospitalList.filter(
                (hospital) =>
                    String(hospital.status || "Approved")
                        .toLowerCase() === "approved"
            )
        );

        // Blood inventory
        setInventory(
            extractList(
                inventoryResult.status === "fulfilled"
                    ? inventoryResult.value
                    : null,
                ["inventory"]
            )
        );

        // Emergency requests
        if (emergencyResult.status === "fulfilled") {
            const emergencyList = extractList(
                emergencyResult.value,
                ["emergencyRequests", "requests"]
            );

            const myEmergencyRequests = emergencyList
                .filter((item) => {
                    const requestEmail = String(item.email || "")
                        .trim()
                        .toLowerCase();

                    const requestRecipientId = String(
                        item.requesterId ||
                        item.recipientId ||
                        ""
                    );

                    const emailMatches =
                        userEmail &&
                        requestEmail === userEmail;

                    const idMatches =
                        recipientId &&
                        requestRecipientId === recipientId;

                    // Require an actual match; do not show all requests.
                    return Boolean(emailMatches || idMatches);
                })
                .sort((a, b) => {
                    return (
                        new Date(b.createdAt || b.updatedAt || 0)
                            .getTime() -
                        new Date(a.createdAt || a.updatedAt || 0)
                            .getTime()
                    );
                });

            setEmergencyRequests(myEmergencyRequests);
        } else {
            console.error(
                "Emergency requests loading error:",
                emergencyResult.reason?.response?.data ||
                emergencyResult.reason?.message
            );

            setEmergencyRequests([]);
            setEmergencyError(
                "Unable to load emergency requests. Check the emergency request API."
            );
        }

        setLoading(false);
    }, [userEmail, recipientId]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 md:flex">
                <RecipientPanel />

                <main className="flex-1 p-8 text-center">
                    <h2 className="mt-20 text-2xl font-bold">
                        Please Login First
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Sign in to view your recipient dashboard.
                    </p>
                </main>
            </div>
        );
    }

    const totalRequests = requests.length;

    const activeRequests = requests.filter(
        (item) =>
            String(item.status || "").toLowerCase() === "pending"
    ).length;

    const approvedRequests = requests.filter(
        (item) =>
            String(item.status || "").toLowerCase() === "approved"
    ).length;

    const latestRequest = requests[0] || null;

    const activeEmergencyRequests = emergencyRequests.filter(
        (item) =>
            ["active", "pending"].includes(
                String(item.status || "Active").toLowerCase()
            )
    ).length;

    const completedEmergencyRequests = emergencyRequests.filter(
        (item) =>
            String(item.status || "").toLowerCase() === "completed"
    ).length;

    const getDestination = (request) =>
        request.requestToName ||
        (typeof request.hospital === "string"
            ? request.hospital
            : request.hospital?.hospitalName) ||
        "Destination not specified";

    const getInventoryLabel = (item) =>
        item.bloodGroup ||
        item.group ||
        item.bloodType ||
        "Unknown";

    const getInventoryCount = () =>
        new Set(inventory.map(getInventoryLabel)).size;

    const getEmergencyStatusStyle = (status) => {
        switch (String(status || "Active").toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-700";

            case "cancelled":
                return "bg-gray-200 text-gray-700";

            default:
                return "bg-red-100 text-red-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 md:flex">
            <RecipientPanel />

            <main className="min-w-0 flex-1 p-4 sm:p-8">
                {/* Dashboard heading */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                            Welcome, {user.fullName || user.name || "Recipient"}
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Manage your blood requests and emergency
                            requirements.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">


                        <button
                            type="button"
                            onClick={loadDashboard}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <FaSyncAlt
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        <div className="flex items-center gap-2">
                            <FaExclamationTriangle />
                            <p>{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Statistics */}
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={<FaTint />}
                        color="text-red-600"
                        value={user.bloodGroup || "N/A"}
                        label="Blood Group"
                    />

                    <StatCard
                        icon={<FaClock />}
                        color="text-blue-600"
                        value={loading ? "..." : activeRequests}
                        label="Pending Blood Requests"
                    />

                    <StatCard
                        icon={<FaCheckCircle />}
                        color="text-green-600"
                        value={loading ? "..." : approvedRequests}
                        label="Approved Blood Requests"
                    />

                    <StatCard
                        icon={<FaHospital />}
                        color="text-purple-600"
                        value={loading ? "..." : getInventoryCount()}
                        label="Available Blood Groups"
                    />
                </div>

                {/* Emergency request summary */}
                <section className="mt-8 rounded-xl border border-red-100 bg-white p-5 shadow sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-red-100 p-3 text-red-600">
                                <FaExclamationTriangle className="text-2xl" />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Emergency Blood Requests
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    View and track your urgent blood requests.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/recipient-emergency"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                        >
                            Send Emergency Request
                            <FaArrowRight />
                        </Link>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Total Emergency Requests
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-800">
                                {loading ? "..." : emergencyRequests.length}
                            </p>
                        </div>

                        <div className="rounded-lg bg-red-50 p-4">
                            <p className="text-sm text-red-600">
                                Active Requests
                            </p>

                            <p className="mt-2 text-2xl font-bold text-red-700">
                                {loading ? "..." : activeEmergencyRequests}
                            </p>
                        </div>

                        <div className="rounded-lg bg-green-50 p-4">
                            <p className="text-sm text-green-600">
                                Completed Requests
                            </p>

                            <p className="mt-2 text-2xl font-bold text-green-700">
                                {loading ? "..." : completedEmergencyRequests}
                            </p>
                        </div>
                    </div>

                </section>


                {/* Latest regular blood request */}
                <section className="mt-8 rounded-xl bg-white p-6 shadow">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-xl font-bold text-gray-800">
                            Latest Blood Request
                        </h2>

                        <span className="text-sm text-gray-500">
                            Total requests: {totalRequests}
                        </span>
                    </div>

                    {loading && requests.length === 0 ? (
                        <p className="text-gray-500">
                            Loading blood requests...
                        </p>
                    ) : latestRequest ? (
                        <div className="rounded-xl border p-5">
                            <div className="flex items-start gap-3">
                                <FaHospital className="mt-1 text-2xl text-red-600" />

                                <div>
                                    <h3 className="text-xl font-bold text-red-600">
                                        {getDestination(latestRequest)}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {latestRequest.requestToType ||
                                            (latestRequest.hospital
                                                ? "Hospital"
                                                : "Blood Bank")}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <p>
                                    Blood Group:{" "}
                                    <b>
                                        {latestRequest.bloodGroup || "N/A"}
                                    </b>
                                </p>

                                <p>
                                    Units Required:{" "}
                                    <b>{latestRequest.units ?? "N/A"}</b>
                                </p>

                                <p>
                                    Required Date:{" "}
                                    <b>
                                        {latestRequest.requiredDate
                                            ? new Date(
                                                latestRequest.requiredDate
                                            ).toLocaleDateString()
                                            : "N/A"}
                                    </b>
                                </p>

                                <p>
                                    Priority:{" "}
                                    <b>
                                        {latestRequest.priority || "Normal"}
                                    </b>
                                </p>
                            </div>

                            <span
                                className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold ${String(latestRequest.status).toLowerCase() ===
                                    "approved"
                                    ? "bg-green-100 text-green-700"
                                    : String(
                                        latestRequest.status
                                    ).toLowerCase() === "rejected"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {latestRequest.status || "Pending"}
                            </span>
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            No blood requests found.
                        </p>
                    )}
                </section>

            </main>
        </div>
    );
}

function StatCard({ icon, color, value, label }) {
    return (
        <div className="rounded-xl bg-white p-6 shadow">
            <div className={`${color} text-3xl`}>
                {icon}
            </div>

            <h2 className="mt-3 text-3xl font-bold text-gray-800">
                {value}
            </h2>

            <p className="mt-1 text-gray-500">
                {label}
            </p>
        </div>
    );
}

export default RecipientDashboard;
