
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
    "https://blood-donation-backend-olwl.onrender.com/donationEvents";

function DonationEventManagementADm() {

    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);


    const initialForm = {
        title: "",
        description: "",
        eventType: "Blood Donation Camp",
        location: "",
        address: "",
        date: "",
        startTime: "",
        endTime: "",
        organizer: "",
        contact: "",
        expectedDonors: "",
        registeredDonors: 0,
        status: "Upcoming",
    };

    const [formData, setFormData] =
        useState(initialForm);


    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {

        try {

            setLoading(true);

            const response =
                await axios.get(API_URL);

            setEvents(response.data);

        } catch (error) {

            console.error(
                "Error fetching donation events:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    const filteredEvents = useMemo(() => {

        const searchValue =
            search.toLowerCase().trim();

        return events.filter((event) => {

            const matchesSearch =
                event.title
                    ?.toLowerCase()
                    .includes(searchValue) ||

                event.location
                    ?.toLowerCase()
                    .includes(searchValue) ||

                event.organizer
                    ?.toLowerCase()
                    .includes(searchValue) ||

                event.eventType
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "All" ||
                event.status === statusFilter;

            const matchesType =
                typeFilter === "All" ||
                event.eventType === typeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );

        });

    }, [
        events,
        search,
        statusFilter,
        typeFilter,
    ]);

    const totalEvents = events.length;

    const upcomingEvents =
        events.filter(
            (event) =>
                event.status === "Upcoming"
        ).length;

    const completedEvents =
        events.filter(
            (event) =>
                event.status === "Completed"
        ).length;

    const cancelledEvents =
        events.filter(
            (event) =>
                event.status === "Cancelled"
        ).length;

    const totalRegistered =
        events.reduce(
            (sum, event) =>
                sum +
                Number(
                    event.registeredDonors || 0
                ),
            0
        );

    const totalExpected =
        events.reduce(
            (sum, event) =>
                sum +
                Number(
                    event.expectedDonors || 0
                ),
            0
        );

    const handleChange = (e) => {

        const { name, value } =
            e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    const openAddModal = () => {

        setEditingEvent(null);

        setFormData({
            ...initialForm,
        });

        setShowModal(true);

    };


    const openEditModal = (event) => {

        setEditingEvent(event);

        setFormData({
            title: event.title || "",
            description:
                event.description || "",
            eventType:
                event.eventType ||
                "Blood Donation Camp",
            location:
                event.location || "",
            address:
                event.address || "",
            date:
                event.date || "",
            startTime:
                event.startTime || "",
            endTime:
                event.endTime || "",
            organizer:
                event.organizer || "",
            contact:
                event.contact || "",
            expectedDonors:
                event.expectedDonors || "",
            registeredDonors:
                event.registeredDonors || 0,
            status:
                event.status || "Upcoming",
        });

        setShowModal(true);

    };


    const openViewModal = (event) => {

        setSelectedEvent(event);

        setShowViewModal(true);

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const eventData = {

                ...formData,

                expectedDonors:
                    Number(
                        formData.expectedDonors || 0
                    ),

                registeredDonors:
                    Number(
                        formData.registeredDonors || 0
                    ),

                updatedAt:
                    new Date().toISOString(),

            };

            if (editingEvent) {

                await axios.put(
                    `${API_URL}/${editingEvent.id}`,
                    {
                        ...editingEvent,
                        ...eventData,
                    }
                );

            } else {

                await axios.post(
                    API_URL,
                    {
                        ...eventData,
                        createdAt:
                            new Date().toISOString(),
                    }
                );

            }

            setShowModal(false);

            fetchEvents();

        } catch (error) {

            console.error(
                "Error saving event:",
                error
            );

            alert(
                "Unable to save donation event."
            );

        }

    };


    const deleteEvent = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this event?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await axios.delete(
                `${API_URL}/${id}`
            );

            fetchEvents();

        } catch (error) {

            console.error(
                "Error deleting event:",
                error
            );

            alert(
                "Unable to delete event."
            );

        }

    };

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


    const getTypeStyle = (type) => {

        if (type === "Emergency Drive") {
            return "bg-red-100 text-red-700";
        }

        if (type === "Awareness Campaign") {
            return "bg-purple-100 text-purple-700";
        }

        return "bg-pink-100 text-pink-700";

    };


    const formatDate = (date) => {

        if (!date) {
            return "Not specified";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };

    const registrationPercentage = (
        event
    ) => {

        const expected =
            Number(
                event.expectedDonors || 0
            );

        const registered =
            Number(
                event.registeredDonors || 0
            );

        if (expected === 0) {
            return 0;
        }

        return Math.min(
            Math.round(
                (registered /
                    expected) *
                100
            ),
            100
        );

    };

    return (

        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <div className="flex-1 p-8">

                <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-800">
                            Donation Events & Campaigns
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage blood donation camps,
                            campaigns and donor registrations.
                        </p>

                    </div>

                    <div className="flex gap-3">

                        <button
                            onClick={fetchEvents}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-3 rounded-lg font-semibold"
                        >
                            <FaSyncAlt
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                            Refresh
                        </button>

                        <button
                            onClick={
                                openAddModal
                            }
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold"
                        >
                            <FaPlus />
                            Add Event
                        </button>

                    </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

                    <SummaryCard
                        title="Total Events"
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
                        title="Registered Donors"
                        value={totalRegistered}
                        icon={<FaUsers />}
                        color="purple"
                    />

                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 mb-8">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Search */}

                        <div className="flex items-center border rounded-lg px-4">

                            <FaSearch className="text-gray-400" />

                            <input
                                type="text"
                                placeholder="Search events..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 outline-none"
                            />

                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="border rounded-lg px-4 py-3 outline-none"
                        >

                            <option value="All">
                                All Status
                            </option>

                            <option value="Upcoming">
                                Upcoming
                            </option>

                            <option value="Ongoing">
                                Ongoing
                            </option>

                            <option value="Completed">
                                Completed
                            </option>

                            <option value="Cancelled">
                                Cancelled
                            </option>

                        </select>

                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(
                                    e.target.value
                                )
                            }
                            className="border rounded-lg px-4 py-3 outline-none"
                        >

                            <option value="All">
                                All Event Types
                            </option>

                            <option value="Blood Donation Camp">
                                Blood Donation Camp
                            </option>

                            <option value="Emergency Drive">
                                Emergency Drive
                            </option>

                            <option value="Awareness Campaign">
                                Awareness Campaign
                            </option>

                        </select>

                    </div>

                </div>

                {loading ? (

                    <div className="bg-white rounded-2xl p-12 text-center">

                        <FaSyncAlt className="animate-spin mx-auto text-red-600 text-3xl" />

                        <p className="text-gray-500 mt-4">
                            Loading donation events...
                        </p>

                    </div>

                ) : filteredEvents.length === 0 ? (

                    <div className="bg-white rounded-2xl p-12 text-center">

                        <FaCalendarAlt className="mx-auto text-gray-300 text-5xl" />

                        <p className="text-gray-500 mt-4">
                            No donation events found.
                        </p>

                        <button
                            onClick={
                                openAddModal
                            }
                            className="mt-5 bg-red-600 text-white px-5 py-3 rounded-lg"
                        >
                            <FaPlus className="inline mr-2" />
                            Create Event
                        </button>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {filteredEvents.map(
                            (event) => {

                                const percentage =
                                    registrationPercentage(
                                        event
                                    );

                                return (

                                    <div
                                        key={event.id}
                                        className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
                                    >

                                        <div className="flex flex-col xl:flex-row gap-6">


                                            <div className="flex items-start">

                                                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">

                                                    <FaBullhorn className="text-red-600 text-2xl" />

                                                </div>

                                            </div>


                                            <div className="flex-1">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <h2 className="text-xl font-bold text-gray-800">
                                                        {
                                                            event.title
                                                        }
                                                    </h2>

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                                            event.status
                                                        )}`}
                                                    >
                                                        {
                                                            event.status
                                                        }
                                                    </span>

                                                </div>

                                                <p className="text-gray-500 mt-2">
                                                    {
                                                        event.description
                                                    }
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">

                                                    <InfoItem
                                                        icon={
                                                            <FaCalendarAlt />
                                                        }
                                                        label="Date"
                                                        value={formatDate(event.date)}
                                                    />

                                                    <InfoItem
                                                        icon={
                                                            <FaClock />
                                                        }
                                                        label="Time"
                                                        value={`${event.startTime || "--"} - ${event.endTime || "--"}`}
                                                    />

                                                    <InfoItem
                                                        icon={
                                                            <FaMapMarkerAlt />
                                                        }
                                                        label="Location"
                                                        value={
                                                            event.location ||
                                                            "Not specified"
                                                        }
                                                    />

                                                    <InfoItem
                                                        icon={
                                                            <FaUsers />
                                                        }
                                                        label="Organizer"
                                                        value={
                                                            event.organizer ||
                                                            "Not specified"
                                                        }
                                                    />

                                                </div>


                                                <div className="mt-4">

                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyle(
                                                            event.eventType
                                                        )}`}
                                                    >
                                                        {
                                                            event.eventType
                                                        }
                                                    </span>

                                                </div>


                                                <div className="mt-5">

                                                    <div className="flex justify-between mb-2">

                                                        <span className="text-sm font-semibold text-gray-600">
                                                            Donor Registrations
                                                        </span>

                                                        <span className="text-sm font-bold text-red-600">

                                                            {
                                                                event.registeredDonors ||
                                                                0
                                                            }

                                                            {" / "}

                                                            {
                                                                event.expectedDonors ||
                                                                0
                                                            }

                                                        </span>

                                                    </div>

                                                    <div className="w-full bg-gray-200 rounded-full h-3">

                                                        <div
                                                            className="bg-red-600 h-3 rounded-full transition-all"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />

                                                    </div>

                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {percentage}% registered
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="flex xl:flex-col gap-2">

                                                <button
                                                    onClick={() =>
                                                        openViewModal(
                                                            event
                                                        )
                                                    }
                                                    className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-700 hover:text-white"
                                                    title="View"
                                                >
                                                    <FaEye />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openEditModal(
                                                            event
                                                        )
                                                    }
                                                    className="w-11 h-11 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteEvent(
                                                            event.id
                                                        )
                                                    }
                                                    className="w-11 h-11 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {showModal && (

                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

                        {/* Header */}

                        <div className="flex justify-between items-center p-6 border-b">

                            <div>

                                <h2 className="text-2xl font-bold text-gray-800">

                                    {editingEvent
                                        ? "Edit Donation Event"
                                        : "Create Donation Event"}

                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Add campaign and event details.
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setShowModal(false)
                                }
                                className="text-gray-500 hover:text-red-600 text-xl"
                            >
                                ✕
                            </button>

                        </div>

                        {/* Form */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="p-6 space-y-5"
                        >

                            <div className="grid md:grid-cols-2 gap-5">

                                {/* Title */}

                                <div className="md:col-span-2">

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Event / Campaign Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={
                                            formData.title
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Enter event title"
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                                    />

                                </div>


                                <div className="md:col-span-2">

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="3"
                                        placeholder="Describe the donation campaign"
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                                    />

                                </div>


                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Event Type
                                    </label>

                                    <select
                                        name="eventType"
                                        value={
                                            formData.eventType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    >

                                        <option value="Blood Donation Camp">
                                            Blood Donation Camp
                                        </option>

                                        <option value="Emergency Drive">
                                            Emergency Drive
                                        </option>

                                        <option value="Awareness Campaign">
                                            Awareness Campaign
                                        </option>

                                    </select>

                                </div>


                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            formData.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    >

                                        <option value="Upcoming">
                                            Upcoming
                                        </option>

                                        <option value="Ongoing">
                                            Ongoing
                                        </option>

                                        <option value="Completed">
                                            Completed
                                        </option>

                                        <option value="Cancelled">
                                            Cancelled
                                        </option>

                                    </select>

                                </div>



                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Location
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={
                                            formData.location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Hospital / Blood Bank"
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    />

                                </div>


                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        name="address"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Full address"
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    />

                                </div>


                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Event Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={
                                            formData.date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    />

                                </div>


                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Start Time
                                    </label>

                                    <input
                                        type="time"
                                        name="startTime"
                                        value={
                                            formData.startTime
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    />

                                </div>

                                {/* End Time */}

                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        End Time
                                    </label>

                                    <input
                                        type="time"
                                        name="endTime"
                                        value={
                                            formData.endTime
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    />

                                </div>


                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Organizer
                                    </label>

                                    <input
                                        type="text"
                                        name="organizer"
                                        value={
                                            formData.organizer
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Organizer name"
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    />

                                </div>


                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Contact Number
                                    </label>

                                    <input
                                        type="text"
                                        name="contact"
                                        value={
                                            formData.contact
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Contact number"
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    />

                                </div>


                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Expected Donors
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        name="expectedDonors"
                                        value={
                                            formData.expectedDonors
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Expected number"
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    />

                                </div>


                                <div>

                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Registered Donors
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        name="registeredDonors"
                                        value={
                                            formData.registeredDonors
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full border rounded-lg px-4 py-3 outline-none"
                                    />

                                </div>

                            </div>


                            <div className="flex justify-end gap-3 pt-4 border-t">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowModal(
                                            false
                                        )
                                    }
                                    className="px-5 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                                >
                                    {editingEvent
                                        ? "Update Event"
                                        : "Create Event"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {showViewModal &&
                selectedEvent && (

                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

                            <div className="flex justify-between items-center p-6 border-b">

                                <div>

                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Event Details
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Donation campaign information
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
                                    }
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
                                                {
                                                    selectedEvent.title
                                                }
                                            </h3>

                                            <span
                                                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                                    selectedEvent.status
                                                )}`}
                                            >
                                                {
                                                    selectedEvent.status
                                                }
                                            </span>

                                        </div>

                                    </div>

                                </div>

                                <p className="text-gray-600">
                                    {
                                        selectedEvent.description ||
                                        "No description available."
                                    }
                                </p>

                                <div className="grid md:grid-cols-2 gap-4">

                                    <DetailItem
                                        label="Event Type"
                                        value={
                                            selectedEvent.eventType
                                        }
                                    />

                                    <DetailItem
                                        label="Date"
                                        value={formatDate(
                                            selectedEvent.date
                                        )}
                                    />

                                    <DetailItem
                                        label="Time"
                                        value={`${selectedEvent.startTime || "--"} - ${selectedEvent.endTime || "--"}`}
                                    />

                                    <DetailItem
                                        label="Location"
                                        value={
                                            selectedEvent.location
                                        }
                                    />

                                    <DetailItem
                                        label="Address"
                                        value={
                                            selectedEvent.address
                                        }
                                    />

                                    <DetailItem
                                        label="Organizer"
                                        value={
                                            selectedEvent.organizer
                                        }
                                    />

                                    <DetailItem
                                        label="Contact"
                                        value={
                                            selectedEvent.contact
                                        }
                                    />

                                    <DetailItem
                                        label="Expected Donors"
                                        value={
                                            selectedEvent.expectedDonors ||
                                            0
                                        }
                                    />

                                    <DetailItem
                                        label="Registered Donors"
                                        value={
                                            selectedEvent.registeredDonors ||
                                            0
                                        }
                                    />

                                </div>

                                <div>

                                    <div className="flex justify-between mb-2">

                                        <span className="font-semibold text-gray-700">
                                            Registration Progress
                                        </span>

                                        <span className="font-bold text-red-600">
                                            {
                                                registrationPercentage(
                                                    selectedEvent
                                                )
                                            }%
                                        </span>

                                    </div>

                                    <div className="w-full bg-gray-200 h-3 rounded-full">

                                        <div
                                            className="bg-red-600 h-3 rounded-full"
                                            style={{
                                                width: `${registrationPercentage(
                                                    selectedEvent
                                                )}%`,
                                            }}
                                        />

                                    </div>

                                </div>

                                <div className="flex justify-end">

                                    <button
                                        onClick={() =>
                                            setShowViewModal(
                                                false
                                            )
                                        }
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


function SummaryCard({
    title,
    value,
    icon,
    color,
}) {

    const colors = {

        red: {
            border: "border-red-600",
            text: "text-red-600",
            bg: "bg-red-100",
        },

        blue: {
            border: "border-blue-600",
            text: "text-blue-600",
            bg: "bg-blue-100",
        },

        green: {
            border: "border-green-600",
            text: "text-green-600",
            bg: "bg-green-100",
        },

        gray: {
            border: "border-gray-500",
            text: "text-gray-600",
            bg: "bg-gray-100",
        },

        purple: {
            border: "border-purple-600",
            text: "text-purple-600",
            bg: "bg-purple-100",
        },

    };

    const style =
        colors[color] || colors.red;

    return (

        <div
            className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${style.border}`}
        >

            <div className="flex justify-between items-center">

                <div>

                    <p className="text-gray-500 text-sm">
                        {title}
                    </p>

                    <p
                        className={`text-3xl font-bold mt-2 ${style.text}`}
                    >
                        {value}
                    </p>

                </div>

                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${style.bg}`}
                >
                    <span className={style.text}>
                        {icon}
                    </span>
                </div>

            </div>

        </div>

    );

}


function InfoItem({
    icon,
    label,
    value,
}) {

    return (

        <div className="flex items-start gap-3">

            <div className="text-red-600 mt-1">
                {icon}
            </div>

            <div>

                <p className="text-xs text-gray-400">
                    {label}
                </p>

                <p className="text-sm font-semibold text-gray-700">
                    {value}
                </p>

            </div>

        </div>

    );

}


function DetailItem({
    label,
    value,
}) {

    return (

        <div className="bg-gray-50 rounded-lg p-4">

            <p className="text-xs text-gray-400">
                {label}
            </p>

            <p className="font-semibold text-gray-700 mt-1">
                {value || "Not specified"}
            </p>

        </div>

    );

}

export default DonationEventManagementADm;