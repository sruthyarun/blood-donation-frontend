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
    "https://blood-donation-backend-olwl.onrender.com/bloodBanks";

function BBManagementADm() {
    const [bbanks, setBbanks] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedBbank, setSelectedBbank] = useState(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        fetchBbanks();
    }, []);

    const fetchBbanks = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            setBbanks(response.data);
        } catch (error) {
            console.log("Error fetching blood banks:", error);
        } finally {
            setLoading(false);
        }
    };


    const filteredBbanks = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return bbanks.filter(
            (bbank) =>
                bbank.bloodBankName
                    ?.toLowerCase()
                    .includes(searchValue) ||
                bbank.email
                    ?.toLowerCase()
                    .includes(searchValue) ||
                bbank.phone
                    ?.toLowerCase()
                    .includes(searchValue) ||
                bbank.city
                    ?.toLowerCase()
                    .includes(searchValue) ||
                bbank.district
                    ?.toLowerCase()
                    .includes(searchValue) ||
                bbank.registrationNumber
                    ?.toLowerCase()
                    .includes(searchValue)
        );
    }, [bbanks, search]);


    const totalBbanks = bbanks.length;

    const approvedCount = bbanks.filter(
        (bbank) => bbank.status === "Approved"
    ).length;

    const pendingCount = bbanks.filter(
        (bbank) => bbank.status === "Pending"
    ).length;

    const rejectedCount = bbanks.filter(
        (bbank) => bbank.status === "Rejected"
    ).length;

    const blockedCount = bbanks.filter(
        (bbank) => bbank.status === "Blocked"
    ).length;


    const updateStatus = async (id, status) => {
        try {
            const bbank = bbanks.find(
                (item) => item.id === id
            );

            if (!bbank) return;

            await axios.put(`${API_URL}/${id}`, {
                ...bbank,
                status,
            });

            await fetchBbanks();

            if (selectedBbank?.id === id) {
                setSelectedBbank({
                    ...bbank,
                    status,
                });
            }
        } catch (error) {
            console.log("Error updating blood bank:", error);
        }
    };


    const deleteBbank = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this blood bank?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`${API_URL}/${id}`);

            await fetchBbanks();

            if (selectedBbank?.id === id) {
                setSelectedBbank(null);
            }
        } catch (error) {
            console.log("Error deleting blood bank:", error);
        }
    };


    const viewBbank = (bbank) => {
        setSelectedBbank(bbank);
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
                            Blood Bank Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage registered blood banks and
                            registration requests.
                        </p>
                    </div>

                    <div className="flex items-center bg-white shadow rounded-lg px-4 py-3 mt-4 md:mt-0 w-full md:w-80">

                        <FaSearch className="text-gray-500" />

                        <input
                            type="text"
                            placeholder="Search blood bank..."
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
                            Total Blood Banks
                        </h2>

                        <p className="text-4xl font-bold text-red-600 mt-2">
                            {totalBbanks}
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
                                Loading blood banks...
                            </p>

                        </div>

                    ) : filteredBbanks.length === 0 ? (

                        <div className="bg-white rounded-xl shadow p-10 text-center">

                            <FaHospital className="mx-auto text-gray-300 text-5xl mb-3" />

                            <p className="text-gray-500">
                                No blood banks found.
                            </p>

                        </div>

                    ) : (

                        filteredBbanks.map((bbank) => (

                            <div
                                key={bbank.id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5"
                            >

                                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                                    <div className="flex items-center gap-4 flex-1">

                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shrink-0">

                                            <FaHospital className="text-red-600 text-2xl" />

                                        </div>

                                        <div>

                                            <h2 className="text-lg font-bold text-gray-800">

                                                {bbank.bloodBankName ||
                                                    "Unknown Blood Bank"}

                                            </h2>

                                            <p className="text-sm text-gray-500">

                                                Blood Bank ID:{" "}
                                                {bbank.id}

                                            </p>

                                            <p className="text-sm text-gray-500">

                                                {bbank.email ||
                                                    "No email"}

                                            </p>

                                            <div className="flex flex-wrap gap-3 mt-2 text-sm">

                                                <span className="flex items-center gap-1">

                                                    <FaPhoneAlt className="text-red-600" />

                                                    {bbank.phone ||
                                                        "N/A"}

                                                </span>

                                                <span className="flex items-center gap-1">

                                                    <FaMapMarkerAlt className="text-red-600" />

                                                    {bbank.city ||
                                                        bbank.district ||
                                                        "N/A"}

                                                </span>

                                            </div>

                                        </div>

                                    </div>
                                    <div className="flex flex-wrap gap-3">

                                        <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">

                                            <FaBuilding className="inline mr-1" />

                                            Blood Bank

                                        </span>

                                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">

                                            License:{" "}
                                            {bbank.registrationNumber ||
                                                "N/A"}

                                        </span>

                                        <span
                                            className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                                                bbank.status
                                            )}`}
                                        >

                                            {bbank.status ||
                                                "Pending"}

                                        </span>

                                    </div>

                                    <div className="flex justify-end w-full xl:w-auto">

                                        <div className="flex items-center gap-2">



                                            <button
                                                onClick={() =>
                                                    viewBbank(
                                                        bbank
                                                    )
                                                }
                                                title="View Profile"
                                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                                            >
                                                <FaEye />
                                            </button>



                                            {bbank.status ===
                                                "Pending" && (

                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                bbank.id,
                                                                "Approved"
                                                            )
                                                        }
                                                        title="Approve Blood Bank"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                                    >
                                                        <FaCheck />
                                                    </button>

                                                )}



                                            {bbank.status ===
                                                "Pending" && (

                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                bbank.id,
                                                                "Rejected"
                                                            )
                                                        }
                                                        title="Reject Blood Bank"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                                                    >
                                                        <FaTimes />
                                                    </button>

                                                )}



                                            {bbank.status ===
                                                "Approved" && (

                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                bbank.id,
                                                                "Blocked"
                                                            )
                                                        }
                                                        title="Block Blood Bank"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white transition"
                                                    >
                                                        <FaBan />
                                                    </button>

                                                )}


                                            {bbank.status ===
                                                "Blocked" && (

                                                    <button
                                                        onClick={() =>
                                                            updateStatus(
                                                                bbank.id,
                                                                "Approved"
                                                            )
                                                        }
                                                        title="Unblock Blood Bank"
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                                                    >
                                                        <FaCheck />
                                                    </button>

                                                )}



                                            <button
                                                onClick={() =>
                                                    deleteBbank(
                                                        bbank.id
                                                    )
                                                }
                                                title="Delete Blood Bank"
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

            {selectedBbank && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">



                        <div className="flex justify-between items-center p-6 border-b">

                            <div>

                                <h2 className="text-2xl font-bold text-gray-800">
                                    Blood Bank Profile
                                </h2>

                                <p className="text-gray-500 text-sm">
                                    Blood Bank ID:{" "}
                                    {selectedBbank.id}
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedBbank(null)
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

                                        {selectedBbank.bloodBankName}

                                    </h3>

                                    <p className="text-gray-500">

                                        {selectedBbank.email ||
                                            "No email"}

                                    </p>

                                </div>

                            </div>



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <ProfileItem
                                    label="Blood Bank Name"
                                    value={
                                        selectedBbank.bloodBankName
                                    }
                                />

                                <ProfileItem
                                    label="Phone"
                                    value={
                                        selectedBbank.phone
                                    }
                                />

                                <ProfileItem
                                    label="Email"
                                    value={
                                        selectedBbank.email
                                    }
                                />

                                <ProfileItem
                                    label="Registration / License Number"
                                    value={
                                        selectedBbank.registrationNumber
                                    }
                                />

                                <ProfileItem
                                    label="City"
                                    value={
                                        selectedBbank.city
                                    }
                                />

                                <ProfileItem
                                    label="District"
                                    value={
                                        selectedBbank.district
                                    }
                                />

                                <ProfileItem
                                    label="State"
                                    value={
                                        selectedBbank.state
                                    }
                                />

                                <ProfileItem
                                    label="Pincode"
                                    value={
                                        selectedBbank.pincode
                                    }
                                />

                            </div>

                            <div className="mt-4">

                                <ProfileItem
                                    label="Address"
                                    value={
                                        selectedBbank.address
                                    }
                                />

                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">

                                <p className="text-sm text-gray-500 mb-2">
                                    Registration Status
                                </p>

                                <span
                                    className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                                        selectedBbank.status
                                    )}`}
                                >

                                    {selectedBbank.status ||
                                        "Pending"}

                                </span>

                            </div>

                            <div className="flex flex-wrap gap-3 mt-6">


                                {selectedBbank.status ===
                                    "Pending" && (

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedBbank.id,
                                                    "Approved"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            <FaCheck />
                                            Approve
                                        </button>

                                    )}


                                {selectedBbank.status ===
                                    "Pending" && (

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedBbank.id,
                                                    "Rejected"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                                        >
                                            <FaTimes />
                                            Reject
                                        </button>

                                    )}

                                {selectedBbank.status ===
                                    "Approved" && (

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedBbank.id,
                                                    "Blocked"
                                                )
                                            }
                                            className="flex items-center gap-2 bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600"
                                        >
                                            <FaBan />
                                            Block
                                        </button>

                                    )}

                                {selectedBbank.status ===
                                    "Blocked" && (

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    selectedBbank.id,
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
                                        deleteBbank(
                                            selectedBbank.id
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

export default BBManagementADm;