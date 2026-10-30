import Navbar from "../components/Navbar";
import {
    FaAmbulance,
    FaTint,
    FaHospital,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaClock,
    FaHeartbeat,
    FaArrowRight,
    FaSearch,
    FaBell,
    FaUsers,
    FaProcedures,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Emergency() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const emergencyRequests = [
        {
            id: "ER001",
            hospital: "Government Medical College",
            bloodGroup: "O-",
            units: 3,
            location: "Kochi",
            contact: "+91 9876543210",
            time: "Needed within 1 Hour",
            priority: "Critical",
        },
        {
            id: "ER002",
            hospital: "City Hospital",
            bloodGroup: "A+",
            units: 2,
            location: "Thrissur",
            contact: "+91 9876500000",
            time: "Needed within 2 Hours",
            priority: "High",
        },
        {
            id: "ER003",
            hospital: "Medical College",
            bloodGroup: "B-",
            units: 4,
            location: "Calicut",
            contact: "+91 9898989898",
            time: "Needed Today",
            priority: "Medium",
        },
        {
            id: "ER004",
            hospital: "Aster Medcity",
            bloodGroup: "AB+",
            units: 2,
            location: "Ernakulam",
            contact: "+91 9876123456",
            time: "Needed Today",
            priority: "High",
        },
    ];

    const handleDonate = (request) => {
        navigate("/login", {
            state: {
                requestId: request.id,
                hospital: request.hospital,
                bloodGroup: request.bloodGroup,
                units: request.units,
                location: request.location,
            },
        });
    };

    const filteredRequests = emergencyRequests.filter(
        (request) =>
            request.hospital.toLowerCase().includes(search.toLowerCase()) ||
            request.location.toLowerCase().includes(search.toLowerCase()) ||
            request.bloodGroup.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">

                {/* Hero Section */}

                <div className="bg-gradient-to-r from-red-800 via-red-600 to-red-400 text-white">

                    <div className="max-w-7xl mx-auto px-6 py-20">

                        <div className="grid lg:grid-cols-2 gap-12 items-center">

                            <div>

                                <span className="inline-flex items-center gap-2 bg-red-800 px-4 py-2 rounded-full animate-pulse">
                                    <FaBell />
                                    Live Emergency Alerts
                                </span>

                                <h1 className="text-5xl lg:text-6xl font-extrabold mt-6 leading-tight">
                                    Donate Blood,
                                    <br />
                                    Save Lives
                                </h1>

                                <p className="mt-6 text-lg text-red-100 leading-8">
                                    Respond instantly to emergency blood requests
                                    from nearby hospitals and become someone's
                                    real-life hero.
                                </p>



                            </div>

                            <div className="flex justify-center">

                                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl">

                                    <FaAmbulance className="text-9xl text-white mx-auto " />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Statistics */}

                <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">

                    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

                        <div className="bg-white rounded-2xl shadow-xl p-6 hover:-translate-y-2 transition">
                            <FaTint className="text-5xl text-red-600 mb-4" />
                            <h2 className="text-4xl font-bold text-red-600">
                                18
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Active Requests
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6 hover:-translate-y-2 transition">
                            <FaHeartbeat className="text-5xl text-orange-500 mb-4" />
                            <h2 className="text-4xl font-bold text-orange-500">
                                5
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Critical Cases
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6 hover:-translate-y-2 transition">
                            <FaHospital className="text-5xl text-blue-600 mb-4" />
                            <h2 className="text-4xl font-bold text-blue-600">
                                12
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Hospitals
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6 hover:-translate-y-2 transition">
                            <FaUsers className="text-5xl text-green-600 mb-4" />
                            <h2 className="text-4xl font-bold text-green-600">
                                150+
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Lives Saved
                            </p>
                        </div>

                    </div>

                </div>

                {/* Search */}

                <div className="max-w-7xl mx-auto px-6 mt-14">

                    <div className="relative">

                        <FaSearch className="absolute left-5 top-5 text-gray-400" />

                        <input
                            type="text"
                            placeholder="Search hospital, location or blood group..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border rounded-2xl pl-14 pr-5 py-4 shadow-md focus:ring-2 focus:ring-red-500 outline-none"
                        />

                    </div>

                </div>

                {/* Emergency Requests */}

                <div className="max-w-7xl mx-auto px-6 py-14">

                    <h2 className="text-4xl font-bold text-center text-red-600 mb-12">
                        Active Emergency Requests
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-8">

                        {filteredRequests.map((request) => (

                            <div
                                key={request.id}
                                className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-red-200 hover:-translate-y-2 transition duration-300"
                            >

                                <div className="bg-gradient-to-r from-red-800 to-red-600 text-white p-6 flex justify-between items-center">

                                    <div>

                                        <h3 className="text-2xl font-bold">
                                            {request.hospital}
                                        </h3>

                                        <p className="text-red-100">
                                            Request ID : {request.id}
                                        </p>

                                    </div>

                                    <span className={`px-4 py-2 rounded-full font-semibold ${request.priority === "Critical"
                                        ? "bg-yellow-400 text-black animate-pulse"
                                        : request.priority === "High"
                                            ? "bg-orange-400 text-white"
                                            : "bg-blue-400 text-white"
                                        }`}>
                                        {request.priority}
                                    </span>

                                </div>

                                <div className="p-8 space-y-5">

                                    <div className="grid grid-cols-2 gap-5">

                                        <div className="bg-red-50 rounded-xl p-4">
                                            <FaTint className="text-red-600 text-2xl mb-2" />
                                            <p className="text-gray-500 text-sm">
                                                Blood Group
                                            </p>
                                            <h4 className="text-2xl font-bold">
                                                {request.bloodGroup}
                                            </h4>
                                        </div>

                                        <div className="bg-pink-50 rounded-xl p-4">
                                            <FaProcedures className="text-pink-600 text-2xl mb-2" />
                                            <p className="text-gray-500 text-sm">
                                                Units Required
                                            </p>
                                            <h4 className="text-2xl font-bold">
                                                {request.units}
                                            </h4>
                                        </div>

                                    </div>

                                    <div className="space-y-3">

                                        <div className="flex items-center gap-3">
                                            <FaMapMarkerAlt className="text-red-600" />
                                            {request.location}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <FaPhoneAlt className="text-red-600" />
                                            {request.contact}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <FaClock className="text-red-600" />
                                            {request.time}
                                        </div>

                                    </div>

                                    <button
                                        onClick={() => handleDonate(request)}
                                        className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-3 transition"
                                    >
                                        Donate Now
                                        <FaArrowRight />
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>
                </div>
                {/* Blood Requirement Section */}

                <div className="max-w-7xl mx-auto px-6 pb-16">

                    <div className="bg-white rounded-3xl shadow-xl p-10">

                        <h2 className="text-4xl font-bold text-center text-red-600 mb-10">
                            Blood Group Requirement
                        </h2>

                        <div className="grid md:grid-cols-4 gap-6">

                            {[
                                { group: "O-", value: "95%", color: "bg-red-600" },
                                { group: "A+", value: "75%", color: "bg-orange-500" },
                                { group: "B-", value: "60%", color: "bg-blue-500" },
                                { group: "AB+", value: "40%", color: "bg-green-500" },
                            ].map((item) => (

                                <div
                                    key={item.group}
                                    className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-lg transition"
                                >

                                    <h3 className="text-2xl font-bold text-center">
                                        {item.group}
                                    </h3>

                                    <div className="w-full bg-gray-200 rounded-full h-4 mt-5">

                                        <div
                                            className={`${item.color} h-4 rounded-full`}
                                            style={{ width: item.value }}
                                        ></div>

                                    </div>

                                    <p className="text-center mt-3 font-semibold">
                                        {item.value} Required
                                    </p>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

                {/* Guidelines */}

                <div className="max-w-7xl mx-auto px-6 pb-16">

                    <h2 className="text-4xl font-bold text-center text-red-600 mb-12">
                        Emergency Donation Guidelines
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:-translate-y-2 transition">

                            <FaHeartbeat className="text-6xl text-red-600 mx-auto mb-5" />

                            <h3 className="text-2xl font-bold mb-3">
                                Stay Healthy
                            </h3>

                            <p className="text-gray-600 leading-7">
                                Ensure you are healthy, hydrated and have eaten
                                before donating blood.
                            </p>

                        </div>

                        <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:-translate-y-2 transition">

                            <FaHospital className="text-6xl text-blue-600 mx-auto mb-5" />

                            <h3 className="text-2xl font-bold mb-3">
                                Reach Hospital
                            </h3>

                            <p className="text-gray-600 leading-7">
                                Carry a valid ID card and report to the blood
                                bank reception immediately.
                            </p>

                        </div>

                        <div className="bg-white rounded-3xl shadow-xl p-8 text-center hover:-translate-y-2 transition">

                            <FaTint className="text-6xl text-pink-600 mx-auto mb-5" />

                            <h3 className="text-2xl font-bold mb-3">
                                Save Lives
                            </h3>

                            <p className="text-gray-600 leading-7">
                                One blood donation can save up to three lives.
                                Your contribution truly matters.
                            </p>

                        </div>

                    </div>

                </div>



                <div className="max-w-7xl mx-auto px-6 pb-20">

                    <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">

                        <FaHeartbeat className="text-7xl text-red-600 mx-auto animate-pulse mb-6" />

                        <h2 className="text-5xl font-bold text-gray-800">
                            Become an Emergency Donor
                        </h2>

                        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-8">
                            Register today and receive instant emergency blood
                            request notifications from hospitals near your
                            location. Your quick response could save someone's
                            life.
                        </p>

                        <button
                            onClick={() => navigate("/register/donor")}
                            className="mt-10 bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-xl text-lg font-bold shadow-lg transition"
                        >
                            Register as Donor
                        </button>

                    </div>

                </div>

            </div>

        </>
    );
}

export default Emergency;