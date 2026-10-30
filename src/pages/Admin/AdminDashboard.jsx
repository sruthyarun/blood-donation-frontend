
import { useEffect, useState } from "react";
import axios from "axios";

import {
    FaUsers,
    FaHospital,
    FaTint,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaUserInjured,
    FaClipboardList,
    FaWarehouse,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";

const API_URL = "https://blood-donation-backend-olwl.onrender.com/api";

function getArray(response, possibleKeys = []) {
    const data = response?.data;

    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.data)) return data.data;

    for (const key of possibleKeys) {
        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }

    return [];
}

function AdminDashboard() {
    const [donors, setDonors] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [bloodBanks, setBloodBanks] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [bloodRequests, setBloodRequests] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        setError("");

        const endpoints = [
            {
                url: `${API_URL}/donors`,
                keys: ["donors"],
                setter: setDonors,
                name: "Donors",
            },
            {
                url: `${API_URL}/recipients`,
                keys: ["recipients"],
                setter: setRecipients,
                name: "Recipients",
            },
            {
                url: `${API_URL}/hospitals`,
                keys: ["hospitals"],
                setter: setHospitals,
                name: "Hospitals",
            },
            {
                url: `${API_URL}/bloodBanks`,
                keys: ["bloodBanks", "banks"],
                setter: setBloodBanks,
                name: "Blood Banks",
            },
            {
                url: `${API_URL}/bloodInventory`,
                keys: ["inventory", "bloodInventory"],
                setter: setInventory,
                name: "Blood Inventory",
            },
            {
                url: `${API_URL}/bloodRequests`,
                keys: ["bloodRequests", "requests"],
                setter: setBloodRequests,
                name: "Blood Requests",
            },
            {
                url: `${API_URL}/appointments`,
                keys: ["appointments"],
                setter: setAppointments,
                name: "Appointments",
            },
        ];

        const results = await Promise.allSettled(
            endpoints.map((item) => axios.get(item.url))
        );

        let failedEndpoints = [];

        results.forEach((result, index) => {
            const endpoint = endpoints[index];

            if (result.status === "fulfilled") {
                endpoint.setter(
                    getArray(result.value, endpoint.keys)
                );
            } else {
                console.error(
                    `${endpoint.name} API error:`,
                    result.reason?.response?.data || result.reason?.message
                );

                endpoint.setter([]);
                failedEndpoints.push(endpoint.name);
            }
        });

        if (failedEndpoints.length > 0) {
            setError(
                `Unable to load: ${failedEndpoints.join(", ")}. Check the backend API routes.`
            );
        }

        setLoading(false);
    };

    // Blood request statistics
    const pendingCount = bloodRequests.filter(
        (item) =>
            String(item.status || "").toLowerCase() === "pending"
    ).length;

    const approvedCount = bloodRequests.filter(
        (item) =>
            String(item.status || "").toLowerCase() === "approved"
    ).length;

    const emergencyCount = bloodRequests.filter((item) => {
        const priority = String(item.priority || "").toLowerCase();

        return priority === "emergency" || priority === "critical";
    }).length;

    // Appointment statistics
    const confirmedAppointments = appointments.filter(
        (item) =>
            String(item.status || "").toLowerCase() === "confirmed"
    ).length;

    const completedAppointments = appointments.filter(
        (item) =>
            String(item.status || "").toLowerCase() === "completed"
    ).length;

    // Inventory statistics
    const totalBloodUnits = inventory.reduce(
        (total, item) => total + (Number(item.units) || 0),
        0
    );

    // Today's date
    const isToday = (dateValue) => {
        if (!dateValue) return false;

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return false;

        const today = new Date();

        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const todayAppointments = appointments.filter((item) =>
        isToday(item.date || item.appointmentDate || item.createdAt)
    ).length;

    // Recent activities from the last 24 hours
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;

    const activities = [
        ...donors.map((item) => ({
            id: item._id || item.id,
            activity: "New Donor Registered",
            user: item.fullName || item.name || item.email || "Donor",
            time: item.createdAt,
        })),

        ...recipients.map((item) => ({
            id: item._id || item.id,
            activity: "New Recipient Registered",
            user: item.fullName || item.name || item.email || "Recipient",
            time: item.createdAt,
        })),

        ...hospitals.map((item) => ({
            id: item._id || item.id,
            activity: "Hospital Registered",
            user: item.hospitalName || item.name || "Hospital",
            time: item.createdAt,
        })),

        ...bloodBanks.map((item) => ({
            id: item._id || item.id,
            activity: "Blood Bank Registered",
            user: item.bloodBankName || item.name || "Blood Bank",
            time: item.createdAt,
        })),

        ...bloodRequests.map((item) => ({
            id: item._id || item.id,
            activity: "Blood Request",
            user: item.patientName || item.recipientName || "Patient",
            time: item.createdAt,
        })),

        ...appointments.map((item) => ({
            id: item._id || item.id,
            activity: "Donation Appointment",
            user: item.donorName || item.donorEmail || "Donor",
            time: item.createdAt,
        })),
    ]
        .filter((item) => {
            if (!item.time) return false;

            const timestamp = new Date(item.time).getTime();

            return (
                !Number.isNaN(timestamp) &&
                timestamp >= last24Hours
            );
        })
        .sort(
            (a, b) =>
                new Date(b.time).getTime() -
                new Date(a.time).getTime()
        )
        .slice(0, 8);

    const formatDate = (dateValue) => {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminPanel />

            <main className="flex-1 min-w-0 p-4 md:p-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Admin Dashboard
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Welcome back! Here's an overview of your Blood Donation Management System.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-xl shadow p-10 text-center">
                        <p className="text-gray-600">
                            Loading dashboard data...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Main statistics */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                                <FaUsers className="text-blue-600 text-4xl mb-3" />

                                <h2 className="text-3xl font-bold text-gray-800">
                                    {donors.length}
                                </h2>

                                <p className="text-gray-500">
                                    Total Donors
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                                <FaUserInjured className="text-green-600 text-4xl mb-3" />

                                <h2 className="text-3xl font-bold text-gray-800">
                                    {recipients.length}
                                </h2>

                                <p className="text-gray-500">
                                    Recipients
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                                <FaHospital className="text-red-600 text-4xl mb-3" />

                                <h2 className="text-3xl font-bold text-gray-800">
                                    {hospitals.length}
                                </h2>

                                <p className="text-gray-500">
                                    Hospitals
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                                <FaTint className="text-pink-600 text-4xl mb-3" />

                                <h2 className="text-3xl font-bold text-gray-800">
                                    {bloodBanks.length}
                                </h2>

                                <p className="text-gray-500">
                                    Blood Banks
                                </p>
                            </div>

                        </div>

                        {/* Additional statistics */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <FaClipboardList className="text-yellow-500 text-3xl mb-3" />

                                <h2 className="text-3xl font-bold text-gray-800">
                                    {pendingCount}
                                </h2>

                                <p className="text-gray-500">
                                    Pending Requests
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <FaExclamationTriangle className="text-red-600 text-3xl mb-3" />

                                <h2 className="text-3xl font-bold text-gray-800">
                                    {emergencyCount}
                                </h2>

                                <p className="text-gray-500">
                                    Emergency Requests
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <FaCalendarAlt className="text-blue-600 text-3xl mb-3" />

                                <h2 className="text-3xl font-bold text-gray-800">
                                    {confirmedAppointments}
                                </h2>

                                <p className="text-gray-500">
                                    Confirmed Appointments
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <FaWarehouse className="text-purple-600 text-3xl mb-3" />

                                <h2 className="text-3xl font-bold text-gray-800">
                                    {totalBloodUnits}
                                </h2>

                                <p className="text-gray-500">
                                    Total Blood Units
                                </p>
                            </div>

                        </div>

                        {/* Appointment and request overview */}
                        <div className="grid md:grid-cols-2 gap-6 mt-8">

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-5">
                                    Blood Request Overview
                                </h2>

                                <div className="flex justify-between py-3 border-b">
                                    <span className="text-gray-600">
                                        Pending
                                    </span>

                                    <span className="font-bold text-yellow-600">
                                        {pendingCount}
                                    </span>
                                </div>

                                <div className="flex justify-between py-3 border-b">
                                    <span className="text-gray-600">
                                        Approved
                                    </span>

                                    <span className="font-bold text-green-600">
                                        {approvedCount}
                                    </span>
                                </div>

                                <div className="flex justify-between py-3">
                                    <span className="text-gray-600">
                                        Emergency
                                    </span>

                                    <span className="font-bold text-red-600">
                                        {emergencyCount}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-5">
                                    Appointment Overview
                                </h2>

                                <div className="flex justify-between py-3 border-b">
                                    <span className="text-gray-600">
                                        Confirmed
                                    </span>

                                    <span className="font-bold text-blue-600">
                                        {confirmedAppointments}
                                    </span>
                                </div>

                                <div className="flex justify-between py-3 border-b">
                                    <span className="text-gray-600">
                                        Completed
                                    </span>

                                    <span className="font-bold text-green-600">
                                        {completedAppointments}
                                    </span>
                                </div>

                                <div className="flex justify-between py-3">
                                    <span className="text-gray-600">
                                        Today's Appointments
                                    </span>

                                    <span className="font-bold text-purple-600">
                                        {todayAppointments}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Recent Activities */}
                        <div className="mt-10">

                            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                                    Recent Activities
                                </h2>

                                <span className="text-sm text-gray-500">
                                    Last 24 Hours
                                </span>
                            </div>

                            <div className="space-y-5">

                                {activities.length > 0 ? (
                                    activities.map((item, index) => (

                                        <div
                                            key={item.id || `${item.activity}-${index}`}
                                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 border-l-4 border-red-600"
                                        >

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                                <div className="flex gap-4 items-center">

                                                    <div className="w-12 h-12 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                                                        <FaClipboardList className="text-red-600 text-xl" />
                                                    </div>

                                                    <div>
                                                        <h3 className="text-base md:text-lg font-semibold text-gray-800">
                                                            {item.activity}
                                                        </h3>

                                                        <p className="text-gray-600 mt-1">
                                                            {item.user}
                                                        </p>
                                                    </div>

                                                </div>

                                                <span className="text-sm text-gray-500 sm:text-right">
                                                    {formatDate(item.time)}
                                                </span>

                                            </div>

                                        </div>

                                    ))
                                ) : (
                                    <div className="bg-white rounded-xl shadow p-8 text-center">
                                        <p className="text-gray-500">
                                            No activities found in the last 24 hours.
                                        </p>
                                    </div>
                                )}

                            </div>

                        </div>
                    </>
                )}

            </main>
        </div>
    );
}

export default AdminDashboard;
