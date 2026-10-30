import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    FaSearch,
    FaUser,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaEye,
    FaCheck,
    FaBan,
    FaTrash,
    FaEdit,
    FaTint,
    FaTimes,
} from "react-icons/fa";
import AdminPanel from "../../components/AdminPanel";

function DonorManagementADm() {
    const [donors, setDonors] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL =
        "https://blood-donation-backend-olwl.onrender.com/api/donors";

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            setDonors(response.data);
        } catch (error) {
            console.log("Error fetching donors:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDonors = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return donors.filter((donor) =>
            donor.fullName?.toLowerCase().includes(searchValue) ||
            donor.email?.toLowerCase().includes(searchValue) ||
            donor.bloodGroup?.toLowerCase().includes(searchValue) ||
            donor.phone?.toLowerCase().includes(searchValue) ||
            donor.city?.toLowerCase().includes(searchValue) ||
            donor.district?.toLowerCase().includes(searchValue)
        );
    }, [donors, search]);


    const totalDonors = donors.length;

    const approvedCount = donors.filter(
        (donor) => donor.status === "Approved"
    ).length;

    const pendingCount = donors.filter(
        (donor) => donor.status === "Pending"
    ).length;

    const blockedCount = donors.filter(
        (donor) => donor.status === "Blocked"
    ).length;

    const eligibleCount = donors.filter(
        (donor) => donor.eligibility === "Eligible"
    ).length;


    const updateStatus = async (id, status) => {
        try {
            const donor = donors.find((item) => item.id === id);

            if (!donor) return;

            await axios.put(`${API_URL}/${id}`, {
                ...donor,
                status,
            });

            fetchDonors();


            if (selectedDonor?.id === id) {
                setSelectedDonor({
                    ...donor,
                    status,
                });
            }
        } catch (error) {
            console.log("Error updating donor status:", error);
        }
    };


    const deleteDonor = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this donor?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`${API_URL}/${id}`);

            fetchDonors();

            if (selectedDonor?.id === id) {
                setSelectedDonor(null);
            }
        } catch (error) {
            console.log("Error deleting donor:", error);
        }
    };


    const viewDonor = (donor) => {
        setSelectedDonor(donor);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <div className="min-h-screen bg-gray-100 p-8 flex-1">

                <div className="flex flex-col md:flex-row justify-between items-center mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Donor Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage all registered blood donors.
                        </p>
                    </div>

                    <div className="flex items-center bg-white rounded-lg shadow px-4 py-3 mt-4 md:mt-0 w-full md:w-80">

                        <FaSearch className="text-gray-500" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search donor..."
                            className="ml-2 outline-none w-full"
                        />

                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
                        <h2 className="text-gray-500">
                            Total Donors
                        </h2>

                        <p className="text-4xl font-bold text-red-600 mt-2">
                            {totalDonors}
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

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
                        <h2 className="text-gray-500">
                            Eligible
                        </h2>

                        <p className="text-4xl font-bold text-blue-600 mt-2">
                            {eligibleCount}
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
                        <div className="bg-white rounded-xl p-10 text-center">
                            <p className="text-gray-500">
                                Loading donors...
                            </p>
                        </div>
                    ) : filteredDonors.length === 0 ? (
                        <div className="bg-white rounded-xl p-10 text-center">
                            <FaUser className="mx-auto text-gray-300 text-5xl mb-3" />

                            <p className="text-gray-500">
                                No donors found.
                            </p>
                        </div>
                    ) : (
                        filteredDonors.map((donor) => (

                            <div
                                key={donor.id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5"
                            >

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                    <div className="flex items-center gap-4">

                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                            <FaUser className="text-red-600 text-2xl" />
                                        </div>

                                        <div>

                                            <h2 className="text-lg font-bold text-gray-800">
                                                {donor.fullName || "Unknown Donor"}
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                Donor ID: {donor.id}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {donor.email}
                                            </p>

                                            <div className="flex flex-wrap gap-3 mt-2 text-sm">

                                                <span className="flex items-center gap-1">
                                                    <FaPhoneAlt className="text-red-600" />
                                                    {donor.phone || "N/A"}
                                                </span>

                                                <span className="flex items-center gap-1">
                                                    <FaMapMarkerAlt className="text-red-600" />
                                                    {donor.city ||
                                                        donor.district ||
                                                        "N/A"}
                                                </span>

                                                <span className="flex items-center gap-1">
                                                    <FaCalendarAlt className="text-red-600" />
                                                    Last Donation:{" "}
                                                    {donor.lastDonation ||
                                                        "Never"}
                                                </span>

                                            </div>

                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">

                                        <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">
                                            <FaTint className="inline mr-1" />
                                            {donor.bloodGroup || "N/A"}
                                        </span>

                                        <span
                                            className={`px-4 py-2 rounded-full font-semibold ${donor.eligibility ===
                                                "Eligible"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {donor.eligibility ||
                                                "Not Checked"}
                                        </span>

                                        <span
                                            className={`px-4 py-2 rounded-full font-semibold ${donor.status ===
                                                "Approved"
                                                ? "bg-green-100 text-green-700"
                                                : donor.status ===
                                                    "Pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {donor.status || "Pending"}
                                        </span>

                                    </div>

                                    <div className="flex justify-end w-full lg:w-auto">

                                        <div className="flex items-center gap-2">

                                            {/* View */}
                                            <button
                                                onClick={() =>
                                                    viewDonor(donor)
                                                }
                                                title="View Profile"
                                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                            >
                                                <FaEye />
                                            </button>

                                            {donor.status === "Pending" && (
                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            donor.id,
                                                            "Approved"
                                                        )
                                                    }
                                                    title="Approve Donor"
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}

                                            {donor.status !== "Blocked" && (
                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            donor.id,
                                                            "Blocked"
                                                        )
                                                    }
                                                    title="Block Donor"
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white transition"
                                                >
                                                    <FaBan />
                                                </button>
                                            )}

                                            {donor.status === "Blocked" && (
                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            donor.id,
                                                            "Approved"
                                                        )
                                                    }
                                                    title="Unblock Donor"
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}

                                            <button
                                                onClick={() =>
                                                    deleteDonor(donor.id)
                                                }
                                                title="Delete Donor"
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

            {selectedDonor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center p-6 border-b">

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Donor Profile
                                </h2>

                                <p className="text-gray-500 text-sm">
                                    Donor ID: {selectedDonor.id}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedDonor(null)
                                }
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div className="p-6">

                            <div className="flex items-center gap-4 mb-6">

                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                    <FaUser className="text-red-600 text-3xl" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {selectedDonor.fullName}
                                    </h3>

                                    <p className="text-gray-500">
                                        {selectedDonor.email}
                                    </p>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <ProfileItem
                                    label="Phone"
                                    value={selectedDonor.phone}
                                />

                                <ProfileItem
                                    label="Blood Group"
                                    value={selectedDonor.bloodGroup}
                                />

                                <ProfileItem
                                    label="Gender"
                                    value={selectedDonor.gender}
                                />

                                <ProfileItem
                                    label="Date of Birth"
                                    value={selectedDonor.dob}
                                />

                                <ProfileItem
                                    label="Weight"
                                    value={selectedDonor.weight}
                                />

                                <ProfileItem
                                    label="Last Donation"
                                    value={
                                        selectedDonor.lastDonation ||
                                        "Never"
                                    }
                                />

                                <ProfileItem
                                    label="City"
                                    value={selectedDonor.city}
                                />

                                <ProfileItem
                                    label="District"
                                    value={selectedDonor.district}
                                />

                                <ProfileItem
                                    label="State"
                                    value={selectedDonor.state}
                                />

                                <ProfileItem
                                    label="Pincode"
                                    value={selectedDonor.pincode}
                                />

                                <ProfileItem
                                    label="Eligibility"
                                    value={
                                        selectedDonor.eligibility ||
                                        "Not Checked"
                                    }
                                />

                                <ProfileItem
                                    label="Availability"
                                    value={
                                        selectedDonor.availability ||
                                        "Not Available"
                                    }
                                />

                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">

                                <p className="text-sm text-gray-500 mb-2">
                                    Account Status
                                </p>

                                <span
                                    className={`px-4 py-2 rounded-full font-semibold ${selectedDonor.status ===
                                        "Approved"
                                        ? "bg-green-100 text-green-700"
                                        : selectedDonor.status ===
                                            "Pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {selectedDonor.status ||
                                        "Pending"}
                                </span>

                            </div>

                            <div className="flex flex-wrap gap-3 mt-6">

                                {selectedDonor.status ===
                                    "Pending" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedDonor.id,
                                                    "Approved"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            <FaCheck />
                                            Approve
                                        </button>
                                    )}

                                {selectedDonor.status !==
                                    "Blocked" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedDonor.id,
                                                    "Blocked"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600"
                                        >
                                            <FaBan />
                                            Block
                                        </button>
                                    )}

                                {selectedDonor.status ===
                                    "Blocked" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedDonor.id,
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
                                        deleteDonor(
                                            selectedDonor.id
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

export default DonorManagementADm;