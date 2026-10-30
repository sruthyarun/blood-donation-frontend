
import { useEffect, useState } from "react";

import {
    FaUserCircle,
    FaUser,
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaBuilding,
    FaCalendarAlt,
    FaLock,
    FaSave,
    FaSyncAlt,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";
import API from "../../API/axiosInstance";

function AdminProfile() {
    const [admin, setAdmin] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

    // Extract admin from different API response formats
    const getAdminFromResponse = (data) => {
        if (Array.isArray(data)) {
            return data[0] || null;
        }

        if (data?.admin) {
            return data.admin;
        }

        if (Array.isArray(data?.data)) {
            return data.data[0] || null;
        }

        if (data?.data?.admin) {
            return data.data.admin;
        }

        if (data?.data?._id || data?.data?.id) {
            return data.data;
        }

        if (data?._id || data?.id) {
            return data;
        }

        return null;
    };

    // Fetch admin profile
    const fetchAdmin = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/admin");

            const adminData = getAdminFromResponse(
                response.data
            );

            if (!adminData) {
                setAdmin(null);
                setError(
                    "No administrator record was returned by the server."
                );
                return;
            }

            setAdmin({
                ...adminData,
                _id: adminData._id || adminData.id,
                name: adminData.name || adminData.fullName || "",
                email: adminData.email || "",
                phone: adminData.phone || "",
                department: adminData.department || "",
                address: adminData.address || "",
                role: adminData.role || "System Administrator",
                joined:
                    adminData.joined ||
                    adminData.createdAt ||
                    "",
            });
        } catch (error) {
            console.error(
                "Error fetching admin:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load admin profile."
            );

            setAdmin(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmin();
    }, []);

    // Handle profile input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setAdmin((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Save profile
    const handleSave = async () => {
        const adminId = admin?._id || admin?.id;

        if (!adminId) {
            alert("Admin ID not found.");
            return;
        }

        if (
            !admin.name?.trim() ||
            !admin.email?.trim()
        ) {
            alert("Name and email are required.");
            return;
        }

        try {
            setSaving(true);

            const updatedProfile = {
                name: admin.name.trim(),
                email: admin.email.trim().toLowerCase(),
                phone: admin.phone || "",
                department: admin.department || "",
                address: admin.address || "",
            };

            const response = await API.put(
                `/admin/${adminId}`,
                updatedProfile
            );

            const updatedAdmin = getAdminFromResponse(
                response.data
            );

            if (updatedAdmin) {
                setAdmin((prev) => ({
                    ...prev,
                    ...updatedAdmin,
                    _id: updatedAdmin._id || adminId,
                }));
            } else {
                setAdmin((prev) => ({
                    ...prev,
                    ...updatedProfile,
                }));
            }

            alert("Profile updated successfully!");
        } catch (error) {
            console.error(
                "Error updating profile:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // Handle password inputs
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = passwordData;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            alert("Please fill all password fields.");
            return;
        }

        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            alert(
                "New password must be different from current password."
            );
            return;
        }

        const adminId = admin?._id || admin?.id;

        if (!adminId) {
            alert("Admin ID not found.");
            return;
        }

        try {
            setChangingPassword(true);

            await API.put(
                `/admin/${adminId}/change-password`,
                {
                    currentPassword,
                    newPassword,
                }
            );

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setShowPasswordModal(false);

            alert("Password changed successfully!");
        } catch (error) {
            console.error(
                "Error changing password:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to change password. Please check your current password."
            );
        } finally {
            setChangingPassword(false);
        }
    };

    // Format date
    const formatDate = (dateValue) => {
        if (!dateValue) return "Not available";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString();
    };

    // Reset password modal
    const closePasswordModal = () => {
        setShowPasswordModal(false);

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    // Loading screen
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex">
                <AdminPanel />

                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <FaSyncAlt className="animate-spin text-red-600 text-4xl mx-auto" />

                        <p className="text-gray-500 mt-4">
                            Loading admin profile...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Profile not found
    if (!admin) {
        return (
            <div className="min-h-screen bg-gray-100 flex">
                <AdminPanel />

                <div className="flex-1 flex items-center justify-center p-5">
                    <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
                        <FaUserCircle className="text-gray-300 text-6xl mx-auto" />

                        <h2 className="text-xl font-bold mt-4">
                            Admin profile not found
                        </h2>

                        <p className="text-gray-500 mt-2">
                            {error ||
                                "Please check your admin API and MongoDB record."}
                        </p>

                        <button
                            onClick={fetchAdmin}
                            className="mt-5 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminPanel />

            <main className="flex-1 min-w-0 p-4 md:p-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Admin Profile
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View and update administrator profile information.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Profile card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

                        <FaUserCircle className="text-red-600 text-8xl mx-auto mb-5" />

                        <h2 className="text-2xl font-bold text-gray-800 break-words">
                            {admin.name}
                        </h2>

                        <p className="text-gray-500">
                            {admin.role}
                        </p>

                        <div className="mt-8 space-y-5 text-left">

                            <div className="flex items-start gap-3">
                                <FaEnvelope className="text-red-600 mt-1 shrink-0" />

                                <span className="text-gray-700 break-all">
                                    {admin.email || "-"}
                                </span>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaPhoneAlt className="text-red-600 mt-1 shrink-0" />

                                <span className="text-gray-700">
                                    {admin.phone || "-"}
                                </span>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaBuilding className="text-red-600 mt-1 shrink-0" />

                                <span className="text-gray-700">
                                    {admin.department || "-"}
                                </span>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaMapMarkerAlt className="text-red-600 mt-1 shrink-0" />

                                <span className="text-gray-700">
                                    {admin.address || "-"}
                                </span>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaCalendarAlt className="text-red-600 mt-1 shrink-0" />

                                <span className="text-gray-700">
                                    Joined: {formatDate(admin.joined)}
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* Edit profile */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5 md:p-8">

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Edit Profile
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Name */}
                            <div>
                                <label className="font-semibold text-gray-700">
                                    Full Name
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">
                                    <FaUser className="text-gray-500 shrink-0" />

                                    <input
                                        type="text"
                                        name="name"
                                        value={admin.name}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="font-semibold text-gray-700">
                                    Email
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">
                                    <FaEnvelope className="text-gray-500 shrink-0" />

                                    <input
                                        type="email"
                                        name="email"
                                        value={admin.email}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="font-semibold text-gray-700">
                                    Phone Number
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">
                                    <FaPhoneAlt className="text-gray-500 shrink-0" />

                                    <input
                                        type="text"
                                        name="phone"
                                        value={admin.phone}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div>
                                <label className="font-semibold text-gray-700">
                                    Department
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">
                                    <FaBuilding className="text-gray-500 shrink-0" />

                                    <input
                                        type="text"
                                        name="department"
                                        value={admin.department}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-700">
                                    Address
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">
                                    <FaMapMarkerAlt className="text-gray-500 shrink-0" />

                                    <input
                                        type="text"
                                        name="address"
                                        value={admin.address}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-4 mt-8">

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold"
                            >
                                {saving ? (
                                    <FaSyncAlt className="animate-spin" />
                                ) : (
                                    <FaSave />
                                )}

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowPasswordModal(true)}
                                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold"
                            >
                                <FaLock />
                                Change Password
                            </button>

                        </div>
                    </div>
                </div>
            </main>

            {/* Change password modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

                        <div className="flex justify-between items-center p-6 border-b">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Change Password
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Update your administrator password.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closePasswordModal}
                                className="text-gray-500 hover:text-red-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleChangePassword}
                            className="p-6 space-y-5"
                        >

                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Current Password
                                </label>

                                <div className="flex items-center border rounded-lg px-3">
                                    <FaLock className="text-gray-500" />

                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter current password"
                                        className="w-full p-3 outline-none"
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">
                                    New Password
                                </label>

                                <div className="flex items-center border rounded-lg px-3">
                                    <FaLock className="text-gray-500" />

                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter new password"
                                        className="w-full p-3 outline-none"
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                    />
                                </div>

                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum 6 characters
                                </p>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Confirm New Password
                                </label>

                                <div className="flex items-center border rounded-lg px-3">
                                    <FaLock className="text-gray-500" />

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirm new password"
                                        className="w-full p-3 outline-none"
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={closePasswordModal}
                                    className="px-5 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="px-5 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2"
                                >
                                    {changingPassword ? (
                                        <>
                                            <FaSyncAlt className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FaLock />
                                            Change Password
                                        </>
                                    )}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProfile;
