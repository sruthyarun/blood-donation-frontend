
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaTint,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaExclamationTriangle,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

const initialForm = {
    bloodGroup: "",
    units: "",
};

const extractInventory = (responseData) => {
    if (Array.isArray(responseData)) return responseData;

    if (responseData && typeof responseData === "object") {
        if (Array.isArray(responseData.data)) return responseData.data;
        if (Array.isArray(responseData.inventory)) return responseData.inventory;
        if (Array.isArray(responseData.bloodInventory)) {
            return responseData.bloodInventory;
        }
    }

    return [];
};

function BBBloodInventory() {
    const user = useSelector((state) => state.user.currentUser);

    const [inventory, setInventory] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Logged-in Blood Bank details
    const bankEmail = user?.email?.trim().toLowerCase() || "";

    const bankName =
        user?.bloodBankName ||
        user?.bankName ||
        user?.hospitalName ||
        user?.fullName ||
        "";

    // GET: Fetch inventory for the logged-in Blood Bank
    const fetchInventory = useCallback(async () => {
        if (!bankEmail) {
            setInventory([]);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axiosInstance.get("/bloodInventory", {
                params: {
                    hospitalEmail: bankEmail,
                },
            });

            setInventory(extractInventory(response.data));
        } catch (err) {
            console.error(
                "Failed to fetch blood inventory:",
                err.response?.data || err.message
            );

            setInventory([]);

            setError(
                err.response?.data?.message ||
                "Unable to load blood inventory. Please check the backend."
            );
        } finally {
            setLoading(false);
        }
    }, [bankEmail]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Open Add modal
    const openAddModal = () => {
        setEditId(null);
        setFormData(initialForm);
        setError("");
        setShowModal(true);
    };

    // Open Edit modal
    const openEditModal = (item) => {
        setEditId(item._id || item.id);

        setFormData({
            bloodGroup: item.bloodGroup || item.group || "",
            units: String(item.units ?? ""),
        });

        setError("");
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditId(null);
        setFormData(initialForm);
        setError("");
    };

    // POST: Add or PATCH: Update inventory
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!bankEmail) {
            setError("Blood Bank email is missing. Please log in again.");
            return;
        }

        const units = Number(formData.units);

        if (
            !formData.bloodGroup ||
            formData.units === "" ||
            !Number.isInteger(units) ||
            units < 0
        ) {
            setError(
                "Select a blood group and enter a valid non-negative whole number of units."
            );
            return;
        }

        // These field names match the existing BloodInventory model.
        const bloodData = {
            hospitalEmail: bankEmail,
            hospitalName: bankName,
            bloodGroup: formData.bloodGroup,
            units,
            date: new Date().toISOString().split("T")[0],
        };

        setSaving(true);
        setError("");

        try {
            if (editId) {
                await axiosInstance.patch(
                    `/bloodInventory/${editId}`,
                    bloodData
                );

                alert("Blood stock updated successfully.");
            } else {
                await axiosInstance.post("/bloodInventory", bloodData);

                alert("Blood stock added successfully.");
            }

            setShowModal(false);
            setEditId(null);
            setFormData(initialForm);

            await fetchInventory();
        } catch (err) {
            console.error(
                "Failed to save blood inventory:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Unable to save blood stock. Please check the backend API."
            );
        } finally {
            setSaving(false);
        }
    };

    // DELETE: Remove inventory record
    const deleteBlood = async (item) => {
        const id = item._id || item.id;

        if (!id) {
            alert("This inventory record has no valid ID.");
            return;
        }

        if (!window.confirm(`Delete ${item.bloodGroup} blood stock?`)) {
            return;
        }

        try {
            await axiosInstance.delete(`/bloodInventory/${id}`);

            alert("Blood stock deleted successfully.");

            await fetchInventory();
        } catch (err) {
            console.error(
                "Failed to delete blood inventory:",
                err.response?.data || err.message
            );

            alert(
                err.response?.data?.message ||
                "Unable to delete blood stock."
            );
        }
    };

    // Search inventory by blood group
    const filteredInventory = useMemo(() => {
        const term = search.trim().toLowerCase();

        return inventory.filter((item) =>
            String(item.bloodGroup || item.group || "")
                .toLowerCase()
                .includes(term)
        );
    }, [inventory, search]);

    // Summary values
    const totalUnits = inventory.reduce(
        (sum, item) => sum + (Number(item.units) || 0),
        0
    );

    const bloodGroups = new Set(
        inventory.map((item) => item.bloodGroup || item.group)
    ).size;

    const lowStock = inventory.filter(
        (item) => Number(item.units) <= 10
    ).length;

    const available = inventory.filter(
        (item) => Number(item.units) > 10
    ).length;

    if (!user) {
        return (
            <div className="mt-20 text-center text-2xl">
                Please log in first.
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <BloodBankPanel />

            <main className="min-w-0 flex-1 p-4 md:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Blood Bank Inventory
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Manage blood units available in your blood bank.
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-white shadow-lg hover:bg-red-700"
                    >
                        <FaPlus />
                        Add Blood Unit
                    </button>
                </div>

                {/* Error message */}
                {error && !showModal && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}

                        <button
                            onClick={fetchInventory}
                            className="ml-3 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Summary cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<FaTint />}
                        color="text-red-600"
                        value={totalUnits}
                        label="Total Units"
                    />

                    <SummaryCard
                        icon={<FaTint />}
                        color="text-blue-600"
                        value={bloodGroups}
                        label="Blood Groups"
                    />

                    <SummaryCard
                        icon={<FaExclamationTriangle />}
                        color="text-yellow-600"
                        value={lowStock}
                        label="Low Stock"
                    />

                    <SummaryCard
                        icon={<FaTint />}
                        color="text-green-600"
                        value={available}
                        label="Available"
                    />
                </div>

                {/* Search */}
                <div className="mb-8 flex items-center gap-3 rounded-xl bg-white p-4 shadow-lg">
                    <FaSearch className="text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search blood group..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full outline-none"
                    />
                </div>

                {/* Inventory list */}
                {loading ? (
                    <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-lg">
                        Loading blood inventory...
                    </div>
                ) : filteredInventory.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-lg">
                        {search
                            ? "No matching blood groups found."
                            : "No blood inventory found. Add your first blood stock record."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {filteredInventory.map((item) => {
                            const units = Number(item.units) || 0;
                            const id = item._id || item.id;
                            const group =
                                item.bloodGroup || item.group || "Unknown";
                            const isLow = units <= 10;

                            // Model uses "date", not "lastUpdated".
                            const displayDate = item.date || item.createdAt;

                            return (
                                <article
                                    key={id || group}
                                    className="rounded-xl bg-white p-6 shadow-lg transition hover:shadow-xl"
                                >
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-red-100 p-3">
                                                <FaTint className="text-2xl text-red-600" />
                                            </div>

                                            <div>
                                                <h2 className="text-2xl font-bold text-red-600">
                                                    {group}
                                                </h2>

                                                <p className="text-gray-500">
                                                    Blood Group
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-full px-4 py-2 text-sm font-semibold ${isLow
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-green-100 text-green-600"
                                                }`}
                                        >
                                            {isLow ? "Low Stock" : "Available"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Available Units
                                            </p>

                                            <h3 className="text-3xl font-bold">
                                                {units}
                                            </h3>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Last Updated
                                            </p>

                                            <h3 className="font-semibold">
                                                {displayDate
                                                    ? String(displayDate).slice(
                                                        0,
                                                        10
                                                    )
                                                    : "Not recorded"}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            onClick={() =>
                                                openEditModal(item)
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                        >
                                            <FaEdit />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteBlood(item)}
                                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                        >
                                            <FaTrash />
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Add / Edit modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                            <h2 className="mb-6 text-2xl font-bold text-gray-800">
                                {editId
                                    ? "Edit Blood Unit"
                                    : "Add Blood Unit"}
                            </h2>

                            {error && (
                                <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </p>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Blood Group
                                    </label>

                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-red-500"
                                        required
                                    >
                                        <option value="">
                                            Select Blood Group
                                        </option>

                                        {[
                                            "A+",
                                            "A-",
                                            "B+",
                                            "B-",
                                            "AB+",
                                            "AB-",
                                            "O+",
                                            "O-",
                                        ].map((group) => (
                                            <option
                                                key={group}
                                                value={group}
                                            >
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Available Units
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="units"
                                        value={formData.units}
                                        onChange={handleChange}
                                        placeholder="Enter blood units"
                                        className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-red-500"
                                        required
                                    />
                                </div>

                                <p className="text-sm text-gray-500">
                                    The inventory date will be saved
                                    automatically when you save this record.
                                </p>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="rounded-lg bg-gray-400 px-5 py-2 text-white hover:bg-gray-500 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editId
                                                ? "Update Blood Unit"
                                                : "Save Blood Unit"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Low stock alert */}
                {lowStock > 0 && (
                    <div className="mt-8 flex items-start gap-4 rounded-xl border-l-4 border-yellow-500 bg-yellow-100 p-5">
                        <FaExclamationTriangle className="mt-1 text-3xl text-yellow-600" />

                        <div>
                            <h3 className="text-lg font-bold text-yellow-700">
                                Low Stock Alert
                            </h3>

                            <p className="mt-1 text-gray-700">
                                {lowStock} blood stock record(s) have 10 or
                                fewer units. Arrange blood collection or
                                donation campaigns to replenish stock.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function SummaryCard({ icon, color, value, label }) {
    return (
        <div className="rounded-xl bg-white p-6 text-center shadow-lg">
            <div
                className={`mx-auto mb-3 flex justify-center text-4xl ${color}`}
            >
                {icon}
            </div>

            <h2 className={`text-3xl font-bold ${color}`}>{value}</h2>

            <p className="mt-1 text-gray-500">{label}</p>
        </div>
    );
}

export default BBBloodInventory;
