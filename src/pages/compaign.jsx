
import { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "../components/Navbar";

import {
    FaTint,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaClock,
    FaUsers,
    FaSearch,
    FaHospital,
    FaArrowRight,
    FaHeartbeat,
    FaExclamationCircle,
    FaSyncAlt,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import axiosInstance from "../API/axiosInstance";

function Campaigns() {
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch donation camps from MongoDB BDS
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/donationCamps");

            console.log("Donation Camps API Response:", response.data);

            // Your backend controller returns { count, camps }
            let eventList = [];

            if (Array.isArray(response.data)) {
                eventList = response.data;
            } else if (Array.isArray(response.data?.camps)) {
                eventList = response.data.camps;
            } else if (Array.isArray(response.data?.donationEvents)) {
                eventList = response.data.donationEvents;
            } else if (Array.isArray(response.data?.events)) {
                eventList = response.data.events;
            } else if (Array.isArray(response.data?.data)) {
                eventList = response.data.data;
            }

            console.log("Donation Camps Loaded:", eventList);

            setEvents(eventList);

        } catch (err) {
            console.error(
                "Error fetching donation camps:",
                err.response?.data || err.message
            );

            setEvents([]);

            setError(
                err.response?.data?.message ||
                "Unable to load donation campaigns."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Check upcoming camps
    const isUpcoming = (event) => {
        const status = String(event.status || "Upcoming")
            .trim()
            .toLowerCase();

        if (
            ["cancelled", "canceled", "completed", "rejected"].includes(status)
        ) {
            return false;
        }

        if (!event.date) {
            return true;
        }

        const eventDate = new Date(event.date);

        if (Number.isNaN(eventDate.getTime())) {
            return true;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        return eventDate >= today;
    };

    // Search and filter
    const upcomingEvents = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return events
            .filter(isUpcoming)
            .filter((event) => {
                const searchableFields = [
                    event.campName,
                    event.title,
                    event.venue,
                    event.location,
                    event.address,
                    event.district,
                    event.hospitalName,
                ];

                return searchableFields.some((field) =>
                    String(field || "").toLowerCase().includes(searchText)
                );
            })
            .sort((a, b) => {
                return new Date(a.date || 0) - new Date(b.date || 0);
            });
    }, [events, search]);

    // Statistics
    const totalEvents = upcomingEvents.length;

    const totalRegisteredDonors = upcomingEvents.reduce(
        (total, event) =>
            total + Number(event.registeredDonors || 0),
        0
    );

    const totalTargetDonors = upcomingEvents.reduce(
        (total, event) =>
            total + Number(
                event.capacity ||
                event.targetDonors ||
                event.target ||
                0
            ),
        0
    );

    // Date format
    const formatDate = (date) => {
        if (!date) return "Date not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Date not available";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Time format
    const getTime = (event) => {
        if (event.startTime && event.endTime) {
            return `${event.startTime} - ${event.endTime}`;
        }

        return event.startTime || event.time || "Time not available";
    };

    // Blood groups
    const getBloodGroups = (event) => {
        if (Array.isArray(event.bloodGroupsNeeded)) {
            return event.bloodGroupsNeeded;
        }

        if (Array.isArray(event.bloodGroups)) {
            return event.bloodGroups;
        }

        return [];
    };

    // Join campaign
    const handleJoinCampaign = (event) => {
        navigate("/login", {
            state: {
                donationCampId: event._id,
                donationCamp: event,
                from: "campaign",
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-500 text-white py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">

                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm mb-5">
                        <FaHeartbeat />
                        Every Donation Saves Lives
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-5">
                        Blood Donation Campaigns
                    </h1>

                    <p className="max-w-2xl mx-auto text-red-50 text-base md:text-lg leading-relaxed">
                        Be a part of our life-saving mission.
                        Join upcoming blood donation events and
                        help someone get a second chance at life.
                    </p>

                    <button
                        onClick={() =>
                            document
                                .getElementById("campaign-list")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="mt-8 bg-white text-red-600 px-7 py-3 rounded-full font-semibold hover:bg-red-50 transition"
                    >
                        Explore Campaigns
                        <FaArrowRight className="inline ml-2" />
                    </button>

                </div>
            </section>

            {/* Statistics */}
            <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <FaCalendarAlt className="text-red-500 text-3xl mx-auto mb-3" />
                        <h2 className="text-3xl font-bold text-gray-800">
                            {loading ? "..." : totalEvents}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            Upcoming Campaigns
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <FaUsers className="text-red-500 text-3xl mx-auto mb-3" />
                        <h2 className="text-3xl font-bold text-gray-800">
                            {loading ? "..." : totalRegisteredDonors}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            Registered Donors
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <FaTint className="text-red-500 text-3xl mx-auto mb-3" />
                        <h2 className="text-3xl font-bold text-gray-800">
                            {loading ? "..." : totalTargetDonors}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            Total Camp Capacity
                        </p>
                    </div>

                </div>
            </section>

            {/* Campaign List */}
            <section
                id="campaign-list"
                className="max-w-7xl mx-auto px-4 py-16"
            >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Upcoming Donation Camps
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Find a campaign near you and become a life saver.
                        </p>
                    </div>

                    <button
                        onClick={fetchEvents}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 border border-red-500 text-red-600 px-5 py-2.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                        <FaSyncAlt className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>

                </div>

                {/* Search */}
                <div className="relative mb-8 max-w-xl">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by camp name, venue or district..."
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    />
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-16">

                        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

                        <p className="text-gray-500">
                            Loading donation camps...
                        </p>

                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">

                        <FaExclamationCircle className="text-red-500 text-3xl mx-auto mb-3" />

                        <p className="text-red-700 mb-4">
                            {error}
                        </p>

                        <button
                            onClick={fetchEvents}
                            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && upcomingEvents.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">

                        <FaCalendarAlt className="text-gray-300 text-5xl mx-auto mb-4" />

                        <h3 className="text-xl font-semibold text-gray-700">
                            No Upcoming Donation Camps Found
                        </h3>

                        <p className="text-gray-500 mt-2">
                            {search
                                ? "Try searching with a different keyword."
                                : events.length === 0
                                    ? "No donation camps are currently available."
                                    : "There are no upcoming camps. Please check again later."}
                        </p>

                    </div>
                )}

                {/* Campaign Cards */}
                {!loading && !error && upcomingEvents.length > 0 && (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

                        {upcomingEvents.map((event) => {

                            const registered = Number(
                                event.registeredDonors || 0
                            );

                            const target = Number(
                                event.capacity ||
                                event.targetDonors ||
                                event.target ||
                                0
                            );

                            const progress = target > 0
                                ? Math.min((registered / target) * 100, 100)
                                : 0;

                            const bloodGroups = getBloodGroups(event);

                            return (

                                <div
                                    key={event._id}
                                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                                >

                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-red-600 to-red-500 p-5 text-white">

                                        <div className="flex justify-between items-start gap-3">

                                            <div>

                                                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                                                    {event.status || "Upcoming"}
                                                </span>

                                                <h3 className="text-xl font-bold mt-3">
                                                    {event.campName ||
                                                        event.title ||
                                                        "Blood Donation Camp"}
                                                </h3>

                                            </div>

                                            <FaTint className="text-3xl opacity-80" />

                                        </div>

                                    </div>

                                    {/* Card Details */}
                                    <div className="p-6">

                                        <div className="space-y-4 text-gray-600">

                                            {/* Hospital */}
                                            {event.hospitalName && (
                                                <div className="flex items-start gap-3">
                                                    <FaHospital className="text-red-500 mt-1" />

                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            Organized By
                                                        </p>

                                                        <p className="text-sm">
                                                            {event.hospitalName}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Date */}
                                            <div className="flex items-start gap-3">
                                                <FaCalendarAlt className="text-red-500 mt-1" />

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        Date
                                                    </p>

                                                    <p className="text-sm">
                                                        {formatDate(event.date)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Time */}
                                            <div className="flex items-start gap-3">
                                                <FaClock className="text-red-500 mt-1" />

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        Time
                                                    </p>

                                                    <p className="text-sm">
                                                        {getTime(event)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Venue */}
                                            <div className="flex items-start gap-3">
                                                <FaMapMarkerAlt className="text-red-500 mt-1" />

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        Venue
                                                    </p>

                                                    <p className="text-sm">
                                                        {event.venue ||
                                                            event.location ||
                                                            "Venue not available"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* District */}
                                            {event.district && (
                                                <div className="flex items-start gap-3">
                                                    <FaMapMarkerAlt className="text-red-500 mt-1" />

                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            District
                                                        </p>

                                                        <p className="text-sm">
                                                            {event.district}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contact */}
                                            {event.contact && (
                                                <div className="flex items-start gap-3">
                                                    <FaUsers className="text-red-500 mt-1" />

                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            Contact
                                                        </p>

                                                        <p className="text-sm">
                                                            {event.contact}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                        {/* Description */}
                                        {event.description && (
                                            <p className="text-sm text-gray-500 mt-5 leading-6">
                                                {event.description}
                                            </p>
                                        )}

                                        {/* Blood Groups */}
                                        {bloodGroups.length > 0 && (
                                            <div className="mt-5">

                                                <p className="text-sm font-semibold text-gray-800 mb-2">
                                                    Required Blood Groups
                                                </p>

                                                <div className="flex flex-wrap gap-2">

                                                    {bloodGroups.map((group, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-semibold"
                                                        >
                                                            {group}
                                                        </span>
                                                    ))}

                                                </div>

                                            </div>
                                        )}

                                        {/* Donor Progress */}
                                        <div className="mt-6">

                                            <div className="flex justify-between text-sm mb-2">

                                                <span className="text-gray-600">
                                                    Registered Donors
                                                </span>

                                                <span className="font-semibold text-gray-800">
                                                    {registered} / {target || "Not specified"}
                                                </span>

                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2">

                                                <div
                                                    className="bg-red-500 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                        {/* Join Button */}
                                        <button
                                            onClick={() => handleJoinCampaign(event)}
                                            className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                                        >
                                            Join Campaign
                                            <FaArrowRight />
                                        </button>

                                    </div>

                                </div>

                            );
                        })}

                    </div>

                )}

            </section>

            {/* Bottom Section */}
            <section className="bg-red-50 py-14 px-4">

                <div className="max-w-4xl mx-auto text-center">

                    <FaHeartbeat className="text-red-500 text-4xl mx-auto mb-4" />

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Be Someone's Lifeline
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Your one donation can make a difference.
                        Join a blood donation campaign and help save lives.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 bg-red-600 text-white px-7 py-3 rounded-full font-semibold hover:bg-red-700 transition"
                    >
                        Become a Donor
                    </button>

                </div>

            </section>

        </div>
    );
}

export default Campaigns;
