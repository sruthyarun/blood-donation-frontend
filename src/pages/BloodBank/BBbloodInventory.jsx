
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaTint,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaTimes,
    FaSave,
    FaBoxes,
    FaExclamationTriangle,
    FaCheckCircle,
    FaWarehouse,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

const initialForm = {
    bloodGroup: "",
    units: "",
};

const bloodGroups = [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

function extractInventory(response) {
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.inventory)) return data.inventory;
    if (Array.isArray(data?.bloodInventory)) return data.bloodInventory;
    if (Array.isArray(data?.data)) return data.data;

    return [];
}

function getErrorMessage(error) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong. Please try again."
    );
}

function BBBloodInventory() {
    const user = useSelector((state) => state.user.currentUser);

    const bankEmail = user?.email?.trim().toLowerCase() || "";

    const bankName =
        user?.bloodBankName ||
        user?.bankName ||
        user?.hospitalName ||
        user?.fullName ||
        user?.name ||
        "Blood Bank";

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Get record ID
    const getRecordId = (item) => item?._id || item?.id;

    // Fetch blood inventory
    const fetchInventory = useCallback(async () => {
        if (!bankEmail) {
            setInventory([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/bloodInventory", {
                params: {
                    hospitalEmail: bankEmail,
                },
            });

            const records = extractInventory(response);

            // Filter records belonging to the logged-in blood bank
            const bankRecords = records.filter((item) => {
                const email = item?.hospitalEmail?.trim().toLowerCase();

                return email === bankEmail;
            });

            setInventory(bankRecords);
        } catch (err) {
            console.error("Blood inventory loading error:", err);
            setError(getErrorMessage(err));
            setInventory([]);
        } finally {
            setLoading(false);
        }
    }, [bankEmail]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Statistics
    const totalUnits = useMemo(() => {
        return inventory.reduce(
            (total, item) => total + Number(item.units || 0),
            0
        );
    }, [inventory]);

    const uniqueBloodGroups = useMemo(() => {
        return new Set(
            inventory.map((item) => item.bloodGroup?.toUpperCase())
        ).size;
    }, [inventory]);

    const lowStock = useMemo(() => {
        return inventory.filter(
            (item) => Number(item.units || 0) > 0 &&
                Number(item.units || 0) <= 10
        ).length;
    }, [inventory]);

    const outOfStock = useMemo(() => {
        return inventory.filter(
            (item) => Number(item.units || 0) === 0
        ).length;
    }, [inventory]);

    // Search
    const filteredInventory = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) return inventory;

        return inventory.filter((item) =>
            [
                item.bloodGroup,
                item.hospitalName,
                item.units,
            ]
                .join(" ")
                .toLowerCase()
                .includes(searchText)
        );
    }, [inventory, search]);

    // Open add modal
    const openAddModal = () => {
        setEditingId(null);
        setForm(initialForm);
        setMessage("");
        setError("");
        setShowModal(true);
    };

    // Open edit modal
    const openEditModal = (item) => {
        setEditingId(getRecordId(item));

        setForm({
            bloodGroup: item.bloodGroup || "",
            units: String(item.units ?? ""),
        });

        setMessage("");
        setError("");
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingId(null);
        setForm(initialForm);
        setError("");
    };

    // Form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Save inventory
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!bankEmail) {
            setError("Blood bank email is not available. Please log in again.");
            return;
        }

        const bloodGroup = form.bloodGroup.toUpperCase();
        const units = Number(form.units);

        if (!bloodGroups.includes(bloodGroup)) {
            setError("Please select a valid blood group.");
            return;
        }

        if (
            form.units === "" ||
            !Number.isInteger(units) ||
            units <= 0
        ) {
            setError("Please enter a valid number of units greater than zero.");
            return;
        }

        const payload = {
            hospitalEmail: bankEmail,
            hospitalName: bankName,
            bloodGroup,
            units,
            date: new Date().toISOString().split("T")[0],
        };

        try {
            setSaving(true);

            if (editingId) {
                // EDIT: Set the exact quantity entered.
                await axiosInstance.patch(
                    `/bloodInventory/${editingId}`,
                    payload
                );

                setMessage("Blood inventory updated successfully.");
            } else {
                // ADD: Check whether this blood group already exists.
                const existingRecord = inventory.find(
                    (item) =>
                        item.bloodGroup?.toUpperCase() === bloodGroup
                );

                if (existingRecord) {
                    // OPTION A: Add new units to existing stock.
                    const existingUnits = Number(existingRecord.units || 0);
                    const updatedUnits = existingUnits + units;

                    await axiosInstance.patch(
                        `/bloodInventory/${getRecordId(existingRecord)}`,
                        {
                            ...payload,
                            units: updatedUnits,
                        }
                    );

                    setMessage(
                        `${bloodGroup} stock updated. Previous stock: ${existingUnits}, added: ${units}, new stock: ${updatedUnits}.`
                    );
                } else {
                    // No existing blood group: create a new record.
                    await axiosInstance.post("/bloodInventory", payload);

                    setMessage(
                        `${bloodGroup} inventory added successfully.`
                    );
                }
            }

            setShowModal(false);
            setEditingId(null);
            setForm(initialForm);

            await fetchInventory();
        } catch (err) {
            console.error("Saving blood inventory error:", err);
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    // Delete inventory
    const handleDelete = async (item) => {
        const id = getRecordId(item);

        if (!id) {
            alert("Inventory record ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${item.bloodGroup} inventory?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await axiosInstance.delete(`/bloodInventory/${id}`);

            setMessage(`${item.bloodGroup} inventory deleted successfully.`);

            await fetchInventory();
        } catch (err) {
            console.error("Delete inventory error:", err);
            setError(getErrorMessage(err));
        }
    };

    const getStockStatus = (units) => {
        const quantity = Number(units || 0);

        if (quantity === 0) {
            return {
                label: "Out of Stock",
                className: "bg-red-100 text-red-700",
            };
        }

        if (quantity <= 10) {
            return {
                label: "Low Stock",
                className: "bg-yellow-100 text-yellow-700",
            };
        }

        return {
            label: "Available",
            className: "bg-green-100 text-green-700",
        };
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <BloodBankPanel />

            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Blood Inventory
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Manage your blood bank stock and availability.
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            {bankName}
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold shadow transition"
                    >
                        <FaPlus />
                        Add Blood Stock
                    </button>
                </div>

                {/* Messages */}
                {message && (
                    <div className="mb-5 p-3 rounded-lg bg-green-100 text-green-700 flex items-center gap-2">
                        <FaCheckCircle />
                        <span>{message}</span>
                        <button
                            onClick={() => setMessage("")}
                            className="ml-auto"
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                {error && !showModal && (
                    <div className="mb-5 p-3 rounded-lg bg-red-100 text-red-700">
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
                    <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    Total Blood Units
                                </p>
                                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                    {totalUnits}
                                </h2>
                            </div>

                            <FaTint className="text-red-500 text-3xl" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    Blood Groups
                                </p>
                                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                    {uniqueBloodGroups}
                                </h2>
                            </div>

                            <FaWarehouse className="text-blue-500 text-3xl" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    Low Stock Records
                                </p>
                                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                    {lowStock}
                                </h2>
                            </div>

                            <FaExclamationTriangle className="text-yellow-500 text-3xl" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-gray-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    Out of Stock
                                </p>
                                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                    {outOfStock}
                                </h2>
                            </div>

                            <FaBoxes className="text-gray-500 text-3xl" />
                        </div>
                    </div>
                </div>

                {/* Inventory list */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Available Blood Stock
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                View and manage your inventory records.
                            </p>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Search blood group..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-red-400"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            Loading blood inventory...
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="text-center py-12">
                            <FaTint className="mx-auto text-5xl text-gray-300 mb-4" />

                            <h3 className="text-lg font-semibold text-gray-700">
                                No blood inventory found
                            </h3>

                            <p className="text-gray-500 mt-1">
                                Add blood stock to display your inventory here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredInventory.map((item) => {
                                const status = getStockStatus(item.units);

                                return (
                                    <div
                                        key={getRecordId(item)}
                                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                                <FaTint className="text-red-600 text-2xl" />
                                            </div>

                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full ${status.className}`}
                                            >
                                                {status.label}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-800">
                                            {item.bloodGroup}
                                        </h3>

                                        <p className="text-gray-500 text-sm mt-2">
                                            Available Units
                                        </p>

                                        <p className="text-3xl font-bold text-red-600 mt-1">
                                            {Number(item.units || 0)}
                                        </p>

                                        <div className="border-t mt-4 pt-4 flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {item.date
                                                    ? new Date(item.date).toLocaleDateString()
                                                    : "Date not available"}
                                            </span>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    title="Edit inventory"
                                                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    title="Delete inventory"
                                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingId
                                    ? "Edit Blood Inventory"
                                    : "Add Blood Stock"}
                            </h2>

                            <button
                                onClick={closeModal}
                                disabled={saving}
                                className="text-gray-500 hover:text-red-600 text-xl"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Blood Group
                                </label>

                                <select
                                    name="bloodGroup"
                                    value={form.bloodGroup}
                                    onChange={handleChange}
                                    required
                                    disabled={!!editingId || saving}
                                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100"
                                >
                                    <option value="">
                                        Select blood group
                                    </option>

                                    {bloodGroups.map((group) => (
                                        <option key={group} value={group}>
                                            {group}
                                        </option>
                                    ))}
                                </select>

                                {!editingId && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        If this blood group already exists, the
                                        entered units will be added to its stock.
                                    </p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {editingId
                                        ? "Available Units"
                                        : "Units to Add"}
                                </label>

                                <input
                                    type="number"
                                    name="units"
                                    min="1"
                                    step="1"
                                    value={form.units}
                                    onChange={handleChange}
                                    placeholder="Enter number of units"
                                    required
                                    disabled={saving}
                                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-400"
                                />

                                {editingId && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Enter the new total stock quantity.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        "Saving..."
                                    ) : (
                                        <>
                                            <FaSave />
                                            {editingId ? "Update" : "Add Stock"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BBBloodInventory;
