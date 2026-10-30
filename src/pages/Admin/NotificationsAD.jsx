import { useEffect, useState } from "react";
import axios from "axios";
import {
    FaBell,
    FaTint,
    FaHospital,
    FaUserPlus,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaCheck,
    FaTrash,
} from "react-icons/fa";
import AdminPanel from "../../components/AdminPanel";

function NotificationsADm() {
    const [notifications, setNotifications] = useState([]);
    const [search, setSearch] = useState("");

    const API_URL = "https://blood-donation-backend-olwl.onrender.com/api/notifications";

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(API_URL);
            setNotifications(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const markAsRead = async (id) => {
        const notification = notifications.find((item) => item.id === id);

        await axios.patch(`${API_URL}/${id}`, {
            status: "Read",
        });

        fetchNotifications();
    };

    const deleteNotification = async (id) => {
        if (window.confirm("Delete this notification?")) {
            await axios.delete(`${API_URL}/${id}`);
            fetchNotifications();
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "Emergency":
                return (
                    <FaExclamationTriangle className="text-red-600 text-2xl" />
                );

            case "Donor":
                return (
                    <FaUserPlus className="text-green-600 text-2xl" />
                );

            case "Hospital":
                return (
                    <FaHospital className="text-blue-600 text-2xl" />
                );

            case "Appointment":
                return (
                    <FaCalendarAlt className="text-purple-600 text-2xl" />
                );

            default:
                return (
                    <FaTint className="text-red-500 text-2xl" />
                );
        }
    };

    const filteredNotifications = notifications.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.message.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />
            <div className="min-h-screen bg-gray-100 p-8 flex-1">

                <div className="flex flex-col md:flex-row justify-between items-center mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Notifications
                        </h1>

                        <p className="text-gray-500 mt-2">
                            View and manage all system notifications.
                        </p>
                    </div>

                    <div className="flex gap-4 mt-4 md:mt-0">

                        <div className="bg-white shadow rounded-lg px-4 py-3">
                            <input
                                type="text"
                                placeholder="Search notification..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="outline-none"
                            />
                        </div>

                        <div className="bg-red-600 text-white px-5 py-3 rounded-lg flex items-center gap-2">
                            <FaBell />
                            {notifications.length} Notifications
                        </div>

                    </div>

                </div>


                < div className="space-y-5" >

                    {
                        filteredNotifications.map((item) => (

                            <div
                                key={item.id}
                                className={`bg-white rounded-xl shadow-md p-5 flex justify-between items-center border-l-4 ${item.status === "Unread"
                                    ? "border-red-600"
                                    : "border-green-600"
                                    }`}
                            >

                                <div className="flex gap-5">

                                    {getIcon(item.type)}

                                    <div>

                                        <h2 className="text-lg font-bold">
                                            {item.title}
                                        </h2>

                                        <p className="text-gray-600 mt-1">
                                            {item.message}
                                        </p>

                                        <div className="flex gap-4 mt-3">

                                            <span className="text-gray-500 text-sm">
                                                {item.time}
                                            </span>

                                            <span
                                                className={`font-semibold text-sm ${item.status === "Unread"
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                                <div className="flex gap-3">

                                    {item.status === "Unread" && (
                                        <button
                                            onClick={() => markAsRead(item.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                        >
                                            <FaCheck />
                                            Read
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deleteNotification(item.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <FaTrash />
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))
                    }

                </div >

            </div >
        </div>
    );
}

export default NotificationsADm;