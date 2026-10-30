import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";

import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUsers,
    FaTint,
    FaHeart,
    FaSyncAlt,
} from "react-icons/fa";

const API_URL =
    "https://blood-donation-backend-olwl.onrender.com/api/campaigns";

function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================
    // FETCH CAMPAIGNS
    // =========================================

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            setCampaigns(response.data);
        } catch (error) {
            console.error(
                "Error fetching campaigns:",
                error
            );

            setError(
                "Unable to load campaigns. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // STATISTICS
    // =========================================

    const upcomingCampaigns = campaigns.filter(
        (campaign) =>
            campaign.status === "Upcoming"
    );

    const totalRegisteredDonors =
        campaigns.reduce(
            (sum, campaign) =>
                sum +
                Number(
                    campaign.registeredDonors || 0
                ),
            0
        );

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-100">

                {/* =====================================
                    HERO
                ===================================== */}

                <div className="bg-gradient-to-r from-red-800 to-red-400 text-white py-20">

                    <div className="max-w-7xl mx-auto px-6 text-center">

                        <FaTint className="text-6xl mx-auto mb-5" />

                        <h1 className="text-5xl font-bold mb-4">
                            Blood Donation Campaigns
                        </h1>

                        <p className="max-w-3xl mx-auto text-lg">
                            Participate in blood donation
                            campaigns and become someone's
                            hero. Together we can build a
                            healthier community by ensuring
                            blood is available whenever it
                            is needed.
                        </p>

                        <button
                            onClick={() =>
                                document
                                    .getElementById(
                                        "campaigns"
                                    )
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    })
                            }
                            className="mt-8 bg-white text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
                        >
                            Join a Campaign
                        </button>

                    </div>

                </div>

                {/* =====================================
                    STATISTICS
                ===================================== */}

                <div className="max-w-7xl mx-auto px-6 py-14">

                    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

                        {/* Active Campaigns */}

                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                            <h2 className="text-4xl font-bold text-red-600">
                                {
                                    upcomingCampaigns.length
                                }
                            </h2>

                            <p className="text-gray-600 mt-2">
                                Active Campaigns
                            </p>

                        </div>

                        {/* Registered Donors */}

                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                            <h2 className="text-4xl font-bold text-red-600">
                                {totalRegisteredDonors}
                            </h2>

                            <p className="text-gray-600 mt-2">
                                Registered Donors
                            </p>

                        </div>

                        {/* Partner Hospitals */}

                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                            <h2 className="text-4xl font-bold text-red-600">
                                120+
                            </h2>

                            <p className="text-gray-600 mt-2">
                                Partner Hospitals
                            </p>

                        </div>

                        {/* Lives Saved */}

                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                            <h2 className="text-4xl font-bold text-red-600">
                                6500+
                            </h2>

                            <p className="text-gray-600 mt-2">
                                Lives Saved
                            </p>

                        </div>

                    </div>

                    {/* =================================
                        CAMPAIGNS
                    ================================= */}

                    <div
                        id="campaigns"
                        className="mt-16"
                    >

                        <h2 className="text-3xl font-bold text-center text-red-600 mb-10">
                            Upcoming Campaigns
                        </h2>

                        {/* Loading */}

                        {loading && (
                            <div className="bg-white rounded-xl shadow p-10 text-center">

                                <FaSyncAlt className="animate-spin text-red-600 text-3xl mx-auto" />

                                <p className="text-gray-500 mt-3">
                                    Loading campaigns...
                                </p>

                            </div>
                        )}

                        {/* Error */}

                        {!loading && error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">

                                <p className="text-red-600">
                                    {error}
                                </p>

                                <button
                                    onClick={fetchCampaigns}
                                    className="mt-4 bg-red-600 text-white px-5 py-2 rounded-lg"
                                >
                                    Try Again
                                </button>

                            </div>
                        )}

                        {/* No campaigns */}

                        {!loading &&
                            !error &&
                            upcomingCampaigns.length ===
                            0 && (
                                <div className="bg-white rounded-xl shadow p-10 text-center">

                                    <FaTint className="text-gray-300 text-5xl mx-auto" />

                                    <p className="text-gray-500 mt-4">
                                        No upcoming campaigns
                                        available.
                                    </p>

                                </div>
                            )}

                        {/* Campaign Cards */}

                        {!loading &&
                            !error &&
                            upcomingCampaigns.length >
                            0 && (
                                <div className="grid lg:grid-cols-2 gap-8">

                                    {upcomingCampaigns.map(
                                        (campaign) => (

                                            <div
                                                key={
                                                    campaign.id
                                                }
                                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition duration-300"
                                            >

                                                {/* Header */}

                                                <div className="bg-red-800 text-white p-6">

                                                    <div className="flex justify-between gap-4">

                                                        <h2 className="text-2xl font-bold">
                                                            {
                                                                campaign.title
                                                            }
                                                        </h2>

                                                        <span className="px-3 py-1 rounded-full text-sm bg-green-500 h-fit whitespace-nowrap">
                                                            {
                                                                campaign.status
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                                {/* Details */}

                                                <div className="p-6 space-y-4">

                                                    {/* Location */}

                                                    <div className="flex items-center gap-3">

                                                        <FaMapMarkerAlt className="text-red-600" />

                                                        <div>

                                                            <p className="text-xs text-gray-400">
                                                                Venue
                                                            </p>

                                                            <p className="font-medium">
                                                                {
                                                                    campaign.venue ||
                                                                    campaign.location
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                    {/* Address */}

                                                    {campaign.address && (
                                                        <div className="flex items-center gap-3">

                                                            <FaMapMarkerAlt className="text-red-600" />

                                                            <p className="text-gray-600">
                                                                {
                                                                    campaign.address
                                                                }
                                                            </p>

                                                        </div>
                                                    )}

                                                    {/* Date */}

                                                    <div className="flex items-center gap-3">

                                                        <FaCalendarAlt className="text-red-600" />

                                                        <p>
                                                            {
                                                                campaign.date
                                                            }
                                                        </p>

                                                    </div>

                                                    {/* Time */}

                                                    <div className="flex items-center gap-3">

                                                        <FaCalendarAlt className="text-red-600" />

                                                        <p>
                                                            Time:{" "}
                                                            {campaign.startTime
                                                                ? `${campaign.startTime} - ${campaign.endTime}`
                                                                : campaign.time}
                                                        </p>

                                                    </div>

                                                    {/* Target */}

                                                    <div className="flex items-center gap-3">

                                                        <FaUsers className="text-red-600" />

                                                        <p>
                                                            Target:{" "}
                                                            {
                                                                campaign.targetDonors ||
                                                                campaign.target
                                                            }{" "}
                                                            Donors
                                                        </p>

                                                    </div>

                                                    {/* Registered */}

                                                    {campaign.registeredDonors !==
                                                        undefined && (
                                                            <div className="bg-red-50 rounded-lg p-4">

                                                                <div className="flex justify-between">

                                                                    <span className="text-gray-600">
                                                                        Registered
                                                                        Donors
                                                                    </span>

                                                                    <span className="font-bold text-red-600">
                                                                        {
                                                                            campaign.registeredDonors
                                                                        }{" "}
                                                                        /{" "}
                                                                        {
                                                                            campaign.targetDonors
                                                                        }
                                                                    </span>

                                                                </div>

                                                                {/* Progress */}

                                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">

                                                                    <div
                                                                        className="bg-red-600 h-2 rounded-full"
                                                                        style={{
                                                                            width: `${Math.min(
                                                                                100,
                                                                                (Number(
                                                                                    campaign.registeredDonors
                                                                                ) /
                                                                                    Number(
                                                                                        campaign.targetDonors ||
                                                                                        1
                                                                                    )) *
                                                                                100
                                                                            )}%`,
                                                                        }}
                                                                    />

                                                                </div>

                                                            </div>
                                                        )}

                                                    {/* Blood Groups */}

                                                    {campaign.bloodGroups &&
                                                        campaign
                                                            .bloodGroups
                                                            .length >
                                                        0 && (
                                                            <div>

                                                                <p className="text-sm font-semibold text-gray-600 mb-2">
                                                                    Required Blood
                                                                    Groups
                                                                </p>

                                                                <div className="flex flex-wrap gap-2">

                                                                    {campaign.bloodGroups.map(
                                                                        (
                                                                            group
                                                                        ) => (

                                                                            <span
                                                                                key={
                                                                                    group
                                                                                }
                                                                                className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold"
                                                                            >
                                                                                {
                                                                                    group
                                                                                }
                                                                            </span>

                                                                        )
                                                                    )}

                                                                </div>

                                                            </div>
                                                        )}

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>
                            )}

                    </div>

                    {/* =================================
                        WHY JOIN
                    ================================= */}

                    <div className="mt-20">

                        <h2 className="text-3xl font-bold text-center text-red-600 mb-10">
                            Why Participate?
                        </h2>

                        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                                <FaHeart className="text-red-600 text-5xl mx-auto mb-4" />

                                <h3 className="font-bold text-xl">
                                    Save Lives
                                </h3>

                                <p className="text-gray-600 mt-3">
                                    One blood donation can
                                    save up to three lives.
                                </p>

                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                                <FaTint className="text-red-600 text-5xl mx-auto mb-4" />

                                <h3 className="font-bold text-xl">
                                    Free Health Check
                                </h3>

                                <p className="text-gray-600 mt-3">
                                    Get a free health
                                    screening before
                                    donating.
                                </p>

                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                                <FaUsers className="text-red-600 text-5xl mx-auto mb-4" />

                                <h3 className="font-bold text-xl">
                                    Community Service
                                </h3>

                                <p className="text-gray-600 mt-3">
                                    Support hospitals and
                                    people in need.
                                </p>

                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">

                                <FaCalendarAlt className="text-red-600 text-5xl mx-auto mb-4" />

                                <h3 className="font-bold text-xl">
                                    Regular Events
                                </h3>

                                <p className="text-gray-600 mt-3">
                                    Participate in donation
                                    camps throughout the
                                    year.
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* =================================
                        CTA
                    ================================= */}

                    <div className="bg-red-800 text-white rounded-3xl mt-20 p-14 text-center">

                        <h2 className="text-4xl font-bold">
                            Be Someone's Lifeline
                        </h2>

                        <p className="mt-5 max-w-3xl mx-auto text-lg">
                            Your blood donation can give
                            hope to patients fighting for
                            their lives. Join our next
                            campaign and become a real-life
                            hero.
                        </p>

                        <button
                            onClick={() =>
                                document
                                    .getElementById(
                                        "campaigns"
                                    )
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    })
                            }
                            className="mt-8 bg-white text-red-600 px-10 py-3 rounded-xl font-bold hover:bg-gray-100"
                        >
                            Become a Donor
                        </button>

                    </div>

                </div>

            </div>
        </>
    );
}

export default Campaigns;