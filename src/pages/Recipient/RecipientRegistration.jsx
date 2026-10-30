import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaVenusMars,
    FaBirthdayCake,
    FaTint,
    FaHospital,
    FaMapMarkerAlt,
    FaLock,
    FaNotesMedical,
    FaSave,
    FaArrowLeft
} from "react-icons/fa";
import { registerRecipient } from "../../API/addRecipient";
import validateRecipient from "../../Validation/recipientValidation";

import { toast } from "react-toastify";

function RecipientRegistration() {
    const navigate = useNavigate();


    const initialFormData = {
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        bloodGroup: "",
        hospital: "",
        medicalCondition: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        password: "",
        confirmPassword: "",
        status: "Pending",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

        const validationErrors = validateRecipient(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            const recipientData = {
                ...formData,
                id: `R${Date.now()}`,
                status: "Pending",
            };

            console.log("Sending recipient data:", recipientData);

            await registerRecipient(recipientData);

            toast.success("Recipient registered successfully!");

            setFormData(initialFormData);
            setErrors({});

            navigate("/success", { replace: true });

        } catch (error) {
            console.error("Recipient registration error:", error);

            const message = error.message || "";

            if (
                message.toLowerCase().includes("email") ||
                message.toLowerCase().includes("exists") ||
                message.toLowerCase().includes("duplicate")
            ) {
                setErrors((prev) => ({
                    ...prev,
                    email: "Email already exists. Cannot register.",
                }));
            } else {
                toast.error(message || "Registration failed.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (

        < div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-10 px-4" >
            <div className="max-w-5xl mx-auto">

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
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

                    <div className="bg-red-700 text-white text-center py-6">
                        <h1 className="text-4xl font-bold">
                            Recipient Registration
                        </h1 >

                        <p className="mt-2">
                            Register to request blood from verified donors and hospitals.
                        </p>
                    </div >

                    <form onSubmit={handleSubmit} className="p-8">

                        <div className="grid md:grid-cols-2 gap-6">



                            <div>
                                <label className="font-semibold">
                                    Full Name
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaUser className="text-red-500" />

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter Full Name"
                                        className="w-full p-3 outline-none"
                                    />
                                </div>

                                {errors.fullName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.fullName}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    Email
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaEnvelope className="text-red-500" />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter Email"
                                        className="w-full p-3 outline-none"
                                    />
                                </div>

                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    Phone Number
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaPhone className="text-red-500" />

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter Phone Number"
                                        className="w-full p-3 outline-none"
                                    />
                                </div>

                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="font-semibold">
                                    Gender
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaVenusMars className="text-red-500" />

                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                    >
                                        <option value="">
                                            Select Gender
                                        </option>

                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                {errors.gender && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.gender}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    Date of Birth
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaBirthdayCake className="text-red-500" />

                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                    />
                                </div>

                                {errors.dob && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.dob}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    Required Blood Group
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaTint className="text-red-500" />

                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                    >
                                        <option value="">
                                            Select Blood Group
                                        </option>

                                        <option>A+</option>
                                        <option>A-</option>
                                        <option>B+</option>
                                        <option>B-</option>
                                        <option>AB+</option>
                                        <option>AB-</option>
                                        <option>O+</option>
                                        <option>O-</option>
                                    </select>
                                </div>

                                {errors.bloodGroup && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.bloodGroup}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="font-semibold">
                                    Hospital Name
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaHospital className="text-red-500" />

                                    <input
                                        type="text"
                                        name="hospital"
                                        value={formData.hospital}
                                        onChange={handleChange}
                                        placeholder="Enter Hospital Name"
                                        className="w-full p-3 outline-none"
                                    />
                                </div>

                                {errors.hospital && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.hospital}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    Medical Condition
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaNotesMedical className="text-red-500" />

                                    <input
                                        type="text"
                                        name="medicalCondition"
                                        value={formData.medicalCondition}
                                        onChange={handleChange}
                                        placeholder="Reason for Blood Requirement"
                                        className="w-full p-3 outline-none"
                                    />
                                </div>

                                {errors.medicalCondition && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.medicalCondition}
                                    </p>
                                )}
                            </div>


                            <div className="md:col-span-2">
                                <label className="font-semibold">
                                    Address
                                </label>

                                <div className="flex items-start border rounded-lg mt-2 px-3">
                                    <FaMapMarkerAlt className="text-red-500 mt-4" />

                                    <textarea
                                        name="address"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter Full Address"
                                        className="w-full p-3 outline-none resize-none"
                                    />
                                </div>

                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.address}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 mt-2"
                                />

                                {errors.city && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.city}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    State
                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 mt-2"
                                />

                                {errors.state && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.state}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    Pincode
                                </label>

                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 mt-2"
                                />

                                {errors.pincode && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.pincode}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    Password
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaLock className="text-red-500" />

                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter Password"
                                        className="w-full p-3 outline-none"
                                    />
                                </div>

                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="font-semibold">
                                    Confirm Password
                                </label>

                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaLock className="text-red-500" />

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm Password"
                                        className="w-full p-3 outline-none"
                                    />
                                </div>

                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-10 py-3 rounded-lg flex items-center gap-2 mx-auto text-white transition duration-300 ${loading
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-red-700 hover:bg-red-800"
                                    }`}
                            >
                                <FaSave />

                                {loading ? "Registering..." : "Register as Recipient"}
                            </button>
                        </div>

                    </form>

                </div >
            </div >

        </div >
    );
}
export default RecipientRegistration;