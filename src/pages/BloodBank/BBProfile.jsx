
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    FaHospital,
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaUser,
    FaEdit,
    FaSave,
    FaTint,
    FaUsers,
    FaClipboardList,
    FaCalendarAlt,
    FaTimes,
    FaExclamationCircle,
    FaSyncAlt,
} from "react-icons/fa";

import BloodBankPanel from "../../components/BBPanel";
import axiosInstance from "../../API/axiosInstance";

const initialProfile = {
    bloodBankName: "",
    managerName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    licenseNumber: "",
    registrationNumber: "",
    type: "",
    status: "",
};

const initialStats = {
    bloodUnits: 0,
    donors: 0,
    requests: 0,
    camps: 0,
};

const getArray = (response, keys = []) => {
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
};

const normalizeId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
        return String(value._id || value.id || "");
    }

    return String(value);
};

const getProfileFields = (bank, fallbackEmail = "") => ({
    bloodBankName:
        bank.bloodBankName ||
        bank.name ||
        bank.bankName ||
        "",
    managerName:
        bank.managerName ||
        bank.adminName ||
        bank.contactPerson ||
        "",
    contactPerson:
        bank.contactPerson ||
        bank.managerName ||
        bank.adminName ||
        "",
    email: bank.email || fallbackEmail,
    phone: bank.phone || bank.contactNumber || "",
    address: bank.address || "",
    city: bank.city || "",
    state: bank.state || "",
    pincode: bank.pincode || "",
    licenseNumber: bank.licenseNumber || bank.licenseNo || "",
    registrationNumber: bank.registrationNumber || "",
    type: bank.type || "",
    status: bank.status || "",
});

function BloodBankProfile() {
    const user = useSelector((state) => state.user.currentUser);

    const [profile, setProfile] = useState(initialProfile);
    const [formData, setFormData] = useState(initialProfile);

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [stats, setStats] = useState(initialStats);
    const [statsLoading, setStatsLoading] = useState(false);

    const bloodBankId = normalizeId(
        user?._id || user?.id || user?.bloodBankId
    );

    const userEmail = String(user?.email || "")
        .trim()
        .toLowerCase();

    // Load blood bank profile.
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            if (!userEmail && !bloodBankId) {
                throw new Error(
                    "Blood bank login details are missing. Please log in again."
                );
            }

            let bank = null;

            // Try ID first.
            if (bloodBankId) {
                try {
                    const response = await axiosInstance.get(
                        `/bloodBanks/${bloodBankId}`
                    );

                    bank =
                        response.data?.data ||
                        response.data?.bloodBank ||
                        response.data;

                    // Some APIs return a successful response with
                    // a message instead of a bank document.
                    if (!bank || !bank._id) {
                        bank = null;
                    }
                } catch (idError) {
                    console.warn(
                        "Blood bank ID lookup failed:",
                        idError.response?.data?.message ||
                        idError.message
                    );
                }
            }

            // Fallback to email.
            if (!bank && userEmail) {
                const response = await axiosInstance.get(
                    "/bloodBanks",
                    {
                        params: { email: userEmail },
                    }
                );

                const banks = getArray(response, ["bloodBanks"]);

                bank = banks.find(
                    (item) =>
                        String(item.email || "")
                            .trim()
                            .toLowerCase() === userEmail
                );

                if (!bank) {
                    throw new Error(
                        "Blood bank profile not found for the logged-in email."
                    );
                }
            }

            if (!bank) {
                throw new Error(
                    "Could not find the blood bank profile. Please log in again."
                );
            }

            const mapped = getProfileFields(bank, userEmail);

            setProfile(mapped);
            setFormData(mapped);
        } catch (err) {
            console.error(
                "Failed to load blood bank profile:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load blood bank profile."
            );
        } finally {
            setLoading(false);
        }
    }, [bloodBankId, userEmail]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Load each statistics endpoint independently.
    const fetchStatistics = useCallback(async () => {
        setStatsLoading(true);

        try {
            const endpoints = [
                axiosInstance.get("/bloodInventory"),
                axiosInstance.get("/donors"),
                axiosInstance.get("/bloodRequests"),

                // Temporarily disable this request if the route
                // has not yet been created in the backend.
                // Restore axiosInstance.get("/donationCamps")
                // after registering that route.
                Promise.resolve({ data: [] }),
            ];

            const results = await Promise.allSettled(endpoints);

            const inventory =
                results[0].status === "fulfilled"
                    ? getArray(results[0].value, [
                        "bloodInventory",
                        "inventory",
                    ])
                    : [];

            const donors =
                results[1].status === "fulfilled"
                    ? getArray(results[1].value, ["donors"])
                    : [];

            const requests =
                results[2].status === "fulfilled"
                    ? getArray(results[2].value, [
                        "bloodRequests",
                        "requests",
                    ])
                    : [];

            const camps =
                results[3].status === "fulfilled"
                    ? getArray(results[3].value, [
                        "donationCamps",
                        "camps",
                    ])
                    : [];

            const bankName = String(profile.bloodBankName || "")
                .trim()
                .toLowerCase();

            const belongsToBank = (item) => {
                const bankValue = item.bloodBank;

                const ownerId = normalizeId(
                    item.bloodBankId ||
                    (typeof bankValue === "object"
                        ? bankValue?._id || bankValue?.id
                        : "")
                );

                const ownerName = String(
                    item.bloodBankName ||
                    (typeof bankValue === "object"
                        ? bankValue?.bloodBankName ||
                        bankValue?.name ||
                        ""
                        : typeof bankValue === "string"
                            ? bankValue
                            : "")
                )
                    .trim()
                    .toLowerCase();

                const idMatches =
                    Boolean(bloodBankId) &&
                    Boolean(ownerId) &&
                    ownerId === bloodBankId;

                const nameMatches =
                    Boolean(bankName) &&
                    Boolean(ownerName) &&
                    ownerName === bankName;

                return idMatches || nameMatches;
            };

            const bankInventory = inventory.filter(belongsToBank);

            const bloodUnits = bankInventory.reduce((total, item) => {
                const units = Number(
                    item.units ??
                    item.quantity ??
                    item.availableUnits ??
                    item.unitCount ??
                    0
                );

                return total + (
                    Number.isFinite(units) ? units : 0
                );
            }, 0);

            setStats({
                bloodUnits,
                donors: donors.filter(belongsToBank).length,
                requests: requests.filter(belongsToBank).length,
                camps: camps.filter(belongsToBank).length,
            });
        } catch (err) {
            console.error(
                "Failed to calculate blood bank statistics:",
                err.message
            );
        } finally {
            setStatsLoading(false);
        }
    }, [bloodBankId, profile.bloodBankName]);

    useEffect(() => {
        if (!loading && profile.bloodBankName) {
            fetchStatistics();
        }
    }, [loading, profile.bloodBankName, fetchStatistics]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        setFormData({ ...profile });
        setError("");
        setSuccess("");
        setEditing(true);
    };

    const handleCancel = () => {
        setFormData({ ...profile });
        setEditing(false);
        setError("");
        setSuccess("");
    };

    const handleSave = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (saving) return;

        if (!bloodBankId) {
            setError(
                "Blood bank ID is missing. Please log in again before updating the profile."
            );
            return;
        }

        if (!formData.bloodBankName.trim()) {
            setError("Blood bank name is required.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Email address is required.");
            return;
        }

        const payload = {
            ...formData,
            bloodBankName: formData.bloodBankName.trim(),
            managerName: (
                formData.managerName ||
                formData.contactPerson ||
                ""
            ).trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
            licenseNumber: formData.licenseNumber.trim(),
            registrationNumber: formData.registrationNumber.trim(),
        };

        try {
            setSaving(true);

            const response = await axiosInstance.put(
                `/bloodBanks/${bloodBankId}`,
                payload
            );

            const savedBank =
                response.data?.data ||
                response.data?.bloodBank ||
                response.data;

            const updatedProfile =
                savedBank &&
                    typeof savedBank === "object" &&
                    !Array.isArray(savedBank) &&
                    savedBank._id
                    ? {
                        ...payload,
                        ...getProfileFields(savedBank, payload.email),
                    }
                    : payload;

            setProfile(updatedProfile);
            setFormData(updatedProfile);
            setEditing(false);

            setSuccess("Blood bank profile updated successfully.");

            await fetchStatistics();
        } catch (err) {
            console.error(
                "Failed to update blood bank profile:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Failed to update profile. Please check your backend PUT /api/bloodBanks/:id route."
            );
        } finally {
            setSaving(false);
        }
    };

    const fields = [
        { name: "bloodBankName", label: "Blood Bank Name", icon: FaHospital, type: "text" },
        { name: "managerName", label: "Manager Name", icon: FaUser, type: "text" },
        { name: "email", label: "Email Address", icon: FaEnvelope, type: "email" },
        { name: "phone", label: "Phone Number", icon: FaPhoneAlt, type: "tel" },
        { name: "address", label: "Address", icon: FaMapMarkerAlt, type: "text" },
        { name: "city", label: "City", icon: FaMapMarkerAlt, type: "text" },
        { name: "state", label: "State", icon: FaMapMarkerAlt, type: "text" },
        { name: "pincode", label: "PIN Code", icon: FaMapMarkerAlt, type: "text" },
        { name: "licenseNumber", label: "License Number", icon: FaTint, type: "text" },
        { name: "registrationNumber", label: "Registration Number", icon: FaHospital, type: "text" },
    ];

    const statisticCards = [
        {
            label: "Blood Units",
            value: stats.bloodUnits,
            icon: FaTint,
            color: "text-red-600",
            background: "bg-red-50",
        },
        {
            label: "Registered Donors",
            value: stats.donors,
            icon: FaUsers,
            color: "text-green-600",
            background: "bg-green-50",
        },
        {
            label: "Blood Requests",
            value: stats.requests,
            icon: FaClipboardList,
            color: "text-blue-600",
            background: "bg-blue-50",
        },
        {
            label: "Donation Camps",
            value: stats.camps,
            icon: FaCalendarAlt,
            color: "text-purple-600",
            background: "bg-purple-50",
        },
    ];

    return (
        <BloodBankPanel>
            <main className="min-h-screen flex-1 bg-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                            Blood Bank Profile
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Manage your blood bank information and contact details.
                        </p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                        >
                            <FaExclamationCircle className="mt-1 shrink-0" />
                            <p className="flex-1 text-sm">{error}</p>
                            <button
                                type="button"
                                onClick={() => setError("")}
                                aria-label="Dismiss error"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                        >
                            {success}
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                            <FaSyncAlt className="mx-auto animate-spin text-3xl text-red-600" />
                            <p className="mt-4 text-gray-500">
                                Loading blood bank profile...
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                                <div className="flex h-36 items-center justify-center bg-gradient-to-r from-red-700 to-pink-600 sm:h-44">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg sm:h-28 sm:w-28">
                                        <FaHospital className="text-5xl text-red-600 sm:text-6xl" />
                                    </div>
                                </div>

                                <div className="px-4 pb-8 pt-7 sm:px-8 lg:px-10">
                                    <div className="mb-8 text-center">
                                        <h2 className="break-words text-2xl font-bold text-gray-800 sm:text-3xl">
                                            {profile.bloodBankName || "Blood Bank"}
                                        </h2>
                                        <p className="mt-2 text-gray-500">
                                            Registered Blood Bank
                                        </p>

                                        {profile.status && (
                                            <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                                Status: {profile.status}
                                            </span>
                                        )}
                                    </div>

                                    <form onSubmit={handleSave}>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {fields.map((field) => {
                                                const Icon = field.icon;

                                                return (
                                                    <div key={field.name}>
                                                        <label
                                                            htmlFor={field.name}
                                                            className="font-semibold text-gray-700"
                                                        >
                                                            {field.label}
                                                        </label>

                                                        <div className="mt-2 flex items-center rounded-lg border border-gray-200 px-4 py-3 focus-within:border-red-400">
                                                            <Icon className="mr-3 shrink-0 text-red-600" />
                                                            <input
                                                                id={field.name}
                                                                name={field.name}
                                                                type={field.type}
                                                                value={formData[field.name] ?? ""}
                                                                onChange={handleChange}
                                                                readOnly={!editing}
                                                                required={
                                                                    editing &&
                                                                    ["bloodBankName", "email"].includes(field.name)
                                                                }
                                                                className={`w-full bg-transparent outline-none ${!editing
                                                                    ? "cursor-default text-gray-600"
                                                                    : "text-gray-800"
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-8 flex flex-wrap justify-end gap-3">
                                            {editing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        disabled={saving}
                                                        className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                                    >
                                                        <FaTimes />
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="submit"
                                                        disabled={saving}
                                                        className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {saving ? (
                                                            <FaSyncAlt className="animate-spin" />
                                                        ) : (
                                                            <FaSave />
                                                        )}
                                                        {saving ? "Saving..." : "Save Changes"}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleEdit}
                                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                                                >
                                                    <FaEdit />
                                                    Edit Profile
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>


                        </>
                    )}
                </div>
            </main>
        </BloodBankPanel>
    );
}

export default BloodBankProfile;
