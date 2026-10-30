import { useState } from "react";
import {
    FaSearch,
    FaUser,
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaEye,
    FaEdit,
    FaTrash,
    FaLock,
    FaUnlock,
} from "react-icons/fa";

function UserManagement() {
    const [users] = useState([
        {
            id: "U001",
            name: "Arun Kumar",
            role: "Donor",
            email: "arun@gmail.com",
            phone: "+91 9876543210",
            city: "Kochi",
            status: "Active",
        },
        {
            id: "U002",
            name: "Rahul Kumar",
            role: "Recipient",
            email: "rahul@gmail.com",
            phone: "+91 9876543222",
            city: "Thrissur",
            status: "Active",
        },
        {
            id: "U003",
            name: "City Hospital",
            role: "Hospital",
            email: "cityhospital@gmail.com",
            phone: "+91 9876543333",
            city: "Ernakulam",
            status: "Blocked",
        },
        {
            id: "U004",
            name: "Admin",
            role: "Admin",
            email: "admin@gmail.com",
            phone: "+91 9876543444",
            city: "Kozhikode",
            status: "Active",
        },
    ]);

    const getRoleColor = (role) => {
        switch (role) {
            case "Donor":
                return "bg-red-100 text-red-700";
            case "Recipient":
                return "bg-blue-100 text-blue-700";
            case "Hospital":
                return "bg-green-100 text-green-700";
            case "Admin":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusColor = (status) => {
        return status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700";
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">


            <div className="flex flex-col md:flex-row justify-between items-center mb-8">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        User Management
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Manage all registered users.
                    </p>
                </div>

                <div className="flex items-center bg-white rounded-lg shadow px-4 py-3 mt-4 md:mt-0">
                    <FaSearch className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="ml-2 outline-none"
                    />
                </div>

            </div>



            <div className="grid md:grid-cols-5 gap-5 mb-8">

                <div className="bg-red-600 text-white rounded-xl p-5 text-center">
                    <h2 className="text-3xl font-bold">765</h2>
                    <p>Total Users</p>
                </div>

                <div className="bg-blue-600 text-white rounded-xl p-5 text-center">
                    <h2 className="text-3xl font-bold">520</h2>
                    <p>Donors</p>
                </div>

                <div className="bg-green-600 text-white rounded-xl p-5 text-center">
                    <h2 className="text-3xl font-bold">210</h2>
                    <p>Recipients</p>
                </div>

                <div className="bg-yellow-500 text-white rounded-xl p-5 text-center">
                    <h2 className="text-3xl font-bold">30</h2>
                    <p>Hospitals</p>
                </div>

                <div className="bg-purple-600 text-white rounded-xl p-5 text-center">
                    <h2 className="text-3xl font-bold">5</h2>
                    <p>Admins</p>
                </div>

            </div>



            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-red-600 text-white">
                        <tr>
                            <th className="py-4">User ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {users.map((user) => (

                            <tr
                                key={user.id}
                                className="text-center border-b hover:bg-gray-50"
                            >
                                <td className="py-4">{user.id}</td>

                                <td>
                                    <div className="flex justify-center items-center gap-2">
                                        <FaUser className="text-red-600" />
                                        {user.name}
                                    </div>
                                </td>

                                <td>
                                    <span className={`px-3 py-1 rounded-full ${getRoleColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>

                                <td>
                                    <div className="flex justify-center items-center gap-2">
                                        <FaEnvelope className="text-red-600" />
                                        {user.email}
                                    </div>
                                </td>

                                <td>
                                    <div className="flex justify-center items-center gap-2">
                                        <FaPhoneAlt className="text-red-600" />
                                        {user.phone}
                                    </div>
                                </td>

                                <td>
                                    <div className="flex justify-center items-center gap-2">
                                        <FaMapMarkerAlt className="text-red-600" />
                                        {user.city}
                                    </div>
                                </td>

                                <td>
                                    <span className={`px-3 py-1 rounded-full ${getStatusColor(user.status)}`}>
                                        {user.status}
                                    </span>
                                </td>

                                <td>

                                    <div className="flex justify-center gap-2">

                                        <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                                            <FaEye />
                                        </button>

                                        <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg">
                                            <FaEdit />
                                        </button>

                                        {user.status === "Active" ? (
                                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg">
                                                <FaLock />
                                            </button>
                                        ) : (
                                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg">
                                                <FaUnlock />
                                            </button>
                                        )}

                                        <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">
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
    );
}

export default UserManagement;