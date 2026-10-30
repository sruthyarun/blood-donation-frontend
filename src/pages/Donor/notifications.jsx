
import {
    FaTint,
    FaCalendarCheck,
    FaCheckCircle,
    FaExclamationTriangle,
    FaBell,
} from "react-icons/fa";

import { useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";

import DonorPanel from "../../components/donorPanel";
import axiosInstance from "../../API/axiosInstance";

function Notifications() {
    const reduxUser = useSelector(
        (state) => state.user.currentUser
    );

    // Get the logged-in user from Redux or localStorage
    const user = reduxUser || (() => {
        try {
            return JSON.parse(
                localStorage.getItem("loggedInUser")
            );
        } catch {
            return null;
        }
    })();

    // Donor email used to match Notification.emailTo
    const donorEmail = String(
        user?.email || user?.donorEmail || ""
    ).trim().toLowerCase();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch notifications from the MongoDB notifications collection
    const loadNotifications = useCallback(async () => {
        if (!donorEmail) {
            setNotifications([]);
            setLoading(false);
            setErrorMessage(
                "Please log in to view your notifications."
            );
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            // Backend endpoint: GET /api/notifications
            const response = await axiosInstance.get("/notifications", {
                params: {
                    email: donorEmail,
                },
            });

            const result = response.data;

            const donorNotifications = Array.isArray(result?.data)
                ? result.data
                : [];

            setNotifications(donorNotifications);
            // Show only notifications addressed to this donor

            // Newest notifications first
            donorNotifications.sort((a, b) => {
                const dateA = new Date(
                    a.createdAt || a.time || a.date || 0
                ).getTime();

                const dateB = new Date(
                    b.createdAt || b.time || b.date || 0
                ).getTime();

                return dateB - dateA;
            });

            setNotifications(donorNotifications);
        } catch (error) {
            console.error(
                "Failed to fetch notifications:",
                error.response?.data || error
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Unable to load notifications from the database."
            );
        } finally {
            setLoading(false);
        }
    }, [donorEmail]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const getIcon = (type) => {
        switch (String(type || "").toLowerCase()) {
            case "appointment":
                return <FaCalendarCheck />;

            case "donation":
                return <FaCheckCircle />;

            case "emergency":
                return <FaTint />;

            default:
                return <FaExclamationTriangle />;
        }
    };

    const getColor = (type) => {
        switch (String(type || "").toLowerCase()) {
            case "appointment":
                return "bg-blue-100 text-blue-600";

            case "donation":
                return "bg-green-100 text-green-600";

            case "emergency":
                return "bg-red-100 text-red-600";

            default:
                return "bg-yellow-100 text-yellow-600";
        }
    };

    const formatDate = (notification) => {
        const value =
            notification.createdAt ||
            notification.time ||
            notification.date;

        if (!value) return "Date unavailable";

        const parsedDate = new Date(value);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(value);
        }

        return parsedDate.toLocaleString();
    };

    if (!user || !donorEmail) {
        return (
            <div className="text-center mt-20 text-xl">
                Please log in to view your notifications.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <DonorPanel />

            <main className="min-h-screen bg-gray-100 p-4 sm:p-8 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <FaBell className="text-3xl text-red-600" />

                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Notifications
                            </h1>

                            <p className="text-gray-500 mt-1">
                                Your appointment and donation updates
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={loadNotifications}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
                        Loading notifications...
                    </div>
                ) : errorMessage ? (
                    <div className="bg-white p-10 rounded-xl shadow text-center">
                        <p className="text-red-600">
                            {errorMessage}
                        </p>

                        <button
                            type="button"
                            onClick={loadNotifications}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
                        <FaBell className="text-4xl mx-auto mb-4 text-gray-300" />

                        <h2 className="text-xl font-semibold text-gray-700">
                            No Notifications Found
                        </h2>

                        <p className="mt-2">
                            No notifications were found for{" "}
                            <span className="font-medium">
                                {donorEmail}
                            </span>.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {notifications.map((item) => (
                            <div
                                key={item._id || item.id}
                                className={`bg-white rounded-xl shadow-md p-5 flex items-start gap-4 border-l-4 ${item.read
                                    ? "border-gray-200"
                                    : "border-red-500"
                                    }`}
                            >
                                <div
                                    className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl ${getColor(item.type)}`}
                                >
                                    {getIcon(item.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold text-lg text-gray-800">
                                            {item.title || "Notification"}
                                        </h2>

                                        {!item.read && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                                New
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 mt-1 break-words">
                                        {item.message || "No message available."}
                                    </p>

                                    <p className="text-sm text-gray-400 mt-2">
                                        {formatDate(item)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Notifications;
