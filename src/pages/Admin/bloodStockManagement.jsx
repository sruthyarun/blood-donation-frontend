
import { useEffect, useMemo, useState } from "react";
import {
    FaSearch,
    FaTint,
    FaEdit,
    FaTrash,
    FaPlus,
    FaDownload,
    FaPrint,
    FaSyncAlt,
    FaExclamationTriangle,
    FaHospital,
    FaCalendarAlt,
    FaFileAlt,
    FaBuilding,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";
import API from "../../API/axiosInstance";

const BLOOD_GROUPS = [
    "A+", "A-", "B+", "B-",
    "AB+", "AB-", "O+", "O-",
];

const getId = (item) => item?._id || item?.id;

const getInventoryArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.bloodInventory)) return data.bloodInventory;
    if (Array.isArray(data?.inventory)) return data.inventory;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.bloodInventory)) {
        return data.data.bloodInventory;
    }
    return [];
};

const today = () => new Date().toISOString().split("T")[0];

function BloodStockManagementADm() {
    const [inventory, setInventory] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [reportType, setReportType] = useState("current");

    const [formData, setFormData] = useState({
        bloodGroup: "",
        units: "",
        hospitalName: "",
        hospitalEmail: "",
        date: today(),
    });

    // Fetch all hospital and blood bank inventory records
    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/bloodInventory");

            setInventory(getInventoryArray(response.data));
        } catch (err) {
            console.error("Error fetching blood inventory:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load blood inventory. Please check the backend API."
            );

            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // Search
    const filteredInventory = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return inventory;

        return inventory.filter((item) =>
            [
                item.bloodGroup,
                item.hospitalName,
                item.hospitalEmail,
                item.units,
            ].some((field) =>
                String(field ?? "").toLowerCase().includes(value)
            )
        );
    }, [inventory, search]);

    // Total available units
    const totalUnits = inventory.reduce(
        (sum, item) => sum + Number(item.units || 0),
        0
    );

    // Count facilities
    const facilities = new Set(
        inventory
            .map((item) => item.hospitalEmail?.toLowerCase())
            .filter(Boolean)
    ).size;

    // Blood group-wise stock
    const bloodGroupStock = BLOOD_GROUPS.map((group) => {
        const items = inventory.filter(
            (item) => item.bloodGroup?.toUpperCase() === group
        );

        const units = items.reduce(
            (sum, item) => sum + Number(item.units || 0),
            0
        );

        return {
            bloodGroup: group,
            units,
            status: getStatus(units),
        };
    });

    const lowStock = bloodGroupStock.filter(
        (item) => item.units > 0 && item.units <= 5
    ).length;

    const critical = bloodGroupStock.filter(
        (item) => item.units > 0 && item.units <= 2
    ).length;

    const outOfStock = bloodGroupStock.filter(
        (item) => item.units === 0
    ).length;

    function getStatus(units) {
        if (units === 0) return "Out of Stock";
        if (units <= 2) return "Critical";
        if (units <= 5) return "Low Stock";
        return "Available";
    }

    function getStatusColor(status) {
        switch (status) {
            case "Available":
                return "bg-green-100 text-green-700";
            case "Low Stock":
                return "bg-yellow-100 text-yellow-700";
            case "Critical":
                return "bg-red-100 text-red-700";
            case "Out of Stock":
                return "bg-gray-200 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function openAddModal() {
        setEditingItem(null);

        setFormData({
            bloodGroup: "",
            units: "",
            hospitalName: "",
            hospitalEmail: "",
            date: today(),
        });

        setShowModal(true);
    }

    function openEditModal(item) {
        setEditingItem(item);

        setFormData({
            bloodGroup: item.bloodGroup || "",
            units: item.units ?? "",
            hospitalName: item.hospitalName || "",
            hospitalEmail: item.hospitalEmail || "",
            date: item.date
                ? new Date(item.date).toISOString().split("T")[0]
                : today(),
        });

        setShowModal(true);
    }

    // Add or update inventory
    async function handleSubmit(e) {
        e.preventDefault();

        const units = Number(formData.units);

        if (!Number.isFinite(units) || units < 0) {
            alert("Please enter a valid number of units.");
            return;
        }

        if (!formData.hospitalEmail.trim()) {
            alert("Please enter the facility email address.");
            return;
        }

        const stockData = {
            bloodGroup: formData.bloodGroup,
            units,
            hospitalName: formData.hospitalName.trim(),
            hospitalEmail: formData.hospitalEmail.trim().toLowerCase(),
            date: formData.date
                ? new Date(`${formData.date}T00:00:00`).toISOString()
                : new Date().toISOString(),
        };

        try {
            setSaving(true);

            if (editingItem) {
                const id = getId(editingItem);

                if (!id) {
                    alert("Inventory record ID is missing.");
                    return;
                }

                await API.patch(`/bloodInventory/${id}`, stockData);
            } else {
                await API.post("/bloodInventory", stockData);
            }

            setShowModal(false);
            await fetchInventory();

            alert(
                editingItem
                    ? "Blood inventory updated successfully."
                    : "Blood inventory added successfully."
            );
        } catch (err) {
            console.error("Error saving inventory:", err);

            alert(
                err.response?.data?.message ||
                "Unable to save blood inventory."
            );
        } finally {
            setSaving(false);
        }
    }

    // Delete inventory
    async function deleteStock(item) {
        const id = getId(item);

        if (!id) {
            alert("Inventory record ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Delete ${item.bloodGroup} stock from ${item.hospitalName || "this facility"}?`
        );

        if (!confirmed) return;

        try {
            await API.delete(`/bloodInventory/${id}`);

            setInventory((prev) =>
                prev.filter((stock) => getId(stock) !== id)
            );

            alert("Blood inventory deleted successfully.");
        } catch (err) {
            console.error("Error deleting inventory:", err);

            alert(
                err.response?.data?.message ||
                "Unable to delete blood inventory."
            );
        }
    }

    // CSV export
    function downloadCSV(data, filename) {
        if (!data.length) {
            alert("No data available for this report.");
            return;
        }

        const headers = Object.keys(data[0]);

        const rows = [
            headers.join(","),
            ...data.map((item) =>
                headers
                    .map((header) =>
                        `"${String(item[header] ?? "").replace(/"/g, '""')}"`
                    )
                    .join(",")
            ),
        ];

        const blob = new Blob([rows.join("\n")], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    function generateReport() {
        let data = [];

        if (reportType === "current") {
            data = inventory.map((item) => ({
                bloodGroup: item.bloodGroup,
                units: item.units,
                hospitalName: item.hospitalName,
                hospitalEmail: item.hospitalEmail,
                date: item.date,
            }));
        }

        if (reportType === "bloodGroup") {
            data = bloodGroupStock;
        }

        if (reportType === "lowStock") {
            data = bloodGroupStock.filter(
                (item) =>
                    item.status === "Low Stock" ||
                    item.status === "Critical"
            );
        }

        if (reportType === "outOfStock") {
            data = bloodGroupStock.filter(
                (item) => item.status === "Out of Stock"
            );
        }

        downloadCSV(data, `${reportType}-blood-stock-report.csv`);
    }

    function generateStockLevelReport() {
        downloadCSV(
            bloodGroupStock,
            "blood-stock-level-report.csv"
        );
    }

    function formatDate(date) {
        if (!date) return "N/A";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) return "N/A";

        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminPanel />

            <div className="flex-1 min-w-0 p-5 lg:p-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:justify-between gap-5 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Blood Stock Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            View and manage blood inventory from hospitals
                            and blood banks.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex items-center bg-white rounded-lg shadow px-4 py-3">
                            <FaSearch className="text-gray-500" />

                            <input
                                type="text"
                                placeholder="Search facility or blood group..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="ml-2 outline-none w-full sm:w-64"
                            />
                        </div>

                        <button
                            onClick={fetchInventory}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                            <FaSyncAlt className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <SummaryCard
                        title="Total Available Units"
                        value={totalUnits}
                        icon={<FaTint />}
                        color="red"
                    />

                    <SummaryCard
                        title="Facilities"
                        value={facilities}
                        icon={<FaHospital />}
                        color="blue"
                    />

                    <SummaryCard
                        title="Low Stock Groups"
                        value={lowStock}
                        icon={<FaExclamationTriangle />}
                        color="yellow"
                    />

                    <SummaryCard
                        title="Out of Stock Groups"
                        value={outOfStock}
                        icon={<FaTint />}
                        color="gray"
                    />
                </div>

                {/* Blood group-wise stock */}
                <section className="mb-8">
                    <div className="mb-5">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Blood Group-wise Stock
                        </h2>

                        <p className="text-gray-500">
                            Total available units across all facilities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                        {bloodGroupStock.map((group) => (
                            <div
                                key={group.bloodGroup}
                                className="bg-white rounded-2xl shadow-md p-5"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <FaTint className="text-red-600 text-xl" />
                                    </div>

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(group.status)}`}
                                    >
                                        {group.status}
                                    </span>
                                </div>

                                <h3 className="text-3xl font-bold text-gray-800 mt-5">
                                    {group.bloodGroup}
                                </h3>

                                <p className="text-gray-500 mt-1">
                                    Available Units
                                </p>

                                <p className="text-4xl font-bold text-red-600 mt-2">
                                    {group.units}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stock level report */}
                <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Blood Stock Level Report
                            </h2>

                            <p className="text-gray-500 mt-1">
                                View available units for each blood group.
                            </p>
                        </div>

                        <button
                            onClick={generateStockLevelReport}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
                        >
                            <FaDownload />
                            Export Stock Report
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="text-left px-4 py-4">Blood Group</th>
                                    <th className="text-center px-4 py-4">Available Units</th>
                                    <th className="text-center px-4 py-4">Stock Level</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bloodGroupStock.map((item) => (
                                    <tr
                                        key={item.bloodGroup}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4 font-bold">
                                            {item.bloodGroup}
                                        </td>

                                        <td className="text-center px-4 py-4 font-bold text-red-600">
                                            {item.units}
                                        </td>

                                        <td className="text-center px-4 py-4">
                                            <span
                                                className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(item.status)}`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Stock alerts */}
                {(lowStock > 0 || critical > 0 || outOfStock > 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8">
                        <div className="flex gap-3">
                            <FaExclamationTriangle className="text-yellow-600 text-xl mt-1" />

                            <div>
                                <h3 className="font-bold text-yellow-800">
                                    Blood Stock Alerts
                                </h3>

                                <p className="text-yellow-700 text-sm mt-1">
                                    {lowStock} low-stock group(s),{" "}
                                    {critical} critical group(s), and{" "}
                                    {outOfStock} out-of-stock group(s).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reports */}
                <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <FaFileAlt className="text-red-600 text-xl" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Blood Stock Reports
                            </h2>

                            <p className="text-gray-500 text-sm">
                                Generate and export inventory reports.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="current">Current Blood Stock Report</option>
                            <option value="bloodGroup">Blood Group-wise Report</option>
                            <option value="lowStock">Low Stock Report</option>
                            <option value="outOfStock">Out of Stock Report</option>
                        </select>

                        <button
                            onClick={generateReport}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
                        >
                            <FaDownload />
                            Export Report
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
                        >
                            <FaPrint />
                            Print
                        </button>
                    </div>
                </section>

                {/* Recent updates */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-5">
                        <FaCalendarAlt className="text-red-600 text-xl" />

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Recent Stock Updates
                            </h2>

                            <p className="text-gray-500">
                                Latest inventory records.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[...inventory]
                            .sort(
                                (a, b) =>
                                    new Date(b.date || 0) -
                                    new Date(a.date || 0)
                            )
                            .slice(0, 5)
                            .map((item) => (
                                <div
                                    key={getId(item)}
                                    className="bg-white rounded-xl shadow p-5"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                                <FaTint className="text-red-600" />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-gray-800">
                                                    {item.bloodGroup}
                                                </h3>

                                                <p className="text-sm text-gray-500">
                                                    {item.hospitalName || "Unknown Facility"}
                                                </p>

                                                <p className="text-xs text-gray-400 break-all">
                                                    {item.hospitalEmail || ""}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Available Units
                                                </p>

                                                <p className="font-bold text-red-600">
                                                    {item.units ?? 0}
                                                </p>
                                            </div>

                                            <p className="text-sm text-gray-400">
                                                {formatDate(item.date)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>

                {/* All inventory */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                All Blood Stock
                            </h2>

                            <p className="text-gray-500">
                                Inventory records from registered facilities.
                            </p>
                        </div>

                        <button
                            onClick={openAddModal}
                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold"
                        >
                            <FaPlus />
                            Add Stock
                        </button>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-xl p-10 text-center">
                            <FaSyncAlt className="animate-spin mx-auto text-red-600 text-3xl" />

                            <p className="text-gray-500 mt-3">
                                Loading inventory...
                            </p>
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="bg-white rounded-xl p-10 text-center">
                            <FaTint className="mx-auto text-gray-300 text-5xl" />

                            <p className="text-gray-500 mt-3">
                                No blood stock records found.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredInventory.map((item) => {
                                const status = getStatus(Number(item.units || 0));

                                return (
                                    <div
                                        key={getId(item)}
                                        className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition"
                                    >
                                        <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                                    <FaTint className="text-red-600 text-xl" />
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800">
                                                        {item.bloodGroup}
                                                    </h3>

                                                    <p className="text-xs text-gray-400 break-all">
                                                        ID: {getId(item)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="min-w-48">
                                                <p className="text-xs text-gray-400">
                                                    Facility
                                                </p>

                                                <p className="font-semibold text-gray-800">
                                                    {item.hospitalName || "Unknown Facility"}
                                                </p>

                                                <p className="text-xs text-gray-500 break-all mt-1">
                                                    {item.hospitalEmail}
                                                </p>
                                            </div>

                                            <div className="bg-red-50 rounded-lg px-5 py-3 text-center">
                                                <p className="text-xs text-gray-500">
                                                    Available Units
                                                </p>

                                                <p className="text-2xl font-bold text-red-600">
                                                    {item.units ?? 0}
                                                </p>
                                            </div>

                                            <span
                                                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(status)}`}
                                            >
                                                {status}
                                            </span>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    onClick={() => deleteStock(item)}
                                                    className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-gray-400">
                                            <span>
                                                Facility email: {item.hospitalEmail || "N/A"}
                                            </span>

                                            <span>
                                                Last updated: {formatDate(item.date)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* Add / Edit modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingItem ? "Edit Blood Stock" : "Add Blood Stock"}
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Enter the inventory details.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-red-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Blood Group
                                </label>

                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="">Select Blood Group</option>

                                    {BLOOD_GROUPS.map((group) => (
                                        <option key={group} value={group}>
                                            {group}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Hospital / Blood Bank Name
                                </label>

                                <input
                                    type="text"
                                    name="hospitalName"
                                    value={formData.hospitalName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Enter facility name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Facility Email
                                </label>

                                <input
                                    type="email"
                                    name="hospitalEmail"
                                    value={formData.hospitalEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Enter registered facility email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Available Units
                                </label>

                                <input
                                    type="number"
                                    name="units"
                                    min="0"
                                    value={formData.units}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Enter available units"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date
                                </label>

                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingItem
                                            ? "Update Stock"
                                            : "Add Stock"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ title, value, icon, color }) {
    const colors = {
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
        yellow: {
            border: "border-yellow-500",
            text: "text-yellow-600",
            bg: "bg-yellow-100",
        },
        blue: {
            border: "border-blue-600",
            text: "text-blue-600",
            bg: "bg-blue-100",
        },
        gray: {
            border: "border-gray-500",
            text: "text-gray-600",
            bg: "bg-gray-100",
        },
    };

    const style = colors[color] || colors.red;

    return (
        <div className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${style.border}`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>

                    <p className={`text-3xl font-bold mt-2 ${style.text}`}>
                        {value}
                    </p>
                </div>

                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style.bg}`}>
                    <span className={style.text}>{icon}</span>
                </div>
            </div>
        </div>
    );
}

export default BloodStockManagementADm;
