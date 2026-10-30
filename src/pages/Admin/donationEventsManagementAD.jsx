
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrash,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUsers,
    FaTint,
    FaClock,
    FaEye,
    FaSyncAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaBullhorn,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";

const API_URL =
    "https://blood-donation-backend-olwl.onrender.com/api/donationCamps";

const getCampId = (camp) => camp?._id || camp?.id;

const extractCamps = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.camps)) return data.camps;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.camps)) return data.data.camps;

    return [];
};

const initialForm = {
    campName: "",
    hospitalName: "",
    hospitalEmail: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    district: "",
    bloodGroupsNeeded: "",
    capacity: "",
    contact: "",
    description: "",
    status: "Upcoming",
};

function DonationEventManagementADm() {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [formData, setFormData] = useState(initialForm);

    // Fetch donation camps
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            setEvents(extractCamps(response.data));
        } catch (error) {
            console.error(
                "Error fetching donation camps:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load donation camps."
            );
        } finally {
            setLoading(false);
        }
    };

    // Format date for date input
    const formatDateInput = (date) => {
        if (!date) return "";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date).slice(0, 10);
        }

        return parsedDate.toISOString().slice(0, 10);
    };

    // Display date
    const formatDate = (date) => {
        if (!date) return "Not specified";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not specified";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Convert blood groups to display text
    const getBloodGroups = (groups) => {
        if (Array.isArray(groups)) {
            return groups.join(", ");
        }

        return groups || "Not specified";
    };

    // Search and filter
    const filteredEvents = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return events.filter((event) => {
            const searchableFields = [
                event.campName,
                event.hospitalName,
                event.hospitalEmail,
                event.venue,
                event.district,
                event.contact,
                event.description,
                getBloodGroups(event.bloodGroupsNeeded),
            ];

            const matchesSearch = searchableFields.some((field) =>
                String(field || "")
                    .toLowerCase()
                    .includes(searchValue)
            );

            const matchesStatus =
                statusFilter === "All" ||
                event.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [events, search, statusFilter]);

    // Statistics
    const totalEvents = events.length;

    const upcomingEvents = events.filter(
        (event) => event.status === "Upcoming"
    ).length;

    const completedEvents = events.filter(
        (event) => event.status === "Completed"
    ).length;

    const cancelledEvents = events.filter(
        (event) => event.status === "Cancelled"
    ).length;

    const totalCapacity = events.reduce(
        (sum, event) => sum + Number(event.capacity || 0),
        0
    );

    // Input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Open add form
    const openAddModal = () => {
        setEditingEvent(null);
        setFormData({ ...initialForm });
        setShowModal(true);
    };

    // Open edit form
    const openEditModal = (event) => {
        setEditingEvent(event);

        setFormData({
            campName: event.campName || "",
            hospitalName: event.hospitalName || "",
            hospitalEmail: event.hospitalEmail || "",
            date: formatDateInput(event.date),
            startTime: event.startTime || "",
            endTime: event.endTime || "",
            venue: event.venue || "",
            district: event.district || "",
            bloodGroupsNeeded: getBloodGroups(
                event.bloodGroupsNeeded
            ),
            capacity: event.capacity ?? "",
            contact: event.contact || "",
            description: event.description || "",
            status: event.status || "Upcoming",
        });

        setShowModal(true);
    };

    // Open details
    const openViewModal = (event) => {
        setSelectedEvent(event);
        setShowViewModal(true);
    };

    // Save camp
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const campData = {
                campName: formData.campName.trim(),
                hospitalName: formData.hospitalName.trim(),
                hospitalEmail: formData.hospitalEmail.trim().toLowerCase(),
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                venue: formData.venue.trim(),
                district: formData.district.trim(),

                // Store blood groups as an array
                bloodGroupsNeeded: formData.bloodGroupsNeeded
                    .split(",")
                    .map((group) => group.trim().toUpperCase())
                    .filter(Boolean),

                capacity: Number(formData.capacity || 0),
                contact: formData.contact.trim(),
                description: formData.description.trim(),
                status: formData.status,
            };

            if (editingEvent) {
                const id = getCampId(editingEvent);

                await axios.put(`${API_URL}/${id}`, campData);
            } else {
                await axios.post(API_URL, campData);
            }

            setShowModal(false);
            setEditingEvent(null);
            setFormData({ ...initialForm });

            await fetchEvents();

            alert(
                editingEvent
                    ? "Donation camp updated successfully."
                    : "Donation camp created successfully."
            );
        } catch (error) {
            console.error(
                "Error saving donation camp:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Unable to save donation camp. Please check the backend."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete camp
    const deleteEvent = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this donation camp?"
        );

        if (!confirmed) return;

        try {
            await axios.delete(`${API_URL}/${id}`);

            setEvents((previous) =>
                previous.filter(
                    (event) => getCampId(event) !== id
                )
            );

            if (
                selectedEvent &&
                getCampId(selectedEvent) === id
            ) {
                setSelectedEvent(null);
                setShowViewModal(false);
            }

            alert("Donation camp deleted successfully.");
        } catch (error) {
            console.error(
                "Error deleting donation camp:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete donation camp."
            );
        }
    };

    // Status style
    const getStatusStyle = (status) => {
        switch (status) {
            case "Upcoming":
                return "bg-blue-100 text-blue-700";

            case "Ongoing":
                return "bg-green-100 text-green-700";

            case "Completed":
                return "bg-gray-100 text-gray-700";

            case "Cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <div className="flex-1 min-w-0 p-5 md:p-8">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Donation Camps Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage blood donation camps and registrations.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">

                        <button
                            onClick={fetchEvents}
                            disabled={loading}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg font-semibold disabled:opacity-50"
                        >
                            <FaSyncAlt
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold"
                        >
                            <FaPlus />
                            Add Camp
                        </button>

                    </div>

                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

                    <SummaryCard
                        title="Total Camps"
                        value={totalEvents}
                        icon={<FaCalendarAlt />}
                        color="red"
                    />

                    <SummaryCard
                        title="Upcoming"
                        value={upcomingEvents}
                        icon={<FaClock />}
                        color="blue"
                    />

                    <SummaryCard
                        title="Completed"
                        value={completedEvents}
                        icon={<FaCheckCircle />}
                        color="green"
                    />

                    <SummaryCard
                        title="Cancelled"
                        value={cancelledEvents}
                        icon={<FaTimesCircle />}
                        color="gray"
                    />

                    <SummaryCard
                        title="Total Capacity"
                        value={totalCapacity}
                        icon={<FaUsers />}
                        color="purple"
                    />

                </div>

                {/* Search and filter */}
                <div className="bg-white rounded-2xl shadow-md p-5 mb-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="flex items-center border rounded-lg px-4">

                            <FaSearch className="text-gray-400" />

                            <input
                                type="text"
                                placeholder="Search camps, hospital, venue..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="w-full p-3 outline-none"
                            />

                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="border rounded-lg px-4 py-3 outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                    </div>

                </div>

                {/* Camp list */}
                {loading ? (

                    <div className="bg-white rounded-2xl p-12 text-center">
                        <FaSyncAlt className="animate-spin mx-auto text-red-600 text-3xl" />

                        <p className="text-gray-500 mt-4">
                            Loading donation camps...
                        </p>
                    </div>

                ) : error ? (

                    <div className="bg-white rounded-2xl p-12 text-center">

                        <p className="text-red-600 mb-4">
                            {error}
                        </p>

                        <button
                            onClick={fetchEvents}
                            className="bg-red-600 text-white px-5 py-3 rounded-lg"
                        >
                            Try Again
                        </button>

                    </div>

                ) : filteredEvents.length === 0 ? (

                    <div className="bg-white rounded-2xl p-12 text-center">

                        <FaCalendarAlt className="mx-auto text-gray-300 text-5xl" />

                        <p className="text-gray-500 mt-4">
                            No donation camps found.
                        </p>

                        <button
                            onClick={openAddModal}
                            className="mt-5 bg-red-600 text-white px-5 py-3 rounded-lg"
                        >
                            <FaPlus className="inline mr-2" />
                            Create Camp
                        </button>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {filteredEvents.map((event) => {
                            const id = getCampId(event);

                            return (
                                <div
                                    key={id}
                                    className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
                                >

                                    <div className="flex flex-col xl:flex-row gap-6">

                                        {/* Icon */}
                                        <div className="flex items-start">
                                            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                                                <FaBullhorn className="text-red-600 text-2xl" />
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">

                                            <div className="flex flex-wrap items-center gap-2">

                                                <h2 className="text-xl font-bold text-gray-800">
                                                    {event.campName || "Untitled Camp"}
                                                </h2>

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                                        event.status
                                                    )}`}
                                                >
                                                    {event.status || "Upcoming"}
                                                </span>

                                            </div>

                                            <p className="text-gray-500 mt-2">
                                                {event.description ||
                                                    "No description available."}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">

                                                <InfoItem
                                                    icon={<FaCalendarAlt />}
                                                    label="Date"
                                                    value={formatDate(event.date)}
                                                />

                                                <InfoItem
                                                    icon={<FaClock />}
                                                    label="Time"
                                                    value={`${event.startTime || "--"} - ${event.endTime || "--"}`}
                                                />

                                                <InfoItem
                                                    icon={<FaMapMarkerAlt />}
                                                    label="Venue"
                                                    value={event.venue || "Not specified"}
                                                />

                                                <InfoItem
                                                    icon={<FaUsers />}
                                                    label="Hospital / Organizer"
                                                    value={event.hospitalName || "Not specified"}
                                                />

                                            </div>

                                            <div className="mt-5 flex flex-wrap gap-3">

                                                <span className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold">
                                                    <FaTint className="inline mr-1" />
                                                    {getBloodGroups(event.bloodGroupsNeeded)}
                                                </span>

                                                <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold">
                                                    Capacity: {event.capacity ?? 0}
                                                </span>

                                                <span className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold">
                                                    District: {event.district || "N/A"}
                                                </span>

                                            </div>

                                            <p className="text-sm text-gray-500 mt-4">
                                                Contact: {event.contact || "Not specified"}
                                            </p>

                                        </div>

                                        {/* Actions */}
                                        <div className="flex xl:flex-col gap-2">

                                            <button
                                                onClick={() => openViewModal(event)}
                                                className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-700 hover:text-white"
                                                title="View"
                                            >
                                                <FaEye />
                                            </button>

                                            <button
                                                onClick={() => openEditModal(event)}
                                                className="w-11 h-11 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>

                                            <button
                                                onClick={() => deleteEvent(id)}
                                                className="w-11 h-11 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                                title="Delete"
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

            {/* Add / Edit Modal */}
            {showModal && (

                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center p-6 border-b">

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingEvent
                                        ? "Edit Donation Camp"
                                        : "Create Donation Camp"}
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Enter the donation camp details.
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

                            <div className="grid md:grid-cols-2 gap-5">

                                {/* Camp name */}
                                <FormField label="Camp Name" required>
                                    <input
                                        type="text"
                                        name="campName"
                                        value={formData.campName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter camp name"
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Hospital */}
                                <FormField label="Hospital / Organizer Name" required>
                                    <input
                                        type="text"
                                        name="hospitalName"
                                        value={formData.hospitalName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter hospital name"
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Hospital email */}
                                <FormField label="Hospital Email">
                                    <input
                                        type="email"
                                        name="hospitalEmail"
                                        value={formData.hospitalEmail}
                                        onChange={handleChange}
                                        placeholder="hospital@example.com"
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Date */}
                                <FormField label="Camp Date" required>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Start */}
                                <FormField label="Start Time" required>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                </FormField>

                                {/* End */}
                                <FormField label="End Time" required>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Venue */}
                                <FormField label="Venue" required>
                                    <input
                                        type="text"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter venue"
                                        className="form-input"
                                    />
                                </FormField>

                                {/* District */}
                                <FormField label="District" required>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter district"
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Blood groups */}
                                <FormField label="Blood Groups Needed" required>
                                    <input
                                        type="text"
                                        name="bloodGroupsNeeded"
                                        value={formData.bloodGroupsNeeded}
                                        onChange={handleChange}
                                        required
                                        placeholder="Example: A+, B+, O+, AB-"
                                        className="form-input"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Separate blood groups using commas.
                                    </p>
                                </FormField>

                                {/* Capacity */}
                                <FormField label="Camp Capacity" required>
                                    <input
                                        type="number"
                                        min="1"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        required
                                        placeholder="Expected donor capacity"
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Contact */}
                                <FormField label="Contact Number" required>
                                    <input
                                        type="text"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        required
                                        placeholder="Contact number"
                                        className="form-input"
                                    />
                                </FormField>

                                {/* Status */}
                                <FormField label="Status">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="form-input"
                                    >
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </FormField>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <FormField label="Description">
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="Describe the donation camp..."
                                            className="form-input"
                                        />
                                    </FormField>
                                </div>

                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">

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
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingEvent
                                            ? "Update Camp"
                                            : "Create Camp"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* View Modal */}
            {showViewModal && selectedEvent && (

                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center p-6 border-b">

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Donation Camp Details
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Camp information
                                </p>
                            </div>

                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-500 hover:text-red-600 text-xl"
                            >
                                ✕
                            </button>

                        </div>

                        <div className="p-6 space-y-5">

                            <div className="bg-red-50 rounded-xl p-5">

                                <div className="flex items-center gap-4">

                                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                        <FaTint className="text-red-600 text-xl" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">
                                            {selectedEvent.campName}
                                        </h3>

                                        <span
                                            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                                selectedEvent.status
                                            )}`}
                                        >
                                            {selectedEvent.status || "Upcoming"}
                                        </span>
                                    </div>

                                </div>

                            </div>

                            <p className="text-gray-600">
                                {selectedEvent.description ||
                                    "No description available."}
                            </p>

                            <div className="grid md:grid-cols-2 gap-4">

                                <DetailItem
                                    label="Hospital / Organizer"
                                    value={selectedEvent.hospitalName}
                                />

                                <DetailItem
                                    label="Hospital Email"
                                    value={selectedEvent.hospitalEmail}
                                />

                                <DetailItem
                                    label="Date"
                                    value={formatDate(selectedEvent.date)}
                                />

                                <DetailItem
                                    label="Time"
                                    value={`${selectedEvent.startTime || "--"} - ${selectedEvent.endTime || "--"}`}
                                />

                                <DetailItem
                                    label="Venue"
                                    value={selectedEvent.venue}
                                />

                                <DetailItem
                                    label="District"
                                    value={selectedEvent.district}
                                />

                                <DetailItem
                                    label="Blood Groups Needed"
                                    value={getBloodGroups(
                                        selectedEvent.bloodGroupsNeeded
                                    )}
                                />

                                <DetailItem
                                    label="Camp Capacity"
                                    value={selectedEvent.capacity}
                                />

                                <DetailItem
                                    label="Contact"
                                    value={selectedEvent.contact}
                                />

                            </div>

                            <div className="flex justify-end">

                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold"
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

// Summary card
function SummaryCard({ title, value, icon, color }) {
    const colors = {
        red: "border-red-600 text-red-600 bg-red-100",
        blue: "border-blue-600 text-blue-600 bg-blue-100",
        green: "border-green-600 text-green-600 bg-green-100",
        gray: "border-gray-500 text-gray-600 bg-gray-100",
        purple: "border-purple-600 text-purple-600 bg-purple-100",
    };

    const style = colors[color] || colors.red;
    const [border, text, background] = style.split(" ");

    return (
        <div className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${border}`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>
                    <p className={`text-3xl font-bold mt-2 ${text}`}>
                        {value}
                    </p>
                </div>

                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${background}`}>
                    <span className={text}>{icon}</span>
                </div>
            </div>
        </div>
    );
}

// Information item
function InfoItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="text-red-600 mt-1">{icon}</div>

            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-700">
                    {value}
                </p>
            </div>
        </div>
    );
}

// Form field
function FormField({ label, required, children }) {
    return (
        <div>
            <label className="block font-semibold text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-600"> *</span>}
            </label>
            {children}
        </div>
    );
}

// Detail item
function DetailItem({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-semibold text-gray-700 mt-1 break-words">
                {value || "Not specified"}
            </p>
        </div>
    );
}

export default DonationEventManagementADm;
