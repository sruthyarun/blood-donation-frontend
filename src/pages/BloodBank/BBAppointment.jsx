import { useState } from "react";
import {
    FaCalendarAlt,
    FaSearch,
    FaPlus,
    FaEye,
    FaCheck,
    FaTimes,
    FaUserFriends,
} from "react-icons/fa";

function BBAppointments() {
    const [search, setSearch] = useState("");

    const appointments = [
        {
            id: 1,
            donor: "Arun Kumar",
            bloodGroup: "A+",
            date: "28 Jul 2026",
            time: "10:00 AM",
            hospital: "City Blood Bank",
            status: "Approved",
        },
        {
            id: 2,
            donor: "Anjali Nair",
            bloodGroup: "O-",
            date: "28 Jul 2026",
            time: "11:30 AM",
            hospital: "Central Blood Bank",
            status: "Pending",
        },
        {
            id: 3,
            donor: "Rahul Das",
            bloodGroup: "B+",
            date: "29 Jul 2026",
            time: "09:30 AM",
            hospital: "Life Care Blood Bank",
            status: "Completed",
        },
        {
            id: 4,
            donor: "Sneha Joseph",
            bloodGroup: "AB+",
            date: "29 Jul 2026",
            time: "02:00 PM",
            hospital: "City Blood Bank",
            status: "Cancelled",
        },
    ];

    const filteredAppointments = appointments.filter((item) =>
        item.donor.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Header */}

            <div className="flex justify-between items-center mb-8">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Appointment Management
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Manage donor appointments.
                    </p>
                </div>

                <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg flex items-center gap-2">
                    <FaPlus />
                    Add Appointment
                </button>

            </div>

            {/* Summary Cards */}

            <div className="grid md:grid-cols-4 gap-6 mb-8">

                <div className="bg-red-600 text-white rounded-xl shadow-lg p-6">
                    <FaCalendarAlt className="text-4xl mb-3" />
                    <h2 className="text-3xl font-bold">48</h2>
                    <p>Total Appointments</p>
                </div>

                <div className="bg-blue-600 text-white rounded-xl shadow-lg p-6">
                    <FaUserFriends className="text-4xl mb-3" />
                    <h2 className="text-3xl font-bold">15</h2>
                    <p>Today's Appointments</p>
                </div>

                <div className="bg-green-600 text-white rounded-xl shadow-lg p-6">
                    <h2 className="text-3xl font-bold">28</h2>
                    <p>Completed</p>
                </div>

                <div className="bg-yellow-500 text-white rounded-xl shadow-lg p-6">
                    <h2 className="text-3xl font-bold">8</h2>
                    <p>Pending</p>
                </div>

            </div>

            {/* Search */}

            <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 mb-6">
                <FaSearch className="text-gray-500" />

                <input
                    type="text"
                    placeholder="Search donor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full outline-none"
                />
            </div>

            {/* Appointment Table */}

            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-red-600 text-white">
                        <tr>
                            <th className="py-4">Donor</th>
                            <th>Blood Group</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Blood Bank</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {filteredAppointments.map((item) => (

                            <tr
                                key={item.id}
                                className="text-center border-b hover:bg-gray-50"
                            >
                                <td className="py-4 font-semibold">{item.donor}</td>

                                <td className="font-bold text-red-600">
                                    {item.bloodGroup}
                                </td>

                                <td>{item.date}</td>

                                <td>{item.time}</td>

                                <td>{item.hospital}</td>

                                <td>
                                    <span
                                        className={`px-3 py-1 rounded-full text-white
                    ${item.status === "Approved"
                                                ? "bg-green-600"
                                                : item.status === "Pending"
                                                    ? "bg-yellow-500"
                                                    : item.status === "Completed"
                                                        ? "bg-blue-600"
                                                        : "bg-red-600"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </td>

                                <td>

                                    <div className="flex justify-center gap-2">

                                        <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                                            <FaEye />
                                        </button>

                                        <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg">
                                            <FaCheck />
                                        </button>

                                        <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">
                                            <FaTimes />
                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* Information */}

            <div className="mt-8 bg-blue-100 border-l-4 border-blue-600 rounded-lg p-5">

                <h3 className="font-bold text-blue-700">
                    Appointment Guidelines
                </h3>

                <p className="text-gray-700 mt-2">
                    Donors should arrive at least 15 minutes before the scheduled time
                    with a valid ID. Ensure the donor is medically fit before blood
                    collection.
                </p>

            </div>

        </div>
    );
}

export default BBAppointments;