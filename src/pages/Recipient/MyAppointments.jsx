import { useState } from "react";
import {
    FaSearch,
    FaHospital,
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt,
    FaEye,
    FaTrash,
} from "react-icons/fa";

function MyAppointments() {
    const [appointments] = useState([
        {
            id: "APT1001",
            hospital: "City Hospital",
            location: "Kochi",
            bloodGroup: "A+",
            units: 2,
            date: "28 July 2026",
            time: "10:30 AM",
            status: "Confirmed",
        },
        {
            id: "APT1002",
            hospital: "Medical College",
            location: "Thrissur",
            bloodGroup: "O+",
            units: 1,
            date: "30 July 2026",
            time: "09:00 AM",
            status: "Pending",
        },
        {
            id: "APT1003",
            hospital: "District Hospital",
            location: "Ernakulam",
            bloodGroup: "B+",
            units: 3,
            date: "15 July 2026",
            time: "11:00 AM",
            status: "Completed",
        },
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed":
                return "bg-green-100 text-green-700";
            case "Pending":
                return "bg-yellow-100 text-yellow-700";
            case "Completed":
                return "bg-blue-100 text-blue-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Appointments
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Track and manage your appointments.
                    </p>
                </div>

                <div className="flex items-center bg-white shadow rounded-lg px-4 py-2 mt-4 md:mt-0">
                    <FaSearch className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="ml-2 outline-none"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-red-600 text-white rounded-xl p-6 text-center">
                    <h2 className="text-3xl font-bold">3</h2>
                    <p>Total Appointments</p>
                </div>

                <div className="bg-yellow-500 text-white rounded-xl p-6 text-center">
                    <h2 className="text-3xl font-bold">1</h2>
                    <p>Pending</p>
                </div>

                <div className="bg-green-600 text-white rounded-xl p-6 text-center">
                    <h2 className="text-3xl font-bold">1</h2>
                    <p>Confirmed</p>
                </div>

                <div className="bg-blue-600 text-white rounded-xl p-6 text-center">
                    <h2 className="text-3xl font-bold">1</h2>
                    <p>Completed</p>
                </div>
            </div>

            {/* Appointment Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-red-600 text-white">
                        <tr>
                            <th className="py-4 px-4">ID</th>
                            <th>Hospital</th>
                            <th>Blood Group</th>
                            <th>Units</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {appointments.map((item) => (

                            <tr
                                key={item.id}
                                className="border-b hover:bg-gray-50 text-center"
                            >
                                <td className="py-4">{item.id}</td>

                                <td>
                                    <div className="flex justify-center items-center gap-2">
                                        <FaHospital className="text-red-600" />
                                        {item.hospital}
                                    </div>
                                </td>

                                <td>
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                                        {item.bloodGroup}
                                    </span>
                                </td>

                                <td>{item.units}</td>

                                <td>
                                    <div className="flex justify-center items-center gap-2">
                                        <FaCalendarAlt className="text-red-600" />
                                        {item.date}
                                    </div>
                                </td>

                                <td>
                                    <div className="flex justify-center items-center gap-2">
                                        <FaClock className="text-red-600" />
                                        {item.time}
                                    </div>
                                </td>

                                <td>
                                    <div className="flex justify-center items-center gap-2">
                                        <FaMapMarkerAlt className="text-red-600" />
                                        {item.location}
                                    </div>
                                </td>

                                <td>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                            item.status
                                        )}`}
                                    >
                                        {item.status}
                                    </span>
                                </td>

                                <td>
                                    <div className="flex justify-center gap-2">

                                        <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                                            <FaEye />
                                        </button>

                                        {item.status === "Pending" && (
                                            <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">
                                                <FaTrash />
                                            </button>
                                        )}

                                    </div>
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default MyAppointments;