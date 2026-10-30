
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    FaHospital,
    FaUser,
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaIdCard,
    FaCamera,
    FaSave,
    FaSpinner,
} from "react-icons/fa";

import HospitalPanel from "../../components/HospitalPanel";
import { loginUser } from "../../redux/userSlice";
import axiosInstance from "../../API/axiosInstance";

function ProfileHS() {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const user = useSelector((state) => state.user.currentUser);

    const [profile, setProfile] = useState({
        hospitalName: "",
        hospitalType: "",
        contactPerson: "",
        adminName: "",
        email: "",
        phone: "",
        registrationNumber: "",
        licenseNumber: "",
        address: "",
        district: "",
        state: "",
        pincode: "",
        bloodBank: "",
        totalBeds: "",
        emergencyPhone: "",
        logo: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!user) return;

        setProfile({
            hospitalName: user.hospitalName || "",
            hospitalType: user.hospitalType || "",
            contactPerson: user.contactPerson || "",
            adminName: user.adminName || user.contactPerson || "",
            email: user.email || "",
            phone: user.phone || "",
            registrationNumber:
                user.registrationNumber || user.registrationNo || "",
            licenseNumber: user.licenseNumber || user.licenseNo || "",
            address: user.address || "",
            district: user.district || user.city || "",
            state: user.state || "",
            pincode: user.pincode || "",
            bloodBank: user.bloodBank || "",
            totalBeds: user.totalBeds ?? "",
            emergencyPhone: user.emergencyPhone || "",
            logo: user.logo || "",
        });
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrorMessage("Please select a valid image file.");
            e.target.value = "";
            return;
        }

        // Keep the image size reasonable for a base64 request.
        if (file.size > 2 * 1024 * 1024) {
            setErrorMessage("Please select an image smaller than 2 MB.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setProfile((prev) => ({
                ...prev,
                logo: reader.result,
            }));

            setErrorMessage("");
            setSuccessMessage("");
        };

        reader.onerror = () => {
            setErrorMessage("Unable to read the selected image.");
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        const hospitalId = user?._id || user?.id;

        if (!hospitalId) {
            setErrorMessage(
                "Hospital ID is missing. Please log out and log in again."
            );
            return;
        }

        if (!profile.hospitalName.trim() || !profile.email.trim()) {
            setErrorMessage("Hospital name and email are required.");
            return;
        }

        const totalBeds =
            profile.totalBeds === "" ? undefined : Number(profile.totalBeds);

        if (
            totalBeds !== undefined &&
            (!Number.isInteger(totalBeds) || totalBeds < 0)
        ) {
            setErrorMessage("Total beds must be a non-negative whole number.");
            return;
        }

        const updatedProfile = {
            ...profile,
            hospitalName: profile.hospitalName.trim(),
            contactPerson: profile.contactPerson.trim(),
            adminName: profile.adminName.trim(),
            email: profile.email.trim().toLowerCase(),
            phone: profile.phone.trim(),
            registrationNumber: profile.registrationNumber.trim(),
            licenseNumber: profile.licenseNumber.trim(),
            address: profile.address.trim(),
            district: profile.district.trim(),
            state: profile.state.trim(),
            pincode: profile.pincode.trim(),
            emergencyPhone: profile.emergencyPhone.trim(),
        };

        if (totalBeds !== undefined) {
            updatedProfile.totalBeds = totalBeds;
        } else {
            delete updatedProfile.totalBeds;
        }

        setLoading(true);

        try {
            // axiosInstance should have baseURL: http://localhost:5000/api

            const response = await axiosInstance.put(
                `/hospitals/${hospitalId}`,
                updatedProfile
            );
            // Support common backend response formats.
            const responseBody = response.data;

            const savedHospital =
                responseBody?.data?.hospital ||
                responseBody?.data ||
                responseBody?.hospital ||
                responseBody;

            // Merge server data with the existing user so fields such as
            // _id, role, status and other login details are preserved.
            const updatedHospital = {
                ...user,
                ...updatedProfile,
                ...(savedHospital &&
                    typeof savedHospital === "object" &&
                    !Array.isArray(savedHospital)
                    ? savedHospital
                    : {}),
                _id: savedHospital?._id || user._id || hospitalId,
            };

            dispatch(loginUser(updatedHospital));

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(updatedHospital)
            );

            setProfile((prev) => ({
                ...prev,
                ...updatedHospital,
            }));

            setSuccessMessage("Hospital profile updated successfully.");
        } catch (error) {
            console.error(
                "Hospital profile update failed:",
                error.response?.data || error
            );

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.error ||
                (error.response?.status === 404
                    ? "Hospital not found. Check the hospital ID and backend PUT route."
                    : "Failed to update the hospital profile. Please try again.")
            );
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-700">
                    Please Login First
                </h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <HospitalPanel />

            <div className="flex-1 min-w-0 py-10 px-4 md:px-6">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-200 to-red-100 p-8 text-red-900">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                                <img
                                    src={
                                        profile.logo ||
                                        "https://placehold.co/150x150?text=Hospital"
                                    }
                                    alt="Hospital Logo"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white bg-white"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    title="Change hospital logo"
                                    className="absolute bottom-0 right-0 bg-white text-red-600 p-3 rounded-full shadow hover:bg-red-50"
                                >
                                    <FaCamera />
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </div>

                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold">
                                    {profile.hospitalName || "Hospital Profile"}
                                </h1>
                                <p className="mt-2">
                                    {profile.hospitalType ||
                                        "Hospital Information"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid md:grid-cols-2 gap-6 p-6 md:p-8"
                    >
                        {/* Hospital Name */}
                        <div>
                            <label className="font-semibold flex items-center gap-2 mb-2">
                                <FaHospital className="text-red-600" />
                                Hospital Name *
                            </label>
                            <input
                                type="text"
                                name="hospitalName"
                                value={profile.hospitalName}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Hospital Type */}
                        <div>
                            <label className="font-semibold mb-2 block">
                                Hospital Type
                            </label>
                            <select
                                name="hospitalType"
                                value={profile.hospitalType}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            >
                                <option value="">Select</option>
                                <option value="Government Hospital">
                                    Government Hospital
                                </option>
                                <option value="Private Hospital">
                                    Private Hospital
                                </option>
                                <option value="Medical College">
                                    Medical College
                                </option>
                                <option value="Speciality Hospital">
                                    Speciality Hospital
                                </option>
                                <option value="Blood Bank">Blood Bank</option>
                            </select>
                        </div>

                        {/* Administrator */}
                        <div>
                            <label className="font-semibold flex items-center gap-2 mb-2">
                                <FaUser className="text-red-600" />
                                Administrator Name
                            </label>
                            <input
                                type="text"
                                name="adminName"
                                value={profile.adminName}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label className="font-semibold flex items-center gap-2 mb-2">
                                <FaUser className="text-red-600" />
                                Contact Person
                            </label>
                            <input
                                type="text"
                                name="contactPerson"
                                value={profile.contactPerson}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="font-semibold flex items-center gap-2 mb-2">
                                <FaEnvelope className="text-red-600" />
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="font-semibold flex items-center gap-2 mb-2">
                                <FaPhoneAlt className="text-red-600" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Registration Number */}
                        <div>
                            <label className="font-semibold flex items-center gap-2 mb-2">
                                <FaIdCard className="text-red-600" />
                                Registration Number
                            </label>
                            <input
                                type="text"
                                name="registrationNumber"
                                value={profile.registrationNumber}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* License Number */}
                        <div>
                            <label className="font-semibold flex items-center gap-2 mb-2">
                                <FaIdCard className="text-red-600" />
                                License Number
                            </label>
                            <input
                                type="text"
                                name="licenseNumber"
                                value={profile.licenseNumber}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="font-semibold flex items-center gap-2 mb-2">
                                <FaMapMarkerAlt className="text-red-600" />
                                Hospital Address
                            </label>
                            <textarea
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Enter hospital address"
                                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                        </div>

                        {/* District */}
                        <div>
                            <label className="font-semibold block mb-2">
                                District
                            </label>
                            <input
                                type="text"
                                name="district"
                                value={profile.district}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* State */}
                        <div>
                            <label className="font-semibold block mb-2">
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={profile.state}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Pincode */}
                        <div>
                            <label className="font-semibold block mb-2">
                                Pincode
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                value={profile.pincode}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Blood Bank */}
                        <div>
                            <label className="font-semibold block mb-2">
                                Blood Bank Available
                            </label>
                            <select
                                name="bloodBank"
                                value={profile.bloodBank}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {/* Total Beds */}
                        <div>
                            <label className="font-semibold block mb-2">
                                Total Beds
                            </label>
                            <input
                                type="number"
                                name="totalBeds"
                                min="0"
                                step="1"
                                value={profile.totalBeds}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <label className="font-semibold flex items-center gap-2 mb-2">
                                <FaPhoneAlt className="text-red-600" />
                                Emergency Contact
                            </label>
                            <input
                                type="tel"
                                name="emergencyPhone"
                                value={profile.emergencyPhone}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="font-semibold block mb-2">
                                Upload Hospital Logo
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="w-full border rounded-lg px-4 py-3"
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Image files only; maximum size 2 MB.
                            </p>

                            {profile.logo && (
                                <img
                                    src={profile.logo}
                                    alt="Hospital logo preview"
                                    className="mt-4 w-36 h-36 rounded-xl object-cover border-2 border-red-500 shadow-lg"
                                />
                            )}
                        </div>

                        {/* Messages */}
                        <div className="md:col-span-2">
                            {errorMessage && (
                                <p
                                    role="alert"
                                    className="bg-red-100 text-red-700 p-3 rounded-lg"
                                >
                                    {errorMessage}
                                </p>
                            )}

                            {successMessage && (
                                <p
                                    role="status"
                                    className="bg-green-100 text-green-700 p-3 rounded-lg"
                                >
                                    {successMessage}
                                </p>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="md:col-span-2 flex justify-center mt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition"
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfileHS;