import { useState } from "react";
import {
    FaSearch,
    FaUser,
    FaTint,
    FaCalendarAlt,
    FaClock,
    FaEye,
    FaCheck,
    FaTimes,
} from "react-icons/fa";
import HospitalPanel from "../../components/HospitalPanel";

function AppointmentManagement() {
    const [appointments] = useState([
        {
            id: "APT001",
            patient: "Rahul Kumar",
            bloodGroup: "A+",
            units: 2,
            date: "28 Jul 2026",
            time: "10:00 AM",
            status: "Pending",
        },
        {
            id: "APT002",
            patient: "Anjali Nair",
            bloodGroup: "O-",
            units: 1,
            date: "28 Jul 2026",
            time: "11:30 AM",
            status: "Confirmed",
        },
        {
            id: "APT003",
            patient: "Joseph Mathew",
            bloodGroup: "B+",
            units: 3,
            date: "27 Jul 2026",
            time: "09:30 AM",
            status: "Completed",
        },
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed":
                return "bg-green-100 text-green-700";
            case "Completed":
                return "bg-blue-100 text-blue-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}

            <HospitalPanel />
            <div className="min-h-screen bg-gray-100 p-8 flex-1">

                {/* Header */}

                <div className="flex flex-col md:flex-row justify-between items-center mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Appointment Management
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Manage recipient appointments.
                        </p>
                    </div>

                    <div className="flex items-center bg-white shadow rounded-lg px-4 py-3 mt-4 md:mt-0">
                        <FaSearch className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search appointment..."
                            className="ml-2 outline-none"
                        />
                    </div>

                </div>

                {/* Summary Cards */}

                <div className="grid md:grid-cols-4 gap-6 mb-8">

                    <div className="bg-red-600 text-white rounded-xl p-6 text-center">
                        <h2 className="text-3xl font-bold">36</h2>
                        <p>Total Appointments</p>
                    </div>

                    <div className="bg-yellow-500 text-white rounded-xl p-6 text-center">
                        <h2 className="text-3xl font-bold">8</h2>
                        <p>Pending</p>
                    </div>

                    <div className="bg-green-600 text-white rounded-xl p-6 text-center">
                        <h2 className="text-3xl font-bold">20</h2>
                        <p>Confirmed</p>
                    </div>

                    <div className="bg-blue-600 text-white rounded-xl p-6 text-center">
                        <h2 className="text-3xl font-bold">8</h2>
                        <p>Completed</p>
                    </div>

                </div>

                {/* Appointment Table */}

                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

                    <table className="w-full">

                        <thead className="bg-red-600 text-white">
                            <tr>
                                <th className="py-4">Appointment ID</th>
                                <th>Patient</th>
                                <th>Blood Group</th>
                                <th>Units</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {appointments.map((appointment) => (

                                <tr
                                    key={appointment.id}
                                    className="text-center border-b hover:bg-gray-50"
                                >

                                    <td className="py-4">{appointment.id}</td>

                                    <td>
                                        <div className="flex justify-center items-center gap-2">
                                            <FaUser className="text-red-600" />
                                            {appointment.patient}
                                        </div>
                                    </td>

                                    <td>
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                                            <FaTint className="inline mr-1" />
                                            {appointment.bloodGroup}
                                        </span>
                                    </td>

                                    <td>{appointment.units}</td>

                                    <td>
                                        <div className="flex justify-center items-center gap-2">
                                            <FaCalendarAlt className="text-red-600" />
                                            {appointment.date}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex justify-center items-center gap-2">
                                            <FaClock className="text-red-600" />
                                            {appointment.time}
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`px-3 py-1 rounded-full ${getStatusColor(
                                                appointment.status
                                            )}`}
                                        >
                                            {appointment.status}
                                        </span>
                                    </td>

                                    <td>

                                        <div className="flex justify-center gap-2">

                                            {/* View */}
                                            <button
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                                                title="View"
                                            >
                                                <FaEye />
                                            </button>

                                            {/* Confirm */}
                                            {appointment.status === "Pending" && (
                                                <button
                                                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
                                                    title="Confirm"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}

                                            {/* Complete */}
                                            {appointment.status === "Confirmed" && (
                                                <button
                                                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg"
                                                    title="Mark Completed"
                                                >
                                                    ✔
                                                </button>
                                            )}

                                            {/* Cancel */}
                                            {appointment.status !== "Completed" && (
                                                <button
                                                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                                                    title="Cancel"
                                                >
                                                    <FaTimes />
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
        </div>
    );
}

export default AppointmentManagement;