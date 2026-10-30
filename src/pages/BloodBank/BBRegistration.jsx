import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaTint,
    FaUserTie,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaWarehouse,
    FaClock,
    FaMapMarkerAlt,
    FaLock,
    FaSave,
    FaArrowLeft,
} from "react-icons/fa";
import { StateSelect, CitySelect } from "react-country-state-city";
import { registerBloodBank } from "../../API/addBloodBank";
import { toast } from "react-toastify";
import validateBloodBank from "../../Validation/bbankValidation";

function BloodBankRegistration() {
    const [state, setState] = useState(null);
    const [city, setCity] = useState(null);
    const initialFormData = {
        bloodBankName: "",
        managerName: "",
        email: "",
        phone: "",
        licenseNumber: "",
        registrationNumber: "",
        state: "",
        city: "",
        address: "",
        pincode: "",
        storageCapacity: "",
        operatingHours: "",
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

        const validationErrors = validateBloodBank(formData);
        console.log(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Check passwords before sending data
        if (formData.password !== formData.confirmPassword) {
            setErrors((prev) => ({
                ...prev,
                confirmPassword: "Passwords do not match",
            }));
            return;
        }

        setLoading(true);

        try {
            // Send both passwords to the backend
            const bbData = { ...formData };

            await registerBloodBank(bbData);

            toast.success("Blood bank registered successfully!");
            navigate("/success");

        } catch (error) {
            console.error(
                "Blood bank registration failed:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to register blood bank."
            );
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
                        Blood Bank Registration
                    </h1>

                    <p className="mt-2">
                        Register your blood bank to manage blood collection, storage, and distribution.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">

                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Blood Bank Name */}

                        <div>
                            <label className="font-semibold">Blood Bank Name</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaTint className="text-red-500" />
                                <input
                                    type="text"
                                    name="bloodBankName"
                                    value={formData.bloodBankName}
                                    onChange={handleChange}
                                    placeholder="Enter Blood Bank Name"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.bloodBankName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.bloodBankName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Manager Name */}

                        <div>
                            <label className="font-semibold">Manager Name</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaUserTie className="text-red-500" />
                                <input
                                    type="text"
                                    name="managerName"
                                    value={formData.managerName}
                                    onChange={handleChange}
                                    placeholder="Enter Manager Name"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.managerName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.managerName}
                                    </p>
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
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
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
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* License Number */}

                        <div>
                            <label className="font-semibold">License Number</label>
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
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.licenseNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Registration Number */}

                        <div>
                            <label className="font-semibold">Registration Number</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaIdCard className="text-red-500" />
                                <input
                                    type="text"
                                    name="registrationNumber"
                                    value={formData.registrationNumber}
                                    onChange={handleChange}
                                    placeholder="Enter Registration Number"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.registrationNumber && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.registrationNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Storage Capacity */}

                        <div>
                            <label className="font-semibold">Storage Capacity (Units)</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaWarehouse className="text-red-500" />
                                <input
                                    type="number"
                                    name="storageCapacity"
                                    value={formData.storageCapacity}
                                    onChange={handleChange}
                                    placeholder="Enter Storage Capacity"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.storageCapacity && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.storageCapacity}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Operating Hours */}

                        <div>
                            <label className="font-semibold">Operating Hours</label>
                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaClock className="text-red-500" />
                                <input
                                    type="text"
                                    name="operatingHours"
                                    value={formData.operatingHours}
                                    onChange={handleChange}
                                    placeholder="e.g. 9:00 AM - 6:00 PM"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                                {errors.operatingHours && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.operatingHours}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Emergency Phone */}

                        <div>
                            <label className="font-semibold">Emergency Phone</label>

                            <div className="flex items-center border rounded-lg mt-2 px-3">
                                <FaPhone className="text-red-500" />

                                <input
                                    type="tel"
                                    name="emergencyPhone"
                                    value={formData.emergencyPhone}
                                    onChange={handleChange}
                                    placeholder="Enter Emergency Phone"
                                    className="w-full p-3 outline-none"
                                    required
                                />
                            </div>

                            {errors.emergencyPhone && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.emergencyPhone}
                                </p>
                            )}
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
                            {errors.state && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.state}
                                </p>
                            )}

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
                            {errors.city && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.city}
                                </p>
                            )}
                        </div>
                        {/* Address */}

                        <div className="md:col-span-2">
                            <label className="font-semibold">Address</label>
                            <div className="flex items-start border rounded-lg mt-2 px-3">
                                <FaMapMarkerAlt className="text-red-500 mt-4" />
                                <textarea
                                    name="address"
                                    rows="3"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter Complete Address"
                                    className="w-full p-3 outline-none resize-none"
                                    required
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.address}
                                    </p>
                                )}
                            </div>
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
                            {errors.pincode && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.pincode}
                                </p>
                            )}
                        </div>
                        {/* Upload bloodbank Logo */}

                        <div className="md:col-span-2">

                            <label className="font-semibold mb-2 block">
                                Blood Bank Logo / Photo
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="w-full border rounded-lg p-3"
                            />
                            {errors.logo && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.logo}
                                </p>
                            )}

                            {/* Preview Image */}

                            {formData.logo && (
                                <div className="mt-4 flex justify-center">

                                    <img
                                        src={formData.logo}
                                        alt="Blood bank Logo Preview"
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
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
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
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="text-center mt-10">
                        <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-lg flex items-center gap-2 mx-auto"
                        >
                            <FaSave />
                            Register Blood Bank
                        </button>
                    </div>


                </form>

            </div >

        </div >
    );
}

export default BloodBankRegistration;