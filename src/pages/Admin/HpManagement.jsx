import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    FaSearch,
    FaHospital,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaEye,
    FaTrash,
    FaCheck,
    FaTimes,
    FaBuilding,
    FaBan,
    FaEnvelope,
    FaTimesCircle,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";

const API_URL =
    "https://blood-donation-backend-olwl.onrender.com/hospitals";

function HospitalManagementADm() {
    const [hospitals, setHospitals] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            setHospitals(response.data);
        } catch (error) {
            console.log("Error fetching hospitals:", error);
        } finally {
            setLoading(false);
        }
    };


    const filteredHospitals = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return hospitals.filter(
            (hospital) =>
                hospital.hospitalName
                    ?.toLowerCase()
                    .includes(searchValue) ||
                hospital.email
                    ?.toLowerCase()
                    .includes(searchValue) ||
                hospital.phone
                    ?.toLowerCase()
                    .includes(searchValue) ||
                hospital.hospitalType
                    ?.toLowerCase()
                    .includes(searchValue) ||
                hospital.city
                    ?.toLowerCase()
                    .includes(searchValue) ||
                hospital.district
                    ?.toLowerCase()
                    .includes(searchValue) ||
                hospital.registrationNumber
                    ?.toLowerCase()
                    .includes(searchValue)
        );
    }, [hospitals, search]);


    const totalHospitals = hospitals.length;

    const approvedCount = hospitals.filter(
        (hospital) => hospital.status === "Approved"
    ).length;

    const pendingCount = hospitals.filter(
        (hospital) => hospital.status === "Pending"
    ).length;

    const rejectedCount = hospitals.filter(
        (hospital) => hospital.status === "Rejected"
    ).length;

    const blockedCount = hospitals.filter(
        (hospital) => hospital.status === "Blocked"
    ).length;


    const updateStatus = async (id, status) => {
        try {
            const hospital = hospitals.find(
                (item) => item.id === id
            );

            if (!hospital) return;

            await axios.put(`${API_URL}/${id}`, {
                ...hospital,
                status,
            });

            fetchHospitals();

            if (selectedHospital?.id === id) {
                setSelectedHospital({
                    ...hospital,
                    status,
                });
            }
        } catch (error) {
            console.log("Error updating hospital:", error);
        }
    };


    const deleteHospital = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this hospital?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`${API_URL}/${id}`);

            fetchHospitals();

            if (selectedHospital?.id === id) {
                setSelectedHospital(null);
            }
        } catch (error) {
            console.log("Error deleting hospital:", error);
        }
    };


    const viewHospital = (hospital) => {
        setSelectedHospital(hospital);
    };


    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-700";

            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            case "Rejected":
                return "bg-red-100 text-red-700";

            case "Blocked":
                return "bg-gray-200 text-gray-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <div className="min-h-screen bg-gray-100 p-8 flex-1">


                <div className="flex flex-col md:flex-row justify-between items-center mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Hospital Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage registered hospitals and
                            registration requests.
                        </p>
                    </div>



                    <div className="flex items-center bg-white shadow rounded-lg px-4 py-3 mt-4 md:mt-0 w-full md:w-80">

                        <FaSearch className="text-gray-500" />

                        <input
                            type="text"
                            placeholder="Search hospital..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="ml-2 outline-none w-full"
                        />

                    </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">



                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">

                        <h2 className="text-gray-500">
                            Total Hospitals
                        </h2>

                        <p className="text-4xl font-bold text-red-600 mt-2">
                            {totalHospitals}
                        </p>

                    </div>


                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">

                        <h2 className="text-gray-500">
                            Approved
                        </h2>

                        <p className="text-4xl font-bold text-green-600 mt-2">
                            {approvedCount}
                        </p>

                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">

                        <h2 className="text-gray-500">
                            Pending
                        </h2>

                        <p className="text-4xl font-bold text-yellow-600 mt-2">
                            {pendingCount}
                        </p>

                    </div>


                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">

                        <h2 className="text-gray-500">
                            Rejected
                        </h2>

                        <p className="text-4xl font-bold text-red-500 mt-2">
                            {rejectedCount}
                        </p>

                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-600">

                        <h2 className="text-gray-500">
                            Blocked
                        </h2>

                        <p className="text-4xl font-bold text-gray-600 mt-2">
                            {blockedCount}
                        </p>

                    </div>

                </div>


                <div className="space-y-4">

                    {loading ? (

                        <div className="bg-white rounded-xl shadow p-10 text-center">

                            <p className="text-gray-500">
                                Loading hospitals...
                            </p>

                        </div>

                    ) : filteredHospitals.length === 0 ? (

                        <div className="bg-white rounded-xl shadow p-10 text-center">

                            <FaHospital className="mx-auto text-gray-300 text-5xl mb-3" />

                            <p className="text-gray-500">
                                No hospitals found.
                            </p>

                        </div>

                    ) : (

                        filteredHospitals.map((hospital) => (

                            <div
                                key={hospital.id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5"
                            >

                                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">



                                    <div className="flex items-center gap-4 flex-1">

                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shrink-0">

                                            <FaHospital className="text-red-600 text-2xl" />

                                        </div>

                                        <div>

                                            <h2 className="text-lg font-bold text-gray-800">

                                                {hospital.hospitalName ||
                                                    "Unknown Hospital"}

                                            </h2>

                                            <p className="text-sm text-gray-500">

                                                Hospital ID:{" "}
                                                {hospital.id}

                                            </p>

                                            <p className="text-sm text-gray-500">

                                                {hospital.email ||
                                                    "No email"}

                                            </p>

                                            <div className="flex flex-wrap gap-3 mt-2 text-sm">

                                                <span className="flex items-center gap-1">

                                                    <FaPhoneAlt className="text-red-600" />

                                                    {hospital.phone ||
                                                        "N/A"}

                                                </span>

                                                <span className="flex items-center gap-1">

                                                    <FaMapMarkerAlt className="text-red-600" />

                                                    {hospital.city ||
                                                        hospital.district ||
                                                        "N/A"}

                                                </span>

                                            </div>

                                        </div>

                                    </div>



                                    <div className="flex flex-wrap gap-3">

                                        <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">

                                            <FaBuilding className="inline mr-1" />

                                            {hospital.hospitalType ||
                                                "Hospital"}

                                        </span>

                                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">

                                            License:{" "}
                                            {hospital.registrationNumber ||
                                                "N/A"}

                                        </span>

                                        <span
                                            className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                                                hospital.status
                                            )}`}
                                        >

                                            {hospital.status ||
                                                "Pending"}

                                        </span>

                                    </div>



                                    <div className="flex justify-end w-full xl:w-auto">

                                        <div className="flex items-center gap-2">


                                            <button
                                                onClick={() =>
                                                    viewHospital(
                                                        hospital
                                                    )
                                                }
                                                title="View Profile"
                                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                            >
                                                <FaEye />
                                            </button>



                                            {hospital.status ===
                                                "Pending" && (

                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                hospital.id,
                                                                "Approved"
                                                            )
                                                        }
                                                        title="Approve Hospital"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                                    >
                                                        <FaCheck />
                                                    </button>

                                                )}



                                            {hospital.status ===
                                                "Pending" && (

                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                hospital.id,
                                                                "Rejected"
                                                            )
                                                        }
                                                        title="Reject Hospital"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                                                    >
                                                        <FaTimes />
                                                    </button>

                                                )}



                                            {hospital.status !==
                                                "Blocked" &&
                                                hospital.status ===
                                                "Approved" && (

                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                hospital.id,
                                                                "Blocked"
                                                            )
                                                        }
                                                        title="Block Hospital"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white transition"
                                                    >
                                                        <FaBan />
                                                    </button>

                                                )}



                                            {hospital.status ===
                                                "Blocked" && (

                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                hospital.id,
                                                                "Approved"
                                                            )
                                                        }
                                                        title="Unblock Hospital"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                                    >
                                                        <FaCheck />
                                                    </button>

                                                )}



                                            <button
                                                onClick={() =>
                                                    deleteHospital(
                                                        hospital.id
                                                    )
                                                }
                                                title="Delete Hospital"
                                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                                            >
                                                <FaTrash />
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>



            {selectedHospital && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">


                        <div className="flex justify-between items-center p-6 border-b">

                            <div>

                                <h2 className="text-2xl font-bold text-gray-800">
                                    Hospital Profile
                                </h2>

                                <p className="text-gray-500 text-sm">
                                    Hospital ID:{" "}
                                    {selectedHospital.id}
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedHospital(null)
                                }
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600"
                            >
                                <FaTimesCircle />
                            </button>

                        </div>


                        <div className="p-6">

                            <div className="flex items-center gap-4 mb-6">

                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">

                                    <FaHospital className="text-red-600 text-3xl" />

                                </div>

                                <div>

                                    <h3 className="text-2xl font-bold text-gray-800">

                                        {selectedHospital.hospitalName}

                                    </h3>

                                    <p className="text-gray-500">

                                        {selectedHospital.email ||
                                            "No email"}

                                    </p>

                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <ProfileItem
                                    label="Hospital Name"
                                    value={
                                        selectedHospital.hospitalName
                                    }
                                />

                                <ProfileItem
                                    label="Hospital Type"
                                    value={
                                        selectedHospital.hospitalType
                                    }
                                />

                                <ProfileItem
                                    label="Phone"
                                    value={
                                        selectedHospital.phone
                                    }
                                />

                                <ProfileItem
                                    label="Email"
                                    value={
                                        selectedHospital.email
                                    }
                                />

                                <ProfileItem
                                    label="Registration / License Number"
                                    value={
                                        selectedHospital.registrationNumber
                                    }
                                />

                                <ProfileItem
                                    label="City"
                                    value={
                                        selectedHospital.city
                                    }
                                />

                                <ProfileItem
                                    label="District"
                                    value={
                                        selectedHospital.district
                                    }
                                />

                                <ProfileItem
                                    label="State"
                                    value={
                                        selectedHospital.state
                                    }
                                />

                                <ProfileItem
                                    label="Pincode"
                                    value={
                                        selectedHospital.pincode
                                    }
                                />

                            </div>

                            <div className="mt-4">

                                <ProfileItem
                                    label="Address"
                                    value={
                                        selectedHospital.address
                                    }
                                />

                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">

                                <p className="text-sm text-gray-500 mb-2">
                                    Registration Status
                                </p>

                                <span
                                    className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                                        selectedHospital.status
                                    )}`}
                                >

                                    {selectedHospital.status ||
                                        "Pending"}

                                </span>

                            </div>

                            <div className="flex flex-wrap gap-3 mt-6">

                                {/* APPROVE */}

                                {selectedHospital.status ===
                                    "Pending" && (

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedHospital.id,
                                                    "Approved"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            <FaCheck />
                                            Approve
                                        </button>

                                    )}


                                {selectedHospital.status ===
                                    "Pending" && (

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedHospital.id,
                                                    "Rejected"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                                        >
                                            <FaTimes />
                                            Reject
                                        </button>

                                    )}

                                {selectedHospital.status ===
                                    "Approved" && (

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedHospital.id,
                                                    "Blocked"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600"
                                        >
                                            <FaBan />
                                            Block
                                        </button>

                                    )}


                                {selectedHospital.status ===
                                    "Blocked" && (

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedHospital.id,
                                                    "Approved"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            <FaCheck />
                                            Unblock
                                        </button>

                                    )}


                                <button
                                    onClick={() =>
                                        deleteHospital(
                                            selectedHospital.id
                                        )
                                    }
                                    className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                                >
                                    <FaTrash />
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


function ProfileItem({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4">

            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="font-semibold text-gray-800 mt-1">
                {value || "N/A"}
            </p>

        </div>
    );
}

export default HospitalManagementADm;