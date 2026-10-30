
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaTint,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../../API/axiosInstance";
import HospitalPanel from "../../components/HospitalPanel";

// Return today's date in YYYY-MM-DD format using local time
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const INITIAL_FORM = {
    bloodGroup: "",
    units: "",
    date: getTodayDate(),
};

function BloodInventory() {
    const user = useSelector((state) => state.user.currentUser);

    const [inventory, setInventory] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const hospitalEmail = user?.email?.trim().toLowerCase();

    // Fetch inventory belonging to the logged-in hospital
    const fetchInventory = useCallback(async () => {
        if (!hospitalEmail) return;

        setLoading(true);

        try {
            const response = await API.get("/bloodInventory", {
                params: { hospitalEmail },
            });

            const result = response.data;
            const records = Array.isArray(result)
                ? result
                : result.data || result.inventory || [];

            setInventory(records);
        } catch (error) {
            console.error(
                "Failed to fetch blood inventory:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load blood inventory."
            );
        } finally {
            setLoading(false);
        }
    }, [hospitalEmail]);

    useEffect(() => {
        if (hospitalEmail) {
            fetchInventory();
        }
    }, [hospitalEmail, fetchInventory]);

    // Handle form inputs
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Open Add modal
    const openAddModal = () => {
        setEditId(null);
        setFormData({
            ...INITIAL_FORM,
            date: getTodayDate(),
        });
        setShowModal(true);
    };

    // Open Edit modal with the selected record
    const openEditModal = (item) => {
        setEditId(item._id || item.id);

        let inventoryDate = getTodayDate();

        if (item.date) {
            const parsedDate = new Date(item.date);

            if (!Number.isNaN(parsedDate.getTime())) {
                inventoryDate = [
                    parsedDate.getFullYear(),
                    String(parsedDate.getMonth() + 1).padStart(2, "0"),
                    String(parsedDate.getDate()).padStart(2, "0"),
                ].join("-");
            }
        }

        setFormData({
            bloodGroup: item.bloodGroup || "",
            units: String(item.units ?? ""),
            date: inventoryDate,
        });

        setShowModal(true);
    };

    // Close modal and reset form
    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setFormData({
            ...INITIAL_FORM,
            date: getTodayDate(),
        });
    };

    // Add or update inventory
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!hospitalEmail) {
            toast.error("Hospital email not found. Please log in again.");
            return;
        }

        const units = Number(formData.units);

        if (!formData.bloodGroup) {
            toast.error("Please select a blood group.");
            return;
        }

        if (
            formData.units === "" ||
            !Number.isInteger(units) ||
            units < 0
        ) {
            toast.error(
                "Enter a valid non-negative whole number of units."
            );
            return;
        }

        if (!formData.date) {
            toast.error("Please select the inventory date.");
            return;
        }

        const selectedDate = new Date(
            `${formData.date}T00:00:00`
        );

        if (Number.isNaN(selectedDate.getTime())) {
            toast.error("Please select a valid inventory date.");
            return;
        }

        const bloodData = {
            hospitalEmail,
            hospitalName:
                user?.hospitalName || user?.name || "",
            bloodGroup: formData.bloodGroup,
            units,
            date: selectedDate.toISOString(),
            lastUpdated: new Date().toISOString(),
        };

        setSaving(true);

        try {
            if (editId) {
                await API.patch(
                    `/bloodInventory/${encodeURIComponent(editId)}`,
                    bloodData
                );

                toast.success("Blood stock updated successfully.");
            } else {
                await API.post("/bloodInventory", bloodData);

                toast.success("Blood stock added successfully.");
            }

            closeModal();
            await fetchInventory();
        } catch (error) {
            console.error(
                "Failed to save blood inventory:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to save blood stock."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete an inventory record
    const deleteBlood = async (item) => {
        const id = item._id || item.id;

        if (!id) {
            toast.error("Blood inventory ID not found.");
            return;
        }

        if (!window.confirm("Delete this blood stock?")) {
            return;
        }

        try {
            await API.delete(
                `/bloodInventory/${encodeURIComponent(id)}`
            );

            setInventory((previous) =>
                previous.filter(
                    (record) => (record._id || record.id) !== id
                )
            );

            toast.success("Blood stock deleted successfully.");
        } catch (error) {
            console.error(
                "Failed to delete blood stock:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to delete blood stock."
            );
        }
    };

    // Format the date for display
    const formatDate = (dateValue) => {
        if (!dateValue) return "—";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Search inventory by blood group
    const filteredInventory = inventory.filter((item) =>
        (item.bloodGroup || "")
            .toLowerCase()
            .includes(search.toLowerCase().trim())
    );

    // Summary values
    const totalUnits = inventory.reduce(
        (sum, item) => sum + Number(item.units || 0),
        0
    );

    const bloodGroups = new Set(
        inventory.map((item) => item.bloodGroup)
    ).size;

    const lowStock = inventory.filter(
        (item) => Number(item.units) <= 10
    ).length;

    if (!user) {
        return (
            <div className="mt-20 text-center text-xl">
                Please Login
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <HospitalPanel />

            <main className="min-h-screen bg-gray-100 p-4 md:p-8 flex-1">
                {/* Page heading */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Blood Inventory
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage available blood stock in your hospital.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="mt-4 md:mt-0 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg"
                    >
                        <FaPlus />
                        Add Blood Stock
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white text-red-700 rounded-xl p-6 text-center shadow">
                        <h2 className="text-3xl font-bold">
                            {totalUnits}
                        </h2>
                        <p>Total Units</p>
                    </div>

                    <div className="bg-white text-red-700 rounded-xl p-6 text-center shadow">
                        <h2 className="text-3xl font-bold">
                            {bloodGroups}
                        </h2>
                        <p>Blood Groups</p>
                    </div>

                    <div className="bg-white text-red-700 rounded-xl p-6 text-center shadow">
                        <h2 className="text-3xl font-bold">
                            {lowStock}
                        </h2>
                        <p>Low Stock Records</p>
                    </div>

                    <div className="bg-white text-red-700 rounded-xl p-6 text-center shadow">
                        <h2 className="text-3xl font-bold">—</h2>
                        <p>Today's Donations</p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center bg-white shadow rounded-lg px-4 py-3 mb-6 max-w-md">
                    <FaSearch className="text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search Blood Group..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        className="ml-3 w-full outline-none"
                    />
                </div>

                {/* Inventory table */}
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-red-700 text-white">
                            <tr>
                                <th className="py-4 px-3">
                                    Blood Group
                                </th>
                                <th className="px-3">
                                    Inventory Date
                                </th>
                                <th className="px-3">
                                    Available Units
                                </th>
                                <th className="px-3">Status</th>
                                <th className="px-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-8 text-center"
                                    >
                                        Loading blood inventory...
                                    </td>
                                </tr>
                            ) : filteredInventory.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-8 text-center text-gray-500"
                                    >
                                        No blood stock found
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => {
                                    const id = item._id || item.id;
                                    const units = Number(item.units || 0);

                                    return (
                                        <tr
                                            key={id}
                                            className="text-center border-b hover:bg-gray-50"
                                        >
                                            <td className="py-4 px-3">
                                                <div className="flex justify-center items-center gap-2">
                                                    <FaTint className="text-red-600" />

                                                    <span className="font-semibold">
                                                        {item.bloodGroup}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-3">
                                                {formatDate(item.date)}
                                            </td>

                                            <td className="px-3">
                                                {units}
                                            </td>

                                            <td className="px-3">
                                                {units <= 10 ? (
                                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                                                        Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full">
                                                        Available
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-3">
                                                <div className="flex justify-center gap-3 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(item)
                                                        }
                                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                                                        title="Edit stock"
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteBlood(item)
                                                        }
                                                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                                                        title="Delete stock"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add/Edit modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-5">
                                {editId
                                    ? "Edit Blood Stock"
                                    : "Add Blood Stock"}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                {/* Blood group */}
                                <div className="mb-4">
                                    <label
                                        htmlFor="bloodGroup"
                                        className="font-semibold"
                                    >
                                        Blood Group
                                    </label>

                                    <select
                                        id="bloodGroup"
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-3 mt-2"
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

                                {/* Inventory date */}
                                <div className="mb-4">
                                    <label
                                        htmlFor="date"
                                        className="font-semibold"
                                    >
                                        Inventory Date
                                    </label>

                                    <input
                                        id="date"
                                        type="date"
                                        name="date"
                                        value={formData.date || ""}
                                        onChange={handleChange}
                                        max={getTodayDate()}
                                        className="w-full border rounded-lg p-3 mt-2"
                                        required
                                    />
                                </div>

                                {/* Units */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="units"
                                        className="font-semibold"
                                    >
                                        Available Units
                                    </label>

                                    <input
                                        id="units"
                                        type="number"
                                        name="units"
                                        min="0"
                                        step="1"
                                        value={formData.units}
                                        onChange={handleChange}
                                        placeholder="Enter Units"
                                        className="w-full border rounded-lg p-3 mt-2"
                                        required
                                    />
                                </div>

                                {/* Modal actions */}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="px-5 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editId
                                                ? "Update"
                                                : "Save"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default BloodInventory;
