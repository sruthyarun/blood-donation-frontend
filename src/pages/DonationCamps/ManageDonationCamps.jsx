
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    FaCalendarAlt,
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaMapMarkerAlt,
    FaTint,
    FaUsers,
    FaSyncAlt,
    FaTimes,
} from "react-icons/fa";

import HospitalPanel from "../../components/HospitalPanel";
import axiosInstance from "../../API/axiosInstance";
import DonationCampForm from "./DonationCampForm";

function ManageDonationCamps() {
    const navigate = useNavigate();

    const reduxUser = useSelector(
        (state) => state.user.currentUser
    );

    const [user, setUser] = useState(reduxUser || null);
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [editingCamp, setEditingCamp] = useState(null);
    const [busy, setBusy] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Get logged-in hospital details
    useEffect(() => {
        if (reduxUser) {
            setUser(reduxUser);
            return;
        }

        try {
            const savedUser = localStorage.getItem("loggedInUser");

            if (savedUser) {
                setUser(JSON.parse(savedUser));
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("Unable to read logged-in user:", err);
            setUser(null);
            setError("Unable to read login details. Please log in again.");
        }
    }, [reduxUser]);

    const hospitalEmail = String(
        user?.hospitalEmail || user?.email || ""
    ).trim().toLowerCase();

    const hospitalName =
        user?.hospitalName ||
        user?.name ||
        user?.fullName ||
        "Hospital";

    // Load donation camps belonging to the hospital
    const fetchCamps = useCallback(async () => {
        if (!hospitalEmail) {
            setLoading(false);
            setError("Hospital email not found. Please log in again.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axiosInstance.get("/donationCamps", {
                params: {
                    hospitalEmail,
                },
            });

            const responseData = response.data;

            const campList = Array.isArray(responseData)
                ? responseData
                : Array.isArray(responseData?.camps)
                    ? responseData.camps
                    : [];

            setCamps(campList);
        } catch (err) {
            console.error(
                "Failed to load donation camps:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to load donation camps. Check your backend server."
            );
        } finally {
            setLoading(false);
        }
    }, [hospitalEmail]);

    useEffect(() => {
        fetchCamps();
    }, [fetchCamps]);

    // Navigate to the add-camp page
    const handleAddCamp = () => {
        navigate("/hospital/donation-camps/add");
    };

    // Update an existing camp
    const handleUpdateCamp = async (formData) => {
        if (!editingCamp?._id) {
            setError("Unable to identify the camp to update.");
            return;
        }

        if (!hospitalEmail) {
            setError("Hospital email not found. Please log in again.");
            return;
        }

        setBusy(true);
        setError("");
        setSuccess("");

        try {
            await axiosInstance.put(
                `/donationCamps/${editingCamp._id} `,
                {
                    ...formData,
                    hospitalEmail,
                }
            );

            setEditingCamp(null);
            setSuccess("Donation camp updated successfully.");

            await fetchCamps();
        } catch (err) {
            console.error(
                "Failed to update donation camp:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to update donation camp."
            );
        } finally {
            setBusy(false);
        }
    };

    // Delete a camp

    const handleDeleteCamp = async (camp) => {
        if (!camp?._id) {
            setError("Unable to identify the camp to delete.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${camp.campName}"?`
        );

        if (!confirmed) return;

        if (!hospitalEmail) {
            setError("Hospital email not found. Please log in again.");
            return;
        }

        setDeletingId(camp._id);
        setError("");
        setSuccess("");

        try {
            const response = await axiosInstance.delete(
                `/donationCamps/${camp._id}`,
                {
                    params: {
                        hospitalEmail: hospitalEmail.trim().toLowerCase(),
                    },
                }
            );

            setCamps((previousCamps) =>
                previousCamps.filter(
                    (item) => item._id !== camp._id
                )
            );

            if (editingCamp?._id === camp._id) {
                setEditingCamp(null);
            }

            setSuccess(
                response.data?.message ||
                "Donation camp deleted successfully."
            );
        } catch (err) {
            console.error(
                "Failed to delete donation camp:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete donation camp."
            );
        } finally {
            setDeletingId(null);
        }
    };


    // Search camps by name, venue, or district
    const filteredCamps = camps.filter((camp) => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) return true;

        return (
            String(camp.campName || "")
                .toLowerCase()
                .includes(searchText) ||
            String(camp.venue || "")
                .toLowerCase()
                .includes(searchText) ||
            String(camp.district || "")
                .toLowerCase()
                .includes(searchText)
        );
    });

    const formatDate = (date) => {
        if (!date) return "Date not specified";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <HospitalPanel />

            <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800 sm:text-3xl">
                            <FaCalendarAlt className="text-red-700" />
                            Blood Donation Camps
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Manage camps organized by{" "}
                            <span className="font-semibold">
                                {hospitalName}
                            </span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddCamp}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
                    >
                        <FaPlus />
                        Add New Camp
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        role="alert"
                        className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                    >
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div
                        role="status"
                        className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
                    >
                        <p>{success}</p>

                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            aria-label="Dismiss success message"
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* Search and refresh */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search by camp name, venue, or district..."
                            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={fetchCamps}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        <FaSyncAlt
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                {/* Edit form */}
                {editingCamp && (
                    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-gray-800">
                                Edit Donation Camp
                            </h2>

                            <button
                                type="button"
                                onClick={() => setEditingCamp(null)}
                                disabled={busy}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>

                        <DonationCampForm
                            initialData={editingCamp}
                            onSubmit={handleUpdateCamp}
                            submitLabel="Save Changes"
                            busy={busy}
                        />
                    </section>
                )}

                {/* Camp list */}
                {loading ? (
                    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                        <FaSyncAlt className="mx-auto mb-3 animate-spin text-3xl text-red-700" />

                        <p className="text-gray-600">
                            Loading donation camps...
                        </p>
                    </div>
                ) : filteredCamps.length === 0 ? (
                    <div className="rounded-xl bg-white px-5 py-12 text-center shadow-sm">
                        <FaCalendarAlt className="mx-auto mb-4 text-5xl text-gray-300" />

                        <h2 className="mb-2 text-xl font-semibold text-gray-800">
                            {search
                                ? "No matching camps found"
                                : "No donation camps yet"}
                        </h2>

                        <p className="mb-5 text-gray-500">
                            {search
                                ? "Try a different search term."
                                : "Add your first blood donation camp to get started."}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                onClick={handleAddCamp}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
                            >
                                <FaPlus />
                                Add New Camp
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-gray-600">
                            Showing {filteredCamps.length} of{" "}
                            {camps.length} camp
                            {camps.length === 1 ? "" : "s"}
                        </p>

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {filteredCamps.map((camp) => (
                                <article
                                    key={camp._id}
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    <div className="border-b border-gray-100 p-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-800">
                                                    {camp.campName}
                                                </h2>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {camp.hospitalName}
                                                </p>
                                            </div>

                                            <span
                                                className={`w - fit rounded - full px - 3 py - 1 text - sm font - semibold ${camp.status === "Completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : camp.status === "Cancelled"
                                                        ? "bg-gray-200 text-gray-700"
                                                        : "bg-blue-100 text-blue-700"
                                                    } `}
                                            >
                                                {camp.status || "Upcoming"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5">
                                        {/* Date and time */}
                                        <div className="flex items-start gap-3 text-gray-600">
                                            <FaCalendarAlt className="mt-1 text-red-600" />

                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {formatDate(camp.date)}
                                                </p>

                                                <p className="text-sm">
                                                    {camp.startTime || "--:--"}
                                                    {" - "}
                                                    {camp.endTime || "--:--"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Venue */}
                                        <div className="flex items-start gap-3 text-gray-600">
                                            <FaMapMarkerAlt className="mt-1 text-red-600" />

                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {camp.venue || "Venue not specified"}
                                                </p>

                                                <p className="text-sm">
                                                    {camp.district || "District not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Blood groups */}
                                        <div className="flex items-start gap-3 text-gray-600">
                                            <FaTint className="mt-1 text-red-600" />

                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    Blood Groups Needed
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {Array.isArray(camp.bloodGroupsNeeded) &&
                                                        camp.bloodGroupsNeeded.length > 0 ? (
                                                        camp.bloodGroupsNeeded.map(
                                                            (group) => (
                                                                <span
                                                                    key={group}
                                                                    className="rounded-md bg-red-50 px-2 py-1 text-sm font-semibold text-red-700"
                                                                >
                                                                    {group}
                                                                </span>
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="text-sm">
                                                            Not specified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Capacity */}
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <FaUsers className="text-red-600" />

                                            <p>
                                                Capacity:{" "}
                                                <span className="font-semibold text-gray-800">
                                                    {camp.capacity ?? "Not specified"}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Contact */}
                                        {camp.contact && (
                                            <p className="text-sm text-gray-600">
                                                Contact:{" "}
                                                <a
                                                    href={`tel:${camp.contact} `}
                                                    className="font-medium text-red-700 hover:underline"
                                                >
                                                    {camp.contact}
                                                </a>
                                            </p>
                                        )}

                                        {/* Description */}
                                        {camp.description && (
                                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                                                {camp.description}
                                            </p>
                                        )}

                                        {/* Edit and delete */}
                                        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingCamp(camp)
                                                }
                                                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
                                            >
                                                <FaEdit />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteCamp(camp)
                                                }
                                                disabled={deletingId === camp._id}
                                                className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <FaTrash />
                                                {deletingId === camp._id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default ManageDonationCamps;
