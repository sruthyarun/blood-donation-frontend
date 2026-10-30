import { useState } from "react";
import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaTint,
    FaHospital,
    FaArrowUp,
} from "react-icons/fa";

function BloodIssue() {
    const [search, setSearch] = useState("");

    const issues = [
        {
            id: 1,
            recipient: "Rahul Kumar",
            bloodGroup: "A+",
            units: 2,
            hospital: "City Hospital",
            date: "26 Jul 2026",
            status: "Issued",
        },
        {
            id: 2,
            recipient: "Anjali Nair",
            bloodGroup: "O-",
            units: 1,
            hospital: "Medical College",
            date: "26 Jul 2026",
            status: "Pending",
        },
        {
            id: 3,
            recipient: "Akhil Raj",
            bloodGroup: "B+",
            units: 3,
            hospital: "General Hospital",
            date: "25 Jul 2026",
            status: "Issued",
        },
        {
            id: 4,
            recipient: "Sneha Joseph",
            bloodGroup: "AB-",
            units: 1,
            hospital: "Life Care Hospital",
            date: "25 Jul 2026",
            status: "Issued",
        },
    ];

    const filteredData = issues.filter((item) =>
        item.recipient.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Header */}

            <div className="flex justify-between items-center mb-8">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Blood Issue
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage blood issued to hospitals and recipients.
                    </p>
                </div>

                <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg flex items-center gap-2">
                    <FaPlus />
                    Issue Blood
                </button>

            </div>

            {/* Summary Cards */}

            <div className="grid md:grid-cols-4 gap-6 mb-8">

                <div className="bg-red-600 text-white rounded-xl p-6 shadow-lg">
                    <FaArrowUp className="text-4xl mb-3" />
                    <h2 className="text-3xl font-bold">86</h2>
                    <p>Total Blood Issued</p>
                </div>

                <div className="bg-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <FaHospital className="text-4xl mb-3" />
                    <h2 className="text-3xl font-bold">18</h2>
                    <p>Hospitals Served</p>
                </div>

                <div className="bg-green-600 text-white rounded-xl p-6 shadow-lg">
                    <FaTint className="text-4xl mb-3" />
                    <h2 className="text-3xl font-bold">142</h2>
                    <p>Total Units Issued</p>
                </div>

                <div className="bg-yellow-500 text-white rounded-xl p-6 shadow-lg">
                    <h2 className="text-3xl font-bold">5</h2>
                    <p>Pending Issues</p>
                </div>

            </div>

            {/* Search */}

            <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 mb-6">

                <FaSearch className="text-gray-500" />

                <input
                    type="text"
                    placeholder="Search Recipient..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full outline-none"
                />

            </div>

            {/* Blood Issue Table */}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                <table className="w-full">

                    <thead className="bg-red-600 text-white">
                        <tr>
                            <th className="py-4">Recipient</th>
                            <th>Blood Group</th>
                            <th>Units</th>
                            <th>Hospital</th>
                            <th>Date</th>
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
                                    {item.recipient}
                                </td>

                                <td className="text-red-600 font-bold">
                                    {item.bloodGroup}
                                </td>

                                <td>{item.units}</td>

                                <td>{item.hospital}</td>

                                <td>{item.date}</td>

                                <td>
                                    <span
                                        className={`px-3 py-1 rounded-full text-white ${item.status === "Issued"
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

            {/* Alert */}

            <div className="mt-8 bg-blue-100 border-l-4 border-blue-600 rounded-lg p-5">

                <h3 className="font-bold text-blue-700">
                    Blood Issue Information
                </h3>

                <p className="text-gray-700 mt-2">
                    Ensure blood compatibility is verified before issuing blood units.
                    Maintain proper records for every blood issue transaction.
                </p>

            </div>

        </div>
    );
}

export default BloodIssue;