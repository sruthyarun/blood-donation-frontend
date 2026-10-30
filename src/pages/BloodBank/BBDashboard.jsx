
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaTint,
    FaClipboardList,
    FaExclamationTriangle,
    FaCalendarCheck,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

// Safely extract arrays from different API response formats.
const extractArray = (responseData, possibleKeys = []) => {
    if (Array.isArray(responseData)) {
        return responseData;
    }

    if (!responseData || typeof responseData !== "object") {
        return [];
    }

    for (const key of possibleKeys) {
        if (Array.isArray(responseData[key])) {
            return responseData[key];
        }
    }

    if (Array.isArray(responseData.data)) {
        return responseData.data;
    }

    return [];
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
                "Blood bank user details are not available. Please log in again."
            );
            return;
        }

        setLoading(true);
        setErrorMessage("");

        // Inventory route filters by hospitalEmail.
        const inventoryPromise = axiosInstance.get(
            "/bloodInventory",
            {
                params: {
                    hospitalEmail: bankEmail,
                },
            }
        );

        // Blood requests support bloodBankId or hospital.
        const bloodRequestParams = bankId
            ? { bloodBankId: bankId }
            : bankName
                ? { hospital: bankName }
                : {};

        const bloodRequestPromise = axiosInstance.get(
            "/bloodRequests",
            {
                params: bloodRequestParams,
            }
        );

        // Emergency request route supports email.
        const emergencyPromise = axiosInstance.get(
            "/emergencyRequests",
            {
                params: {
                    email: bankEmail,
                },
            }
        );

        // Appointments support bloodBankId or hospital.
        const appointmentParams = bankId
            ? { bloodBankId: bankId }
            : bankName
                ? { hospital: bankName }
                : {};

        const appointmentPromise = axiosInstance.get(
            "/appointments",
            {
                params: appointmentParams,
            }
        );

        const results = await Promise.allSettled([
            inventoryPromise,
            bloodRequestPromise,
            emergencyPromise,
            appointmentPromise,
        ]);

        const endpointNames = [
            "Blood inventory",
            "Blood requests",
            "Emergency requests",
            "Appointments",
        ];

        const setters = [
            {
                set: setInventory,
                keys: ["inventory", "bloodInventory"],
            },
            {
                set: setRequests,
                keys: ["requests", "bloodRequests"],
            },
            {
                set: setEmergency,
                keys: ["emergencyRequests", "requests"],
            },
            {
                set: setAppointments,
                keys: ["appointments"],
            },
        ];

        const failedEndpoints = [];

        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                setters[index].set(
                    extractArray(
                        result.value.data,
                        setters[index].keys
                    )
                );
            } else {
                setters[index].set([]);
                failedEndpoints.push(endpointNames[index]);

                console.error(
                    `${endpointNames[index]} API error:`,
                    result.reason?.response?.data ||
                    result.reason?.message ||
                    result.reason
                );
            }
        });

        if (failedEndpoints.length > 0) {
            setErrorMessage(
                `Unable to load: ${failedEndpoints.join(", ")}. ` +
                "Check the backend routes and server terminal."
            );
        }

        setLoading(false);
    }, [bankEmail, bankName, bankId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const safeInventory = Array.isArray(inventory)
        ? inventory
        : [];

    const safeRequests = Array.isArray(requests)
        ? requests
        : [];

    const safeEmergency = Array.isArray(emergency)
        ? emergency
        : [];

    const safeAppointments = Array.isArray(appointments)
        ? appointments
        : [];

    const totalUnits = safeInventory.reduce(
        (sum, item) =>
            sum + (
                Number(item.units ?? item.quantity) || 0
            ),
        0
    );

    const stats = [
        {
            title: "Total Blood Units",
            value: totalUnits,
            icon: FaTint,
            color: "text-red-600",
        },
        {
            title: "Blood Requests",
            value: safeRequests.length,
            icon: FaClipboardList,
            color: "text-blue-600",
        },
        {
            title: "Emergency Requests",
            value: safeEmergency.length,
            icon: FaExclamationTriangle,
            color: "text-orange-600",
        },
        {
            title: "Appointments",
            value: safeAppointments.length,
            icon: FaCalendarCheck,
            color: "text-green-600",
        },
    ];

    return (
        <div className="min-h-screen flex bg-gray-100">
            <BloodBankPanel />

            <main className="min-w-0 flex-1 p-4 md:p-8">
                {/* Welcome */}
                <section className="rounded-2xl bg-gradient-to-r from-red-700 to-red-400 p-6 text-white shadow-lg md:p-8">
                    <h1 className="text-2xl font-bold md:text-3xl">
                        Welcome,{" "}
                        {bankName ||
                            user?.fullName ||
                            user?.managerName ||
                            "Blood Bank"}
                    </h1>

                    <p className="mt-3 text-red-100">
                        Manage blood inventory, requests and
                        emergency services.
                    </p>

                    <p className="mt-4 break-all">
                        {bankEmail}
                    </p>
                </section>

                {/* Loading */}
                {loading && (
                    <div className="mt-5 rounded-lg bg-white p-4 text-gray-600 shadow">
                        Loading dashboard data...
                    </div>
                )}

                {/* API errors */}
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
                                className="rounded-xl bg-white p-6 shadow"
                            >
                                <Icon
                                    className={`${stat.color} text-3xl`}
                                />

                                <h2 className="mt-3 text-3xl font-bold">
                                    {stat.value}
                                </h2>

                                <p className="mt-1 text-gray-500">
                                    {stat.title}
                                </p>
                            </div>
                        );
                    })}
                </section>

                {/* Blood Stock */}
                <section className="mt-8 rounded-xl bg-white p-6 shadow">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl font-bold">
                            Blood Stock
                        </h2>

                        <button
                            type="button"
                            onClick={fetchData}
                            disabled={loading}
                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Refresh
                        </button>
                    </div>

                    {!loading && safeInventory.length === 0 && (
                        <p className="py-6 text-center text-gray-500">
                            No blood inventory records found.
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {safeInventory.map((item, index) => {
                            const units = Number(
                                item.units ?? item.quantity
                            ) || 0;

                            const group =
                                item.bloodGroup ||
                                item.group ||
                                "Unknown";

                            return (
                                <div
                                    key={
                                        item._id ||
                                        item.id ||
                                        index
                                    }
                                    className="rounded-xl border p-5 text-center"
                                >
                                    <FaTint className="mx-auto text-3xl text-red-600" />

                                    <h3 className="mt-3 text-2xl font-bold">
                                        {group}
                                    </h3>

                                    <p className="text-gray-600">
                                        {units} Units
                                    </p>

                                    <span
                                        className={`mt-3 inline-block rounded-full px-3 py-1 text-sm ${units < 10
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {units < 10
                                            ? "Low Stock"
                                            : "Available"}
                                    </span>

                                    {item.date && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Updated:{" "}
                                            {new Date(
                                                item.date
                                            ).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default BloodBankDashboard;
