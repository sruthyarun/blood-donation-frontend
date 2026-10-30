
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

import {
    FaSearch,
    FaUser,
    FaTint,
    FaCalendarAlt,
    FaCheck,
    FaTimes,
} from "react-icons/fa";

import HospitalPanel from "../../components/HospitalPanel";
import axiosInstance from "../../API/axiosInstance";

function BloodRequests() {
    const user = useSelector(
        (state) => state.user.currentUser
    );

    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");


    const fetchRequests = useCallback(async () => {
        if (!user?.hospitalName) {
            setRequests([]);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get(
                "/bloodRequests",
                {
                    params: {
                        hospital: user.hospitalName,
                    },
                }
            );

            // Backend returns { success, count, data }
            const data = response.data.data;

            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(
                "Failed to fetch blood requests:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Unable to load blood requests."
            );
        } finally {
            setLoading(false);
        }
    }, [user?.hospitalName]);


    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);


    const updateStatus = async (request, status) => {
        const requestId = request._id || request.id;

        if (!requestId) {
            alert("Request ID is missing.");
            return;
        }

        try {
            setUpdatingId(requestId);
            setError("");

            const response = await axiosInstance.patch(
                `/bloodRequests/${requestId}`,
                {
                    status,
                    emailBy: user?.email || "",
                }
            );

            await fetchRequests();

            if (response.data.notificationCreated === false) {
                alert(
                    response.data.message ||
                    "Request updated, but notification was not saved."
                );
                return;
            }

            alert(
                `Blood request ${status.toLowerCase()} successfully. ` +
                "Recipient notification saved."
            );
        } catch (err) {
            console.error(
                "Failed to update blood request:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to update blood request."
            );
        } finally {
            setUpdatingId(null);
        }
    };


    const filteredRequests = requests.filter((item) => {
        const query = search.trim().toLowerCase();

        return (
            item.patientName?.toLowerCase().includes(query) ||
            item.bloodGroup?.toLowerCase().includes(query)
        );
    });

    const formatDate = (date) => {
        if (!date) return "Date not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <HospitalPanel />

            <main className="flex-1 min-w-0 p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-2">
                    Blood Requests
                </h1>

                <p className="text-gray-500 mb-8">
                    Manage recipient blood requests
                </p>

                {/* Search */}
                <div className="bg-white shadow rounded-lg p-3 flex items-center mb-8">
                    <FaSearch className="text-gray-500" />

                    <input
                        className="ml-3 outline-none w-full"
                        placeholder="Search patient / blood group"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6 text-center">
                        <h2 className="text-3xl font-bold text-red-600">
                            {requests.length}
                        </h2>
                        <p>Total Requests</p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6 text-center">
                        <h2 className="text-3xl font-bold text-yellow-600">
                            {
                                requests.filter(
                                    (r) => r.status === "Pending"
                                ).length
                            }
                        </h2>
                        <p>Pending</p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6 text-center">
                        <h2 className="text-3xl font-bold text-green-600">
                            {
                                requests.filter(
                                    (r) => r.status === "Approved"
                                ).length
                            }
                        </h2>
                        <p>Approved</p>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6 text-center">
                        <h2 className="text-3xl font-bold text-red-600">
                            {
                                requests.filter(
                                    (r) => r.priority === "Emergency"
                                ).length
                            }
                        </h2>
                        <p>Emergency
                        </p>
                    </div>
                </div>

                {/* Request cards */}
                {loading ? (
                    <div className="bg-white p-10 rounded-xl text-center">
                        Loading blood requests...
                    </div>
                ) : filteredRequests.length > 0 ? (
                    <div className="space-y-6">
                        {filteredRequests.map((request) => {
                            const requestId =
                                request._id || request.id;

                            return (
                                <div
                                    key={requestId}
                                    className="bg-white rounded-xl shadow-lg p-6"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                                                <FaUser />
                                                {request.patientName ||
                                                    "Patient name unavailable"}
                                            </h2>

                                            <p className="mt-3 flex items-center gap-2">
                                                <FaTint className="text-red-600" />
                                                Blood Group:
                                                <b>
                                                    {request.bloodGroup || "N/A"}
                                                </b>
                                            </p>

                                            <p>
                                                Units Required:{" "}
                                                <b>{request.units ?? "N/A"}</b>
                                            </p>

                                            <p className="flex items-center gap-2 mt-2">
                                                <FaCalendarAlt className="text-red-600" />
                                                {formatDate(
                                                    request.requiredDate ||
                                                    request.date ||
                                                    request.createdAt
                                                )}
                                            </p>

                                            <p className="mt-2">
                                                Hospital:{" "}
                                                <b>{request.hospital || "N/A"}</b>
                                            </p>

                                            <p className="mt-1">
                                                Recipient:{" "}
                                                <b>{request.recipientName || "N/A"}</b>
                                            </p>
                                        </div>

                                        <span
                                            className={`px-4 py-2 rounded-full h-fit font-medium ${request.status === "Approved"
                                                ? "bg-green-100 text-green-700"
                                                : request.status === "Rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {request.status || "Pending"}
                                        </span>
                                    </div>

                                    <div className="mt-5 space-y-2">
                                        <p>
                                            Priority:{" "}
                                            <span className="font-semibold">
                                                {request.priority || "Normal"}
                                            </span>
                                        </p>

                                        <p>
                                            Reason:{" "}
                                            <span className="font-semibold">
                                                {request.notes || request.reason || "Not specified"}
                                            </span>
                                        </p>

                                        <p>
                                            Contact:{" "}
                                            <span className="font-semibold">
                                                {request.phone || "N/A"}
                                            </span>
                                        </p>
                                    </div>

                                    {request.status === "Pending" && (
                                        <div className="flex flex-wrap gap-4 mt-6">
                                            <button
                                                disabled={updatingId === requestId}
                                                onClick={() =>
                                                    updateStatus(
                                                        request,
                                                        "Approved"
                                                    )
                                                }
                                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                                            >
                                                <FaCheck />
                                                {updatingId === requestId
                                                    ? "Updating..."
                                                    : "Approve"}
                                            </button>

                                            <button
                                                disabled={updatingId === requestId}
                                                onClick={() =>
                                                    updateStatus(
                                                        request,
                                                        "Rejected"
                                                    )
                                                }
                                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                                            >
                                                <FaTimes />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white p-10 rounded-xl text-center">
                        {search
                            ? "No matching blood requests found."
                            : "No blood requests found for this hospital."}
                    </div>
                )}
            </main>
        </div>
    );
}

export default BloodRequests;
