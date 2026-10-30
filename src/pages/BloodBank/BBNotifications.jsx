
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaBell,
    FaTint,
    FaCalendarCheck,
    FaCheckCircle,
    FaExclamationTriangle,
    FaHospital,
    FaSyncAlt,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

function getNotifications(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.notifications)) return data.notifications;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function getNotificationStyle(type = "") {
    const value = type.toLowerCase();

    if (value.includes("stock") || value.includes("inventory")) {
        return {
            icon: <FaTint />,
            color: "bg-red-100 text-red-600",
        };
    }

    if (value.includes("emergency") || value.includes("request")) {
        return {
            icon: <FaExclamationTriangle />,
            color: "bg-orange-100 text-orange-600",
        };
    }

    if (value.includes("appointment") || value.includes("schedule")) {
        return {
            icon: <FaCalendarCheck />,
            color: "bg-blue-100 text-blue-600",
        };
    }

    if (value.includes("hospital")) {
        return {
            icon: <FaHospital />,
            color: "bg-purple-100 text-purple-600",
        };
    }

    if (value.includes("complete") || value.includes("issued")) {
        return {
            icon: <FaCheckCircle />,
            color: "bg-green-100 text-green-600",
        };
    }

    return {
        icon: <FaBell />,
        color: "bg-gray-100 text-gray-600",
    };
}

function formatTime(date) {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function BloodBankNotifications() {
    const user = useSelector((state) => state.user.currentUser);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [filter, setFilter] = useState("All");

    const bloodBankId =
        user?._id || user?.id || user?.bloodBankId || "";

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const email = user?.email?.trim().toLowerCase();

            if (!email) {
                setError("Blood bank email is missing. Please log in again.");
                setNotifications([]);
                return;
            }

            const response = await axiosInstance.get("/notifications", {
                params: { email },
            });

            setNotifications(getNotifications(response.data));
        } catch (err) {
            console.error("Notification API status:", err.response?.status);
            console.error("Notification API response:", err.response?.data);
            console.error("Notification API URL:", err.config?.url);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    }, [bloodBankId]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (notification) => {
        const id = notification._id || notification.id;

        if (!id || notification.isRead || notification.read) return;

        setUpdatingId(id);
        setError("");

        try {
            await axiosInstance.patch(`/notifications/${id}/read`);

            setNotifications((previous) =>
                previous.map((item) => {
                    const itemId = item._id || item.id;

                    return itemId === id
                        ? { ...item, isRead: true, read: true }
                        : item;
                })
            );
        } catch (err) {
            console.error(
                "Failed to mark notification as read:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Could not mark this notification as read."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const isRead = (item) => Boolean(item.isRead || item.read);

    const filteredNotifications = notifications.filter((item) => {
        if (filter === "Unread") return !isRead(item);
        if (filter === "Read") return isRead(item);
        return true;
    });

    const unreadCount = notifications.filter((item) => !isRead(item)).length;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <BloodBankPanel />

            <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <FaBell className="mt-1 text-3xl text-red-600 sm:text-4xl" />

                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 sm:text-4xl">
                                Blood Bank Notifications
                            </h1>

                            <p className="mt-2 text-sm text-gray-500 sm:text-base">
                                Blood inventory alerts, emergency requests,
                                donation schedules and system updates.
                            </p>

                            <p className="mt-2 text-sm font-medium text-red-600">
                                {unreadCount} unread notification
                                {unreadCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={fetchNotifications}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        <FaSyncAlt className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    {["All", "Unread", "Read"].map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setFilter(option)}
                            className={`rounded-lg px-5 py-2 font-medium transition ${filter === option
                                ? "bg-red-600 text-white"
                                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {option}
                            {option === "Unread" ? ` (${unreadCount})` : ""}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">
                        Loading notifications...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                        <FaBell className="mx-auto mb-4 text-4xl text-gray-300" />
                        <h2 className="text-xl font-semibold text-gray-700">
                            No notifications found
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Notifications from your connected backend will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((item) => {
                            const id = item._id || item.id;
                            const type =
                                item.type || item.notificationType || item.title || "";
                            const style = getNotificationStyle(type);
                            const title =
                                item.title || item.subject || "Notification";
                            const message =
                                item.message || item.description || item.body || "";
                            const read = isRead(item);

                            return (
                                <article
                                    key={id}
                                    className={`flex flex-col justify-between gap-5 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:p-6 ${read
                                        ? "border-gray-200"
                                        : "border-red-200"
                                        }`}
                                >
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl sm:h-14 sm:w-14 sm:text-2xl ${style.color}`}
                                        >
                                            {style.icon}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
                                                    {title}
                                                </h2>

                                                {!read && (
                                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                                        New
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 break-words text-sm leading-6 text-gray-600 sm:text-base">
                                                {message}
                                            </p>

                                            <p className="mt-3 text-xs text-gray-400 sm:text-sm">
                                                {formatTime(
                                                    item.createdAt ||
                                                    item.timestamp ||
                                                    item.date
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center justify-end">
                                        {read ? (
                                            <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                                                <FaCheckCircle />
                                                Read
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => markAsRead(item)}
                                                disabled={updatingId === id}
                                                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {updatingId === id
                                                    ? "Updating..."
                                                    : "Mark as Read"}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default BloodBankNotifications;
