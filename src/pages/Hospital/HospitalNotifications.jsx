
import {
    FaTint,
    FaCalendarCheck,
    FaCheckCircle,
    FaExclamationTriangle,
    FaBell,
} from "react-icons/fa";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import HospitalPanel from "../../components/HospitalPanel";
import axiosInstance from "../../API/axiosInstance";

function HospitalNotification() {
    const user = useSelector(
        (state) => state.user.currentUser
    );

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");

    // Fetch notifications for the logged-in hospital
    const fetchNotifications = useCallback(async () => {
        if (!user?.email) {
            setNotifications([]);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                "/notifications",
                {
                    params: {
                        email: user.email,
                    },
                }
            );

            const data = response.data?.data ?? response.data;

            if (!Array.isArray(data)) {
                throw new Error(
                    "Invalid notifications response from server."
                );
            }

            setNotifications(data);
        } catch (err) {
            console.error(
                "Failed to fetch notifications:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load notifications."
            );
        } finally {
            setLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Mark a notification as read
    const markAsRead = async (notification) => {
        const notificationId =
            notification._id || notification.id;

        if (!notificationId || !user?.email) {
            setError(
                "Notification ID or logged-in hospital email is missing."
            );
            return;
        }

        try {
            setUpdatingId(notificationId);
            setError("");

            await axiosInstance.patch(
                `/ notifications / ${notificationId}/read`,
                {
                    email: user.email,
                }
            );

            setNotifications((previous) =>
                previous.map((item) =>
                    (item._id || item.id) === notificationId
                        ? { ...item, read: true }
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Failed to mark notification as read:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to mark notification as read."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Notification icon
    const getIcon = (type) => {
        switch (type) {
            case "appointment":
                return <FaCalendarCheck />;

            case "donation":
                return <FaCheckCircle />;

            case "emergency":
                return <FaTint />;

            case "inventory":
                return <FaTint />;

            case "request":
            case "bloodRequest":
                return <FaBell />;

            default:
                return <FaExclamationTriangle />;
        }
    };

    // Notification color
    const getColor = (type) => {
        switch (type) {
            case "appointment":
                return "bg-blue-100 text-blue-600";

            case "donation":
                return "bg-green-100 text-green-600";

            case "emergency":
                return "bg-red-100 text-red-600";

            case "inventory":
                return "bg-purple-100 text-purple-600";

            case "request":
            case "bloodRequest":
                return "bg-orange-100 text-orange-600";

            default:
                return "bg-yellow-100 text-yellow-600";
        }
    };

    // Format MongoDB creation timestamp
    const formatDate = (date) => {
        if (!date) return "Date not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Date not available";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl">
                Please log in to view notifications.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <HospitalPanel />

            <div className="flex-1 min-w-0 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <FaBell className="text-3xl text-red-600" />

                        <div>
                            <h1 className="text-3xl font-bold">
                                Notifications
                            </h1>

                            <p className="text-gray-500 mt-1">
                                View your latest updates
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={fetchNotifications}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="bg-red-100 text-red-700 p-4 rounded-lg mb-6"
                    >
                        {error}
                    </div>
                )}

                {/* Notification summary */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl shadow">
                        <p className="text-gray-500">
                            Total Notifications
                        </p>

                        <h2 className="text-3xl font-bold mt-1">
                            {notifications.length}
                        </h2>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow">
                        <p className="text-gray-500">
                            Unread Notifications
                        </p>

                        <h2 className="text-3xl font-bold text-red-600 mt-1">
                            {
                                notifications.filter(
                                    (item) => !item.read
                                ).length
                            }
                        </h2>
                    </div>
                </div>

                {/* Loading */}
                {loading && notifications.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
                        <FaBell className="text-4xl mx-auto mb-3 text-gray-300" />

                        <h2 className="text-xl font-semibold text-gray-700">
                            No Notifications Found
                        </h2>

                        <p className="mt-2">
                            Your notifications will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {notifications.map((item) => {
                            const notificationId =
                                item._id || item.id;

                            const isUpdating =
                                updatingId === notificationId;

                            return (
                                <div
                                    key={notificationId}
                                    className={`rounded-xl shadow-md p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition ${item.read
                                        ? "bg-gray-50"
                                        : "bg-white border-l-4 border-red-600"
                                        }`}
                                >
                                    <div className="flex gap-4 min-w-0">
                                        <div
                                            className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl ${getColor(
                                                item.type
                                            )}`}
                                        >
                                            {getIcon(item.type)}
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="font-semibold text-lg">
                                                {item.title ||
                                                    "Notification"}
                                            </h2>

                                            {!item.read && (
                                                <span className="inline-block mb-2 mt-1 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                                                    New
                                                </span>
                                            )}

                                            <p className="text-gray-600 break-words">
                                                {item.message ||
                                                    "No message provided."}
                                            </p>

                                            <p className="text-sm text-gray-400 mt-2">
                                                {formatDate(
                                                    item.createdAt ||
                                                    item.time
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        {!item.read ? (
                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() =>
                                                    markAsRead(item)
                                                }
                                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
                                            >
                                                {isUpdating
                                                    ? "Updating..."
                                                    : "Mark as Read"}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                                            >
                                                Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HospitalNotification;
