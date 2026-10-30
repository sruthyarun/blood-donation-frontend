import { useState } from "react";
import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaTint,
    FaUser,
} from "react-icons/fa";

function BloodCollection() {
    const [search, setSearch] = useState("");

    const collections = [
        {
            id: 1,
            donor: "Arun Kumar",
            bloodGroup: "A+",
            units: 1,
            date: "25 Jul 2026",
            hospital: "City Hospital",
            status: "Collected",
        },
        {
            id: 2,
            donor: "Rahul Das",
            bloodGroup: "O+",
            units: 2,
            date: "25 Jul 2026",
            hospital: "General Hospital",
            status: "Collected",
        },
        {
            id: 3,
            donor: "Anjali Nair",
            bloodGroup: "B+",
            units: 1,
            date: "24 Jul 2026",
            hospital: "Medical College",
            status: "Collected",
        },
        {
            id: 4,
            donor: "Sneha Joseph",
            bloodGroup: "AB-",
            units: 1,
            date: "24 Jul 2026",
            hospital: "Life Care Hospital",
            status: "Pending",
        },
    ];

    const filteredData = collections.filter((item) =>
        item.donor.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Header */}

            <div className="flex justify-between items-center mb-8">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Blood Collection
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Manage blood collected from donors.
                    </p>
                </div>

                <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg flex items-center gap-2">
                    <FaPlus />
                    Add Collection
                </button>

            </div>

            {/* Summary Cards */}

            <div className="grid md:grid-cols-4 gap-6 mb-8">

                <div className="bg-red-600 text-white rounded-xl p-6 shadow-lg">
                    <FaTint className="text-4xl mb-3" />
                    <h2 className="text-3xl font-bold">120</h2>
                    <p>Total Collections</p>
                </div>

                <div className="bg-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <FaUser className="text-4xl mb-3" />
                    <h2 className="text-3xl font-bold">85</h2>
                    <p>Total Donors</p>
                </div>

                <div className="bg-green-600 text-white rounded-xl p-6 shadow-lg">
                    <h2 className="text-3xl font-bold">18</h2>
                    <p>Today's Collections</p>
                </div>

                <div className="bg-yellow-500 text-white rounded-xl p-6 shadow-lg">
                    <h2 className="text-3xl font-bold">6</h2>
                    <p>Pending Collections</p>
                </div>

            </div>

            {/* Search */}

            <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 mb-6">

                <FaSearch className="text-gray-500" />

                <input
                    type="text"
                    placeholder="Search Donor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full outline-none"
                />

            </div>

            {/* Table */}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                <table className="w-full">

                    <thead className="bg-red-600 text-white">

                        <tr>
                            <th className="py-4">Donor Name</th>
                            <th>Blood Group</th>
                            <th>Units</th>
                            <th>Date</th>
                            <th>Hospital</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {filteredData.map((item) => (

                            <tr
                                key={item.id}
                                className="text-center border-b hover:bg-gray-50"
                            >

                                <td className="py-4 font-semibold">
                                    {item.donor}
                                </td>

                                <td className="text-red-600 font-bold">
                                    {item.bloodGroup}
                                </td>

                                <td>{item.units}</td>

                                <td>{item.date}</td>

                                <td>{item.hospital}</td>

                                <td>

                                    <span
                                        className={`px-3 py-1 rounded-full text-white ${item.status === "Collected"
                                                ? "bg-green-600"
                                                : "bg-yellow-500"
                                            }`}
                                    >
                                        {item.status}
                                    </span>

                                </td>

                                <td>

                                    <div className="flex justify-center gap-3">

                                        <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg">
                                            <FaEdit />
                                        </button>

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

export default BloodCollection;