
import {
    FaTint,
    FaCalendarAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaHospital,
    FaBell,
    FaSyncAlt,
} from "react-icons/fa";

import { useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";

import RecipientPanel from "../../components/RecipientPanel";
import axiosInstance from "../../API/axiosInstance";

function Rnotifications() {
    const reduxUser = useSelector(
        (state) => state.user.currentUser
    );

    // Get the logged-in recipient from Redux or localStorage.
    let storedUser = null;

    try {
        storedUser = JSON.parse(
            localStorage.getItem("loggedInUser") || "null"
        );
    } catch {
        storedUser = null;
    }

    const user =
        reduxUser?.recipient ||
        reduxUser ||
        storedUser?.recipient ||
        storedUser;

    // Recipient email used to filter notifications.
    const recipientEmail = String(
        user?.email || user?.recipientEmail || ""
    ).trim().toLowerCase();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch notifications from MongoDB through the backend.
    const loadNotifications = useCallback(async () => {
        if (!recipientEmail) {
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

            const response = await axiosInstance.get(
                "/notifications",
                {
                    params: {
                        email: recipientEmail,
                    },
                }
            );

            const result = response.data;

            const list = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.notifications)
                        ? result.notifications
                        : [];

            // Show only notifications addressed to this recipient.
            const recipientNotifications = list.filter((item) => {
                const email = String(
                    item.emailTo ||
                    item.email ||
                    item.recipientEmail ||
                    ""
                ).trim().toLowerCase();

                return email === recipientEmail;
            });

            // Display newest notifications first.
            recipientNotifications.sort((a, b) => {
                const dateA = new Date(
                    a.createdAt || a.time || a.date || 0
                ).getTime();

                const dateB = new Date(
                    b.createdAt || b.time || b.date || 0
                ).getTime();

                return dateB - dateA;
            });

            setNotifications(recipientNotifications);
        } catch (error) {
            console.error(
                "Failed to fetch notifications:",
                error.response?.data || error.message
            );

            setErrorMessage(
                error.response?.data?.message ||
                "Unable to load notifications from the database."
            );
        } finally {
            setLoading(false);
        }
    }, [recipientEmail]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const getIcon = (type) => {
        switch (String(type || "").toLowerCase()) {
            case "appointment":
            case "granted":
                return <FaCalendarAlt />;

            case "success":
            case "approved":
                return <FaCheckCircle />;

            case "hospital":
                return <FaHospital />;

            case "emergency":
            case "alert":
                return <FaExclamationTriangle />;

            default:
                return <FaTint />;
        }
    };

    const getColor = (type) => {
        switch (String(type || "").toLowerCase()) {
            case "appointment":
            case "granted":
                return "bg-blue-100 text-blue-600";

            case "success":
            case "approved":
                return "bg-green-100 text-green-600";

            case "hospital":
                return "bg-purple-100 text-purple-600";

            case "emergency":
            case "alert":
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

    const unreadCount = notifications.filter(
        (item) => !item.read
    ).length;

    if (!user || !recipientEmail) {
        return (
            <div className="min-h-screen bg-gray-100 flex">
                <RecipientPanel />

                <main className="flex-1 p-8 text-center">
                    <p className="text-xl text-gray-700 mt-20">
                        Please log in to view your notifications.
                    </p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <RecipientPanel />

            <main className="min-h-screen bg-gray-100 p-4 sm:p-8 flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <FaBell className="text-3xl text-red-600" />

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                Notifications
                            </h1>

                            <p className="text-gray-500 mt-1">
                                Stay updated with your latest activities.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium">
                            Unread: {unreadCount}
                        </span>

                        <button
                            type="button"
                            onClick={loadNotifications}
                            disabled={loading}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
                        >
                            <FaSyncAlt
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>
                    </div>
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
                                {recipientEmail}
                            </span>.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {notifications.map((item, index) => (
                            <div
                                key={item._id || item.id || index}
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

export default Rnotifications;
