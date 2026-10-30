
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaTint,
    FaClipboardList,
    FaExclamationTriangle,
    FaCalendarCheck,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

// Extract arrays from different API response formats.
const extractArray = (data, keys = []) => {
    if (Array.isArray(data)) return data;

    if (!data || typeof data !== "object") return [];

    for (const key of keys) {
        if (Array.isArray(data[key])) {
            return data[key];
        }
    }

    if (Array.isArray(data.data)) {
        return data.data;
    }

    return [];
};

// Normalize text for comparison.
const normalize = (value) =>
    String(value || "").trim().toLowerCase();

// Match a record to the logged-in blood bank.
const belongsToBloodBank = (record, bankId, bankName, bankEmail) => {
    const ids = [
        record?.requestToId,
        record?.destinationId,
        record?.bloodBankId,
        record?.hospitalId,
    ]
        .filter(Boolean)
        .map((id) => String(id._id || id));

    const names = [
        record?.requestToName,
        record?.destinationName,
        record?.hospital,
        record?.hospitalName,
        record?.bloodBankName,
    ].map(normalize);

    const emails = [
        record?.hospitalEmail,
        record?.bloodBankEmail,
        record?.emailTo,
    ].map(normalize);

    const idMatches =
        bankId && ids.includes(String(bankId));

    const nameMatches =
        bankName && names.includes(normalize(bankName));

    const emailMatches =
        bankEmail && emails.includes(normalize(bankEmail));

    return Boolean(idMatches || nameMatches || emailMatches);
};

// Filter active emergency requests.
const isActiveEmergency = (record) =>
    normalize(record?.status) === "active";

// Safe date formatting.
const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString();
};

function BloodBankDashboard() {
    const user = useSelector(
        (state) => state.user.currentUser
    );

    const [inventory, setInventory] = useState([]);
    const [requests, setRequests] = useState([]);
    const [emergency, setEmergency] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const bankEmail = user?.email?.trim().toLowerCase() || "";

    const bankName =
        user?.bloodBankName ||
        user?.bankName ||
        user?.hospitalName ||
        user?.fullName ||
        user?.managerName ||
        "";

    const bankId =
        user?._id ||
        user?.id ||
        user?.bloodBankId ||
        "";

    const fetchData = useCallback(async () => {
        if (!bankEmail) {
            setInventory([]);
            setRequests([]);
            setEmergency([]);
            setAppointments([]);
            setLoading(false);

            setErrorMessage(
                "Blood bank details are unavailable. Please log in again."
            );

            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            // Fetch all dashboard collections.
            const results = await Promise.allSettled([
                axiosInstance.get("/bloodInventory", {
                    params: {
                        hospitalEmail: bankEmail,
                    },
                }),

                axiosInstance.get("/bloodRequests", {
                    params: bankId
                        ? { bloodBankId: bankId }
                        : { hospital: bankName },
                }),

                // Active emergency requests are shared requests.
                axiosInstance.get("/emergencyRequests"),

                axiosInstance.get("/appointments", {
                    params: bankId
                        ? { bloodBankId: bankId }
                        : { hospital: bankName },
                }),
            ]);

            const endpointNames = [
                "Blood inventory",
                "Blood requests",
                "Emergency requests",
                "Appointments",
            ];

            const failedEndpoints = [];

            // Inventory
            if (results[0].status === "fulfilled") {
                const records = extractArray(
                    results[0].value.data,
                    ["inventory", "bloodInventory"]
                );

                setInventory(
                    records.filter(
                        (item) =>
                            normalize(item.hospitalEmail) === bankEmail
                    )
                );
            } else {
                setInventory([]);
                failedEndpoints.push(endpointNames[0]);
                console.error(
                    "Inventory API error:",
                    results[0].reason?.response?.data ||
                    results[0].reason?.message
                );
            }

            // Blood requests
            if (results[1].status === "fulfilled") {
                const records = extractArray(
                    results[1].value.data,
                    ["requests", "bloodRequests"]
                );

                setRequests(
                    records.filter((item) =>
                        belongsToBloodBank(
                            item,
                            bankId,
                            bankName,
                            bankEmail
                        )
                    )
                );
            } else {
                setRequests([]);
                failedEndpoints.push(endpointNames[1]);
                console.error(
                    "Blood requests API error:",
                    results[1].reason?.response?.data ||
                    results[1].reason?.message
                );
            }

            // Emergency requests
            if (results[2].status === "fulfilled") {
                const records = extractArray(
                    results[2].value.data,
                    ["emergencyRequests", "requests"]
                );

                setEmergency(
                    records.filter(isActiveEmergency)
                );
            } else {
                setEmergency([]);
                failedEndpoints.push(endpointNames[2]);
                console.error(
                    "Emergency requests API error:",
                    results[2].reason?.response?.data ||
                    results[2].reason?.message
                );
            }

            // Appointments
            if (results[3].status === "fulfilled") {
                const records = extractArray(
                    results[3].value.data,
                    ["appointments"]
                );

                setAppointments(
                    records.filter((item) =>
                        belongsToBloodBank(
                            item,
                            bankId,
                            bankName,
                            bankEmail
                        )
                    )
                );
            } else {
                setAppointments([]);
                failedEndpoints.push(endpointNames[3]);
                console.error(
                    "Appointments API error:",
                    results[3].reason?.response?.data ||
                    results[3].reason?.message
                );
            }

            if (failedEndpoints.length > 0) {
                setErrorMessage(
                    `Unable to load: ${failedEndpoints.join(", ")}. Please check your backend API routes.`
                );
            }
        } catch (error) {
            console.error("Dashboard loading error:", error);

            setErrorMessage(
                "Unable to load dashboard data. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [bankEmail, bankId, bankName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate total blood units.
    const totalUnits = useMemo(() => {
        return inventory.reduce(
            (sum, item) =>
                sum + (Number(item.units ?? item.quantity) || 0),
            0
        );
    }, [inventory]);

    // Dashboard statistics.
    const stats = [
        {
            title: "Total Blood Units",
            value: totalUnits,
            icon: FaTint,
            color: "text-red-600",
            bg: "bg-red-100",
        },
        {
            title: "Blood Requests",
            value: requests.length,
            icon: FaClipboardList,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: "Emergency Requests",
            value: emergency.length,
            icon: FaExclamationTriangle,
            color: "text-orange-600",
            bg: "bg-orange-100",
        },
        {
            title: "Appointments",
            value: appointments.length,
            icon: FaCalendarCheck,
            color: "text-green-600",
            bg: "bg-green-100",
        },
    ];

    return (
        <div className="min-h-screen flex bg-gray-100">
            <BloodBankPanel />

            <main className="min-w-0 flex-1 p-4 md:p-8">

                {/* Welcome section */}
                <section className="rounded-2xl bg-gradient-to-r from-red-700 to-red-400 p-6 text-white shadow-lg md:p-8">
                    <h1 className="text-2xl font-bold md:text-3xl">
                        Welcome,{" "}
                        {bankName || "Blood Bank"}
                    </h1>

                    <p className="mt-3 text-red-100">
                        Manage blood inventory, blood requests,
                        appointments and emergency services.
                    </p>

                    <p className="mt-4 break-all text-sm">
                        {bankEmail}
                    </p>
                </section>

                {/* Loading */}
                {loading && (
                    <div className="mt-5 rounded-lg bg-white p-4 text-gray-600 shadow">
                        Loading dashboard data...
                    </div>
                )}

                {/* Error message */}
                {!loading && errorMessage && (
                    <div
                        role="alert"
                        className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800"
                    >
                        <p>{errorMessage}</p>

                        <button
                            type="button"
                            onClick={fetchData}
                            className="mt-3 rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.title}
                                className="rounded-xl bg-white p-6 shadow transition hover:shadow-md"
                            >
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
                                >
                                    <Icon
                                        className={`${stat.color} text-2xl`}
                                    />
                                </div>

                                <h2 className="mt-4 text-3xl font-bold text-gray-800">
                                    {stat.value}
                                </h2>

                                <p className="mt-1 text-gray-500">
                                    {stat.title}
                                </p>
                            </div>
                        );
                    })}
                </section>

                {/* Blood inventory */}
                <section className="mt-8 rounded-xl bg-white p-6 shadow">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Blood Stock
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Current available blood units.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchData}
                            disabled={loading}
                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    {!loading && inventory.length === 0 && (
                        <p className="py-6 text-center text-gray-500">
                            No blood inventory records found.
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {inventory.map((item, index) => {
                            const units =
                                Number(item.units ?? item.quantity) || 0;

                            const group =
                                item.bloodGroup ||
                                item.group ||
                                "Unknown";

                            return (
                                <div
                                    key={item._id || item.id || index}
                                    className="rounded-xl border border-gray-200 p-5 text-center"
                                >
                                    <FaTint className="mx-auto text-3xl text-red-600" />

                                    <h3 className="mt-3 text-2xl font-bold text-gray-800">
                                        {group}
                                    </h3>

                                    <p className="text-gray-600">
                                        {units} Units
                                    </p>

                                    <span
                                        className={`mt-3 inline-block rounded-full px-3 py-1 text-sm ${units === 0
                                                ? "bg-gray-100 text-gray-700"
                                                : units <= 10
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {units === 0
                                            ? "Out of Stock"
                                            : units <= 10
                                                ? "Low Stock"
                                                : "Available"}
                                    </span>

                                    {item.date && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Updated: {formatDate(item.date)}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Blood requests summary */}
                <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="text-lg font-bold text-gray-800">
                            Blood Request Summary
                        </h2>

                        <div className="mt-5 space-y-3">
                            <div className="flex justify-between border-b pb-3">
                                <span className="text-gray-600">
                                    Total Requests
                                </span>

                                <strong>{requests.length}</strong>
                            </div>

                            <div className="flex justify-between border-b pb-3">
                                <span className="text-gray-600">
                                    Pending
                                </span>

                                <strong>
                                    {
                                        requests.filter(
                                            (item) =>
                                                normalize(item.status) === "pending"
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="flex justify-between border-b pb-3">
                                <span className="text-gray-600">
                                    Approved
                                </span>

                                <strong className="text-green-600">
                                    {
                                        requests.filter(
                                            (item) =>
                                                normalize(item.status) === "approved"
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Rejected
                                </span>

                                <strong className="text-red-600">
                                    {
                                        requests.filter(
                                            (item) =>
                                                normalize(item.status) === "rejected"
                                        ).length
                                    }
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Appointment summary */}
                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="text-lg font-bold text-gray-800">
                            Appointment Summary
                        </h2>

                        <div className="mt-5 space-y-3">
                            <div className="flex justify-between border-b pb-3">
                                <span className="text-gray-600">
                                    Total Appointments
                                </span>

                                <strong>{appointments.length}</strong>
                            </div>

                            <div className="flex justify-between border-b pb-3">
                                <span className="text-gray-600">
                                    Pending
                                </span>

                                <strong>
                                    {
                                        appointments.filter(
                                            (item) =>
                                                normalize(item.status) === "pending"
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="flex justify-between border-b pb-3">
                                <span className="text-gray-600">
                                    Confirmed
                                </span>

                                <strong className="text-blue-600">
                                    {
                                        appointments.filter(
                                            (item) =>
                                                normalize(item.status) === "confirmed"
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Completed
                                </span>

                                <strong className="text-green-600">
                                    {
                                        appointments.filter(
                                            (item) =>
                                                normalize(item.status) === "completed"
                                        ).length
                                    }
                                </strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Emergency requests */}
                <section className="mt-8 rounded-xl bg-white p-6 shadow">
                    <h2 className="text-xl font-bold text-gray-800">
                        Active Emergency Requests
                    </h2>

                    {emergency.length === 0 ? (
                        <p className="py-6 text-center text-gray-500">
                            No active emergency requests found.
                        </p>
                    ) : (
                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-sm text-gray-600">
                                        <th className="p-3">Patient</th>
                                        <th className="p-3">Blood Group</th>
                                        <th className="p-3">Units</th>
                                        <th className="p-3">District</th>
                                        <th className="p-3">Hospital</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {emergency.slice(0, 5).map((item, index) => (
                                        <tr
                                            key={item._id || item.id || index}
                                            className="border-b last:border-0"
                                        >
                                            <td className="p-3">
                                                {item.patientName || "N/A"}
                                            </td>

                                            <td className="p-3 font-semibold text-red-600">
                                                {item.bloodGroup || "N/A"}
                                            </td>

                                            <td className="p-3">
                                                {item.units || 0}
                                            </td>

                                            <td className="p-3">
                                                {item.district || "N/A"}
                                            </td>

                                            <td className="p-3">
                                                {item.hospital || item.requesterName || "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}

export default BloodBankDashboard;
