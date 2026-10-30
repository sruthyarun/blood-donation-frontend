
import { useEffect, useState } from "react";
import axios from "axios";
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

const API_URL = "https://blood-donation-backend-olwl.onrender.com/api/admin";

function AdminProfile() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [changingPassword, setChangingPassword] =
        useState(false);

    useEffect(() => {
        fetchAdmin();
    }, []);

    const fetchAdmin = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            if (response.data.length > 0) {
                setAdmin(response.data[0]);
            }
        } catch (error) {
            console.error(
                "Error fetching admin:",
                error
            );
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;

        setAdmin((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleSave = async () => {
        if (!admin?.id) {
            alert("Admin profile not found.");
            return;
        }

        try {
            setSaving(true);

            await axios.put(
                `${API_URL}/${admin.id}`,
                admin
            );

            alert("Profile updated successfully!");
        } catch (error) {
            console.error(
                "Error updating admin:",
                error
            );

            alert(
                "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleChangePassword = async (e) => {
        e.preventDefault();

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill all password fields.");
            return;
        }

        if (currentPassword !== admin.password) {
            alert("Current password is incorrect.");
            return;
        }

        if (newPassword.length < 6) {
            alert(
                "New password must be at least 6 characters."
            );
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

        try {
            setChangingPassword(true);

            const updatedAdmin = {
                ...admin,
                password: newPassword,
            };

            const response = await axios.put(
                `${API_URL}/${admin.id}`,
                updatedAdmin
            );

            setAdmin(response.data);

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
                error
            );

            alert("Unable to change password.");
        } finally {
            setChangingPassword(false);
        }
    };


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


    if (!admin) {
        return (
            <div className="min-h-screen bg-gray-100 flex">
                <AdminPanel />

                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                        <FaUserCircle className="text-gray-300 text-6xl mx-auto" />

                        <h2 className="text-xl font-bold mt-4">
                            Admin profile not found
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Please add an admin record
                            to db.json.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <div className="flex-1 p-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Admin Profile
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View and update administrator
                        profile information.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

                        <FaUserCircle className="text-red-600 text-8xl mx-auto mb-5" />

                        <h2 className="text-2xl font-bold text-gray-800">
                            {admin.name}
                        </h2>

                        <p className="text-gray-500">
                            {admin.role ||
                                "System Administrator"}
                        </p>

                        <div className="mt-8 space-y-5 text-left">


                            <div className="flex items-center gap-3">
                                <FaEnvelope className="text-red-600" />

                                <span className="text-gray-700 break-all">
                                    {admin.email}
                                </span>
                            </div>


                            <div className="flex items-center gap-3">
                                <FaPhoneAlt className="text-red-600" />

                                <span className="text-gray-700">
                                    {admin.phone}
                                </span>
                            </div>


                            <div className="flex items-center gap-3">
                                <FaBuilding className="text-red-600" />

                                <span className="text-gray-700">
                                    {admin.department}
                                </span>
                            </div>


                            <div className="flex items-center gap-3">
                                <FaMapMarkerAlt className="text-red-600" />

                                <span className="text-gray-700">
                                    {admin.address}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaCalendarAlt className="text-red-600" />

                                <span className="text-gray-700">
                                    Joined:{" "}
                                    {admin.joined}
                                </span>
                            </div>

                        </div>

                    </div>

                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Edit Profile
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">


                            <div>
                                <label className="font-semibold text-gray-700">
                                    Full Name
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">

                                    <FaUser className="text-gray-500" />

                                    <input
                                        type="text"
                                        name="name"
                                        value={admin.name}
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full p-3 outline-none"
                                    />

                                </div>
                            </div>


                            <div>
                                <label className="font-semibold text-gray-700">
                                    Email
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">

                                    <FaEnvelope className="text-gray-500" />

                                    <input
                                        type="email"
                                        name="email"
                                        value={admin.email}
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full p-3 outline-none"
                                    />

                                </div>
                            </div>


                            <div>
                                <label className="font-semibold text-gray-700">
                                    Phone Number
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">

                                    <FaPhoneAlt className="text-gray-500" />

                                    <input
                                        type="text"
                                        name="phone"
                                        value={admin.phone}
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full p-3 outline-none"
                                    />

                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-gray-700">
                                    Department
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">

                                    <FaBuilding className="text-gray-500" />

                                    <input
                                        type="text"
                                        name="department"
                                        value={
                                            admin.department
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full p-3 outline-none"
                                    />

                                </div>
                            </div>

                            <div className="md:col-span-2">

                                <label className="font-semibold text-gray-700">
                                    Address
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3 focus-within:ring-2 focus-within:ring-red-500">

                                    <FaMapMarkerAlt className="text-gray-500" />

                                    <input
                                        type="text"
                                        name="address"
                                        value={
                                            admin.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full p-3 outline-none"
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="flex flex-wrap gap-4 mt-8">

                            <button
                                onClick={
                                    handleSave
                                }
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

            </div>
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

                        {/* Header */}

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
                                onClick={() =>
                                    setShowPasswordModal(false)
                                }
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
                                        value={
                                            passwordData.currentPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Enter current password"
                                        className="w-full p-3 outline-none"
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
                                        value={
                                            passwordData.newPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Enter new password"
                                        className="w-full p-3 outline-none"
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
                                        value={
                                            passwordData.confirmPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Confirm new password"
                                        className="w-full p-3 outline-none"
                                    />

                                </div>

                            </div>

                            <div className="flex justify-end gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordModal(false)
                                    }
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
