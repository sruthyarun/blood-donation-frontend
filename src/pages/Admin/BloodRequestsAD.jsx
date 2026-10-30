import { useEffect, useState } from "react";
import axios from "axios";
import {
    FaSearch,
    FaTint,
    FaHospital,
    FaUser,
    FaCalendarAlt,
    FaEye,
    FaCheck,
    FaTimes,
    FaTrash,
} from "react-icons/fa";
import AdminPanel from "../../components/AdminPanel";

function BloodRequestsADm() {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get("https://blood-donation-backend-olwl.onrender.com/bloodRequests");
            setRequests(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const filteredRequests = requests.filter((request) =>
        (request.recipient || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (request.hospital || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (request.bloodGroup || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );


    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-700";
            case "Rejected":
                return "bg-red-100 text-red-700";
            case "Completed":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    const getPriorityColor = (priority) => {
        return priority === "Emergency"
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700";
    };
    const deleteRequest = async (id) => {
        if (!window.confirm("Delete this request?")) return;

        await axios.delete(`https://blood-donation-backend-olwl.onrender.com/api/bloodRequests/${id}`);

        fetchRequests();
    };
    const updateStatus = async (id, status) => {
        const request = requests.find((r) => r.id === id);

        await axios.put(
            `https://blood-donation-backend-olwl.onrender.com/api/bloodRequests/${id}`,
            {
                ...request,
                status,
            }
        );

        fetchRequests();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />
            <div className="min-h-screen bg-gray-100 p-8 flex-1">

                <div className="flex flex-col md:flex-row justify-between items-center mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Blood Request Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage all blood requests from recipients.
                        </p>
                    </div>

                    <div className="flex items-center bg-white rounded-lg shadow px-4 py-3 mt-4 md:mt-0">
                        <FaSearch className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search request..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="ml-2 outline-none"
                        />
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
                        <h3 className="text-gray-500 font-medium">Total Requests</h3>
                        <h2 className="text-4xl font-bold text-red-600 mt-2">
                            {requests.length}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                        <h3 className="text-gray-500 font-medium">Pending</h3>
                        <h2 className="text-4xl font-bold text-yellow-500 mt-2">
                            {requests.filter((r) => r.status === "Pending").length}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
                        <h3 className="text-gray-500 font-medium">Approved</h3>
                        <h2 className="text-4xl font-bold text-green-600 mt-2">
                            {requests.filter((r) => r.status === "Approved").length}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
                        <h3 className="text-gray-500 font-medium">Completed</h3>
                        <h2 className="text-4xl font-bold text-blue-600 mt-2">
                            {requests.filter((r) => r.status === "Completed").length}
                        </h2>
                    </div>

                </div>


                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

                    <table className="w-full">

                        <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                            <tr>
                                <th className="py-4 px-3">Request ID</th>
                                <th>Recipient</th>
                                <th>Hospital</th>
                                <th>Blood</th>
                                <th>Units</th>
                                <th>Priority</th>
                                <th>Blood Status</th>
                                <th>Required Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredRequests.map((request) => (

                                <tr
                                    key={request.id}
                                    className="border-b hover:bg-red-50 text-center transition"
                                >

                                    <td className="py-4 font-semibold">
                                        {request.id}
                                    </td>

                                    <td>
                                        <div className="flex justify-center items-center gap-2">
                                            <FaUser className="text-red-600" />
                                            {request.recipient}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex justify-center items-center gap-2">
                                            <FaHospital className="text-red-600" />
                                            {request.hospital}
                                        </div>
                                    </td>

                                    <td>

                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">

                                            <FaTint className="inline mr-1" />

                                            {request.bloodGroup}

                                        </span>

                                    </td>

                                    <td className="font-semibold">
                                        {request.units}
                                    </td>

                                    <td>

                                        <span
                                            className={`px-3 py-1 rounded-full font-medium ${request.priority === "Emergency"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-blue-100 text-blue-700"
                                                }`}
                                        >
                                            {request.priority}
                                        </span>

                                    </td>

                                    <td>

                                        <span
                                            className={`px-3 py-1 rounded-full font-medium ${request.bloodStatus === "Available"
                                                ? "bg-green-100 text-green-700"
                                                : request.bloodStatus === "Low Stock"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {request.bloodStatus}
                                        </span>

                                    </td>

                                    <td>
                                        <div className="flex justify-center items-center gap-2">
                                            <FaCalendarAlt className="text-red-600" />
                                            {request.requiredDate}
                                        </div>
                                    </td>

                                    <td>

                                        <span
                                            className={`px-3 py-1 rounded-full font-medium ${request.status === "Approved"
                                                ? "bg-green-100 text-green-700"
                                                : request.status === "Completed"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : request.status === "Rejected"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {request.status}
                                        </span>

                                    </td>

                                    <td>

                                        <div className="flex justify-center gap-2">

                                            <button
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                                                title="View"
                                            >
                                                <FaEye />
                                            </button>

                                            {request.status === "Pending" && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(request.id, "Approved")}
                                                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
                                                    >
                                                        <FaCheck />
                                                    </button>

                                                    <button
                                                        onClick={() => updateStatus(request.id, "Rejected")}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => deleteRequest(request.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                                            >
                                                <FaTrash />
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>
        </div>
    );
}

export default BloodRequestsADm;