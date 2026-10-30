import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaHospital,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaMapMarkerAlt,
    FaBed,
    FaTint,
    FaLock,
    FaSave,
    FaArrowLeft,
} from "react-icons/fa";
import { StateSelect, CitySelect } from "react-country-state-city";
import { registerHospital } from "../../API/addHospital";
import { toast } from "react-toastify";
import validateHospital from "../../Validation/hospitalValidation";
function HospitalRegistration() {
    const [state, setState] = useState(null);
    const [city, setCity] = useState(null);

    const initialFormData = {
        hospitalName: "",
        hospitalType: "",
        contactPerson: "",
        adminName: "",
        email: "",
        phone: "",
        registrationNumber: "",
        licenseNumber: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        bloodBank: "",
        totalBeds: "",
        emergencyPhone: "",
        password: "",
        confirmPassword: "",
        logo: "",
        status: "Pending",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };




    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateHospital(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            const hospitalData = {
                ...formData,

                // Match the values accepted by the backend
                bloodBank:
                    formData.bloodBank === "Yes"
                        ? "Available"
                        : "Not Available",

                status: "Pending",
            };

            console.log("Sending hospital data:", hospitalData);

            await registerHospital(hospitalData);

            toast.success("Hospital registered successfully!");

            setFormData(initialFormData);
            setErrors({});
            setState(null);
            setCity(null);

            navigate("/success", { replace: true });

        } catch (error) {
            console.error("Hospital registration error:", error);

            const message = error.message || "Registration failed.";
            const lowerMessage = message.toLowerCase();

            if (
                lowerMessage.includes("email") ||
                lowerMessage.includes("registrationnumber") ||
                lowerMessage.includes("licensenumber") ||
                lowerMessage.includes("duplicate") ||
                lowerMessage.includes("already exists")
            ) {
                toast.error(
                    "Email, registration number, or license number may already exist."
                );
            } else {
                toast.error(message);
            }

        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                logo: reader.result,
            }));
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-100 to-pink-100 py-10 px-4">
            <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 mb-5
                               text-gray-600
                               hover:text-red-600
                               font-semibold
                               transition duration-300"
            >
                <FaArrowLeft />

                <span>
                    Back to Home
                </span>
            </button>
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* Header */}

                <div className="bg-red-600 text-white text-center py-6">
                    <h1 className="text-4xl font-bold">
                        Hospital Registration
                    </h1>

                    <p className="mt-2">
                        Register your hospital to manage blood donations and requests.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Hospital Name */}
                        <div>
                            <label className="font-semibold">Hospital Name</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaHospital className="text-red-500" />
                                <input
                                    type="text"
                                    name="hospitalName"
                                    value={formData.hospitalName}
                                    onChange={handleChange}
                                    placeholder="Enter Hospital Name"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.hospitalName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.hospitalName}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold">Hospital Type</label>

                            <select
                                name="hospitalType"
                                value={formData.hospitalType}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3 mt-2"
                                required
                            >
                                <option value="">Select Hospital Type</option>
                                <option value="Government Hospital">Government Hospital</option>
                                <option value="Private Hospital">Private Hospital</option>
                                <option value="Medical College">Medical College</option>
                                <option value="Community Health Centre">Community Health Centre</option>
                                <option value="Primary Health Centre">Primary Health Centre</option>
                                <option value="Speciality Hospital">Speciality Hospital</option>
                                <option value="Multi Speciality Hospital">Multi Speciality Hospital</option>
                            </select>

                            {errors.hospitalType && (
                                <p className="text-red-500 text-sm mt-1">{errors.hospitalType}</p>
                            )}
                        </div>
                        <div>
                            <label className="font-semibold">
                                Administrator Name
                            </label>

                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaUser className="text-red-500" />

                                <input
                                    type="text"
                                    name="adminName"
                                    value={formData.adminName}
                                    onChange={handleChange}
                                    placeholder="Administrator Name"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.adminName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.adminName}</p>
                                )}
                            </div>
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label className="font-semibold">Contact Person</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaUser className="text-red-500" />
                                <input
                                    type="text"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    placeholder="Enter Contact Person"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.contactPerson && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold">
                                Registration Number
                            </label>

                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaIdCard className="text-red-500" />

                                <input
                                    type="text"
                                    name="registrationNumber"
                                    value={formData.registrationNumber}
                                    onChange={handleChange}
                                    placeholder="Hospital Registration Number"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.registrationNumber && (
                                    <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="font-semibold">Email Address</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaEnvelope className="text-red-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter Email Address"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="font-semibold">Phone Number</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaPhone className="text-red-500" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter Phone Number"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* License Number */}
                        <div>
                            <label className="font-semibold">Hospital License Number</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaIdCard className="text-red-500" />
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    placeholder="Enter License Number"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.licenseNumber && (
                                    <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>
                                )}
                            </div>
                        </div>

                        {/* Blood Bank */}
                        <div>
                            <label className="font-semibold">Blood Bank Available</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaTint className="text-red-500" />
                                <select
                                    name="bloodBank"
                                    value={formData.bloodBank}
                                    onChange={handleChange}
                                    className="w-full p-3 outline-none"
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                {errors.bloodBank && (
                                    <p className="text-red-500 text-sm mt-1">{errors.bloodBank}</p>
                                )}
                            </div>
                        </div>

                        {/* Total Beds */}
                        <div>
                            <label className="font-semibold">Total Beds</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaBed className="text-red-500" />
                                <input
                                    type="number"
                                    name="totalBeds"
                                    value={formData.totalBeds}
                                    onChange={handleChange}
                                    placeholder="Enter Total Beds"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.totalBeds && (
                                    <p className="text-red-500 text-sm mt-1">{errors.totalBeds}</p>
                                )}
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <label className="font-semibold">Emergency Contact</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaPhone className="text-red-500" />
                                <input
                                    type="tel"
                                    name="emergencyPhone"
                                    value={formData.emergencyPhone}
                                    onChange={handleChange}
                                    placeholder="Emergency Contact Number"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.emergencyPhone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>
                                )}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="font-semibold">Hospital Address</label>
                            <div className="flex items-start border rounded-lg mt-2 px-3">
                                <FaMapMarkerAlt className="text-red-500 mt-4" />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Enter Hospital Address"
                                    className="w-full p-3 outline-none resize-none"
                                    required
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                )}
                            </div>
                        </div>


                        <div>
                            <label className="font-semibold">State</label>

                            <StateSelect
                                countryid={101}
                                value={state}
                                onChange={(value) => {
                                    setState(value);
                                    setCity(null);

                                    setFormData((prev) => ({
                                        ...prev,
                                        state: value?.name || "",
                                        city: "",
                                    }));

                                    // Clear validation error
                                    setErrors((prev) => ({
                                        ...prev,
                                        state: "",
                                        city: "",
                                    }));
                                }}
                                placeHolder="Select State"
                            />
                        </div>


                        <div>
                            <label className="font-semibold">District</label>

                            <CitySelect
                                countryid={101}
                                stateid={state?.id}
                                value={city}
                                onChange={(value) => {
                                    setCity(value);

                                    setFormData((prev) => ({
                                        ...prev,
                                        city: value?.name || "",
                                    }));

                                    // Clear validation error
                                    setErrors((prev) => ({
                                        ...prev,
                                        city: "",
                                    }));
                                }}
                                placeHolder="Select District"
                                disabled={!state}
                            />
                        </div>

                        {/* Pincode */}
                        <div>
                            <label className="font-semibold">Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3 mt-2"
                                required
                            />
                        </div>
                        {errors.pincode && (
                            <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                        )}

                        {/* Upload Hospital Logo */}

                        <div className="md:col-span-2">

                            <label className="font-semibold mb-2 block">
                                Hospital Logo / Photo
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="w-full border rounded-lg p-3"
                            />
                            {errors.logo && (
                                <p className="text-red-500 text-sm mt-1">{errors.logo}</p>
                            )}

                            {/* Preview Image */}

                            {formData.logo && (
                                <div className="mt-4 flex justify-center">

                                    <img
                                        src={formData.logo}
                                        alt="Hospital Logo Preview"
                                        className="w-36 h-36 rounded-full object-cover border-4 border-red-500 shadow-lg"
                                    />

                                </div>
                            )}

                        </div>

                        {/* Password */}
                        <div>
                            <label className="font-semibold">Password</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaLock className="text-red-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter Password"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="font-semibold">Confirm Password</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaLock className="text-red-500" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="text-center mt-10">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-10 py-3 rounded-lg flex items-center gap-2 mx-auto
        text-white transition duration-300 ${loading
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            <FaSave />
                            {loading ? "Registering..." : "Register Hospital"}
                        </button>
                    </div>

                </form>

            </div >

        </div >
    );
}

export default HospitalRegistration;