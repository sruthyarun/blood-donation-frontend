
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    FaSearch,
    FaEnvelope,
    FaUser,
    FaPhoneAlt,
    FaCalendarAlt,
    FaCheckCircle,
    FaTrash,
    FaEye,
    FaSyncAlt,
    FaCommentDots,
    FaInbox,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";

const API_URL =
    "https://blood-donation-backend-olwl.onrender.com/api/feedback";

function FeedbackManagementADm() {
    const [feedback, setFeedback] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(false);
    const [selectedFeedback, setSelectedFeedback] =
        useState(null);


    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            setFeedback(response.data);
        } catch (error) {
            console.error(
                "Error fetching feedback:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredFeedback = useMemo(() => {
        const searchValue = search
            .toLowerCase()
            .trim();

        return feedback
            .filter((item) => {
                if (statusFilter === "All") {
                    return true;
                }

                return (
                    item.status?.toLowerCase() ===
                    statusFilter.toLowerCase()
                );
            })
            .filter((item) => {
                return (
                    item.name
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    item.email
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    item.subject
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    item.message
                        ?.toLowerCase()
                        .includes(searchValue)
                );
            });
    }, [feedback, search, statusFilter]);



    const totalFeedback = feedback.length;

    const newFeedback = feedback.filter(
        (item) =>
            item.status?.toLowerCase() === "new"
    ).length;

    const readFeedback = feedback.filter(
        (item) =>
            item.status?.toLowerCase() === "read"
    ).length;


    const markAsRead = async (item) => {
        try {
            await axios.patch(
                `${API_URL}/${item.id}`,
                {
                    status: "Read",
                }
            );

            setFeedback((prev) =>
                prev.map((feedbackItem) =>
                    feedbackItem.id === item.id
                        ? {
                            ...feedbackItem,
                            status: "Read",
                        }
                        : feedbackItem
                )
            );

            if (
                selectedFeedback?.id ===
                item.id
            ) {
                setSelectedFeedback({
                    ...item,
                    status: "Read",
                });
            }
        } catch (error) {
            console.error(
                "Error updating feedback:",
                error
            );

            alert(
                "Unable to mark feedback as read."
            );
        }
    };


    const deleteFeedback = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this feedback?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `${API_URL}/${id}`
            );

            setFeedback((prev) =>
                prev.filter(
                    (item) => item.id !== id
                )
            );

            if (
                selectedFeedback?.id === id
            ) {
                setSelectedFeedback(null);
            }
        } catch (error) {
            console.error(
                "Error deleting feedback:",
                error
            );

            alert(
                "Unable to delete feedback."
            );
        }
    };



    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    const getStatusStyle = (status) => {
        if (
            status?.toLowerCase() === "new"
        ) {
            return "bg-red-100 text-red-700";
        }

        return "bg-green-100 text-green-700";
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <div className="flex-1 p-6 lg:p-8">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            User Feedback
                        </h1>

                        <p className="text-gray-500 mt-2">
                            View and manage feedback
                            submitted through the
                            website contact page.
                        </p>
                    </div>

                    <button
                        onClick={fetchFeedback}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg font-semibold"
                    >
                        <FaSyncAlt
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                        Refresh
                    </button>

                </div>


                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

                    <SummaryCard
                        title="Total Feedback"
                        value={totalFeedback}
                        icon={<FaCommentDots />}
                        color="blue"
                    />

                    <SummaryCard
                        title="New Feedback"
                        value={newFeedback}
                        icon={<FaInbox />}
                        color="red"
                    />

                    <SummaryCard
                        title="Read Feedback"
                        value={readFeedback}
                        icon={<FaCheckCircle />}
                        color="green"
                    />

                </div>


                <div className="bg-white rounded-2xl shadow-md p-5 mb-6">

                    <div className="flex flex-col lg:flex-row gap-4">



                        <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 flex-1">

                            <FaSearch className="text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search name, email, subject or message..."
                                className="w-full ml-3 outline-none"
                            />

                        </div>



                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="All">
                                All Feedback
                            </option>

                            <option value="New">
                                New
                            </option>

                            <option value="Read">
                                Read
                            </option>
                        </select>

                    </div>

                </div>

                {loading ? (

                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">

                        <FaSyncAlt className="animate-spin text-red-600 text-3xl mx-auto" />

                        <p className="text-gray-500 mt-4">
                            Loading feedback...
                        </p>

                    </div>

                ) : filteredFeedback.length ===
                    0 ? (

                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">

                        <FaCommentDots className="text-gray-300 text-6xl mx-auto" />

                        <h3 className="text-xl font-semibold text-gray-700 mt-5">
                            No Feedback Found
                        </h3>

                        <p className="text-gray-500 mt-2">
                            No feedback matches your
                            search or filter.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {filteredFeedback.map(
                            (item) => (

                                <div
                                    key={item.id}
                                    className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${item.status
                                        ?.toLowerCase() ===
                                        "new"
                                        ? "border-red-500"
                                        : "border-green-500"
                                        }`}
                                >

                                    <div className="flex flex-col xl:flex-row gap-6">


                                        <div className="flex items-start gap-4 flex-1">

                                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">

                                                <FaUser className="text-red-600 text-xl" />

                                            </div>

                                            <div>

                                                <div className="flex flex-wrap items-center gap-3">

                                                    <h2 className="text-xl font-bold text-gray-800">
                                                        {
                                                            item.name
                                                        }
                                                    </h2>

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                                            item.status
                                                        )}`}
                                                    >
                                                        {
                                                            item.status ||
                                                            "New"
                                                        }
                                                    </span>

                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-5 mt-2 text-sm text-gray-500">

                                                    <span className="flex items-center gap-2">
                                                        <FaEnvelope className="text-red-500" />
                                                        {
                                                            item.email
                                                        }
                                                    </span>

                                                    {item.phone && (
                                                        <span className="flex items-center gap-2">
                                                            <FaPhoneAlt className="text-red-500" />
                                                            {
                                                                item.phone
                                                            }
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                        </div>


                                        <div className="xl:w-64">

                                            <p className="text-xs text-gray-400 uppercase font-semibold">
                                                Subject
                                            </p>

                                            <p className="font-semibold text-gray-700 mt-1">
                                                {
                                                    item.subject ||
                                                    "No Subject"
                                                }
                                            </p>

                                        </div>


                                        <div className="xl:w-52">

                                            <p className="text-xs text-gray-400 uppercase font-semibold">
                                                Submitted
                                            </p>

                                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                <FaCalendarAlt className="text-red-500" />
                                                {formatDate(
                                                    item.createdAt
                                                )}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="mt-5 bg-gray-50 rounded-xl p-4">

                                        <p className="text-xs text-gray-400 uppercase font-semibold mb-2">
                                            Message
                                        </p>

                                        <p className="text-gray-700 leading-relaxed line-clamp-3">
                                            {
                                                item.message
                                            }
                                        </p>

                                    </div>


                                    <div className="flex flex-wrap justify-end gap-3 mt-5">

                                        <button
                                            onClick={() =>
                                                setSelectedFeedback(
                                                    item
                                                )
                                            }
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg font-semibold transition"
                                        >
                                            <FaEye />
                                            View
                                        </button>

                                        {item.status
                                            ?.toLowerCase() !==
                                            "read" && (

                                                <button
                                                    onClick={() =>
                                                        markAsRead(
                                                            item
                                                        )
                                                    }
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white rounded-lg font-semibold transition"
                                                >
                                                    <FaCheckCircle />
                                                    Mark as Read
                                                </button>

                                            )}

                                        <button
                                            onClick={() =>
                                                deleteFeedback(
                                                    item.id
                                                )
                                            }
                                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg font-semibold transition"
                                        >
                                            <FaTrash />
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

            {selectedFeedback && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">


                        <div className="flex items-center justify-between p-6 border-b">

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Feedback Details
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Submitted by{" "}
                                    {
                                        selectedFeedback.name
                                    }
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedFeedback(
                                        null
                                    )
                                }
                                className="text-gray-500 hover:text-red-600 text-2xl"
                            >
                                ✕
                            </button>

                        </div>


                        <div className="p-6 space-y-5">

                            <div className="grid sm:grid-cols-2 gap-5">

                                <div className="bg-gray-50 rounded-xl p-4">

                                    <p className="text-xs text-gray-400 uppercase">
                                        Name
                                    </p>

                                    <p className="font-semibold text-gray-800 mt-1">
                                        {
                                            selectedFeedback.name
                                        }
                                    </p>

                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">

                                    <p className="text-xs text-gray-400 uppercase">
                                        Email
                                    </p>

                                    <p className="font-semibold text-gray-800 mt-1 break-all">
                                        {
                                            selectedFeedback.email
                                        }
                                    </p>

                                </div>

                                {selectedFeedback.phone && (
                                    <div className="bg-gray-50 rounded-xl p-4">

                                        <p className="text-xs text-gray-400 uppercase">
                                            Phone
                                        </p>

                                        <p className="font-semibold text-gray-800 mt-1">
                                            {
                                                selectedFeedback.phone
                                            }
                                        </p>

                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-xl p-4">

                                    <p className="text-xs text-gray-400 uppercase">
                                        Status
                                    </p>

                                    <span
                                        className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                                            selectedFeedback.status
                                        )}`}
                                    >
                                        {
                                            selectedFeedback.status
                                        }
                                    </span>

                                </div>

                            </div>

                            <div>

                                <p className="text-sm font-semibold text-gray-500">
                                    Subject
                                </p>

                                <p className="text-lg font-bold text-gray-800 mt-1">
                                    {
                                        selectedFeedback.subject
                                    }
                                </p>

                            </div>

                            <div>

                                <p className="text-sm font-semibold text-gray-500 mb-2">
                                    Message
                                </p>

                                <div className="bg-gray-50 rounded-xl p-5">

                                    <p className="text-gray-700 leading-7 whitespace-pre-wrap">
                                        {
                                            selectedFeedback.message
                                        }
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">

                                <FaCalendarAlt />

                                <span>
                                    Submitted:{" "}
                                    {formatDate(
                                        selectedFeedback.createdAt
                                    )}
                                </span>

                            </div>

                        </div>


                        <div className="flex justify-end gap-3 p-6 border-t">

                            {selectedFeedback.status
                                ?.toLowerCase() !==
                                "read" && (

                                    <button
                                        onClick={() =>
                                            markAsRead(
                                                selectedFeedback
                                            )
                                        }
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
                                    >
                                        <FaCheckCircle />
                                        Mark as Read
                                    </button>

                                )}

                            <button
                                onClick={() =>
                                    deleteFeedback(
                                        selectedFeedback.id
                                    )
                                }
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold"
                            >
                                <FaTrash />
                                Delete
                            </button>

                            <button
                                onClick={() =>
                                    setSelectedFeedback(
                                        null
                                    )
                                }
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-3 rounded-lg font-semibold"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


function SummaryCard({
    title,
    value,
    icon,
    color,
}) {
    const styles = {
        blue: {
            border: "border-blue-600",
            text: "text-blue-600",
            bg: "bg-blue-100",
        },

        red: {
            border: "border-red-600",
            text: "text-red-600",
            bg: "bg-red-100",
        },

        green: {
            border: "border-green-600",
            text: "text-green-600",
            bg: "bg-green-100",
        },
    };

    const style =
        styles[color] || styles.blue;

    return (
        <div
            className={`bg-white rounded-2xl shadow-md p-5 border-l-4 ${style.border}`}
        >

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-gray-500 text-sm">
                        {title}
                    </p>

                    <p
                        className={`text-3xl font-bold mt-2 ${style.text}`}
                    >
                        {value}
                    </p>

                </div>

                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${style.bg}`}
                >
                    <span className={style.text}>
                        {icon}
                    </span>
                </div>

            </div>

        </div>
    );
}

export default FeedbackManagementADm;
