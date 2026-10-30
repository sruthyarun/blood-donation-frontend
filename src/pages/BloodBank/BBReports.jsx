import {
    FaFilePdf,
    FaFileExcel,
    FaPrint,
    FaTint,
    FaArrowDown,
    FaArrowUp,
    FaChartBar,
} from "react-icons/fa";

function BBReports() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Header */}

            <div className="flex justify-between items-center mb-8">

                <div>

                    <h1 className="text-3xl font-bold text-gray-800">
                        Blood Bank Reports
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View and export blood bank reports.
                    </p>

                </div>

                <div className="flex gap-3">

                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <FaFilePdf />
                        Export PDF
                    </button>

                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <FaFileExcel />
                        Export Excel
                    </button>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <FaPrint />
                        Print
                    </button>

                </div>

            </div>

            {/* Filter */}

            <div className="bg-white rounded-xl shadow-lg p-5 mb-8">

                <div className="grid md:grid-cols-3 gap-5">

                    <div>
                        <label className="font-semibold">From Date</label>

                        <input
                            type="date"
                            className="w-full border rounded-lg p-3 mt-2"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">To Date</label>

                        <input
                            type="date"
                            className="w-full border rounded-lg p-3 mt-2"
                        />
                    </div>

                    <div className="flex items-end">

                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg w-full">
                            Generate Report
                        </button>

                    </div>

                </div>

            </div>

            {/* Summary Cards */}

            <div className="grid md:grid-cols-4 gap-6 mb-8">

                <div className="bg-red-600 text-white rounded-xl p-6 shadow-lg">

                    <FaTint className="text-4xl mb-3" />

                    <h2 className="text-3xl font-bold">1250</h2>

                    <p>Total Blood Units</p>

                </div>

                <div className="bg-green-600 text-white rounded-xl p-6 shadow-lg">

                    <FaArrowDown className="text-4xl mb-3" />

                    <h2 className="text-3xl font-bold">540</h2>

                    <p>Blood Collected</p>

                </div>

                <div className="bg-blue-600 text-white rounded-xl p-6 shadow-lg">

                    <FaArrowUp className="text-4xl mb-3" />

                    <h2 className="text-3xl font-bold">420</h2>

                    <p>Blood Issued</p>

                </div>

                <div className="bg-purple-600 text-white rounded-xl p-6 shadow-lg">

                    <FaChartBar className="text-4xl mb-3" />

                    <h2 className="text-3xl font-bold">820</h2>

                    <p>Available Units</p>

                </div>

            </div>

            {/* Blood Collection Report */}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">

                <div className="bg-red-600 text-white px-6 py-4">

                    <h2 className="text-xl font-semibold">
                        Blood Collection Report
                    </h2>

                </div>

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>
                            <th className="py-4">Date</th>
                            <th>Donors</th>
                            <th>Units Collected</th>
                        </tr>

                    </thead>

                    <tbody>

                        <tr className="text-center border-b">
                            <td className="py-3">24 Jul 2026</td>
                            <td>20</td>
                            <td>20 Units</td>
                        </tr>

                        <tr className="text-center border-b">
                            <td className="py-3">25 Jul 2026</td>
                            <td>18</td>
                            <td>18 Units</td>
                        </tr>

                        <tr className="text-center">
                            <td className="py-3">26 Jul 2026</td>
                            <td>25</td>
                            <td>25 Units</td>
                        </tr>

                    </tbody>

                </table>

            </div>

            {/* Blood Issue Report */}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">

                <div className="bg-blue-600 text-white px-6 py-4">

                    <h2 className="text-xl font-semibold">
                        Blood Issue Report
                    </h2>

                </div>

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>
                            <th className="py-4">Date</th>
                            <th>Hospitals</th>
                            <th>Units Issued</th>
                        </tr>

                    </thead>

                    <tbody>

                        <tr className="text-center border-b">
                            <td className="py-3">24 Jul 2026</td>
                            <td>5</td>
                            <td>15 Units</td>
                        </tr>

                        <tr className="text-center border-b">
                            <td className="py-3">25 Jul 2026</td>
                            <td>7</td>
                            <td>22 Units</td>
                        </tr>

                        <tr className="text-center">
                            <td className="py-3">26 Jul 2026</td>
                            <td>6</td>
                            <td>18 Units</td>
                        </tr>

                    </tbody>

                </table>

            </div>

            {/* Blood Stock */}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                <div className="bg-green-600 text-white px-6 py-4">

                    <h2 className="text-xl font-semibold">
                        Current Blood Stock
                    </h2>

                </div>

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>
                            <th className="py-4">Blood Group</th>
                            <th>Available Units</th>
                            <th>Status</th>
                        </tr>

                    </thead>

                    <tbody>

                        {[
                            { group: "A+", units: 45 },
                            { group: "A-", units: 10 },
                            { group: "B+", units: 35 },
                            { group: "B-", units: 8 },
                            { group: "AB+", units: 18 },
                            { group: "AB-", units: 6 },
                            { group: "O+", units: 60 },
                            { group: "O-", units: 9 },
                        ].map((blood, index) => (

                            <tr
                                key={index}
                                className="text-center border-b"
                            >

                                <td className="py-3 font-bold text-red-600">
                                    {blood.group}
                                </td>

                                <td>{blood.units}</td>

                                <td>

                                    <span
                                        className={`px-3 py-1 rounded-full text-white ${blood.units <= 10
                                            ? "bg-red-500"
                                            : "bg-green-600"
                                            }`}
                                    >
                                        {blood.units <= 10
                                            ? "Low Stock"
                                            : "Available"}
                                    </span>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default BBReports;