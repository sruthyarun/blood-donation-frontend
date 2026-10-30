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
    FaWeight,
    FaMapMarkerAlt,
    FaLock,
    FaNotesMedical,
    FaSave,
    FaArrowLeft,
} from "react-icons/fa";
import { registerDonor } from "../../API/addDonor";
import { toast } from "react-toastify";
import validateDonor from "../../Validation/donorValidation";
function DonorRegistration() {

    const initialFormData = {
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        bloodGroup: "",
        weight: "",
        lastDonation: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        diseases: "",
        availability: "",
        password: "",
        confirmPassword: "",
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

        console.log("Submit clicked");

        const validationErrors = validateDonor(formData);
        console.log(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);

            const donorData = {
                ...formData,
                availability:
                    formData.availability === "Yes"
                        ? "Available"
                        : "Not Available",
            };

            console.log("Sending donor data:", donorData);

            await registerDonor(donorData);

            console.log("Saved Successfully");

            toast.success("Donor registered successfully!");

            navigate("/success");
        } catch (error) {
            console.error("Donor registration error:", error);

            toast.error(error.message || "Failed to register donor");
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
                            Blood Donor Registration
                        </h1>
                        <p className="mt-2">
                            Become a hero by donating blood and saving lives.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>
                                <label className="font-semibold">Full Name</label>
                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaUser className="text-red-500" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter Full Name"
                                        className="w-full p-3 outline-none"
                                        required
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.fullName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold">Email</label>
                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaEnvelope className="text-red-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter Email"
                                        className="w-full p-3 outline-none"
                                        required
                                    />

                                    {errors.email && (
                                        <p className="text-red-500 text-sm">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold">Phone</label>
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
                                        <p className="text-red-500 text-sm">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold">Gender</label>
                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaVenusMars className="text-red-500" />
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="text-red-500 text-sm">
                                            {errors.gender}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold">Date of Birth</label>
                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaBirthdayCake className="text-red-500" />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                        required
                                    />
                                    {errors.dob && (
                                        <p className="text-red-500 text-sm">
                                            {errors.dob}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold">Blood Group</label>
                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaTint className="text-red-500" />
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className="w-full p-3 outline-none"
                                        required
                                    >
                                        <option value="">Select Blood Group</option>
                                        <option>A+</option>
                                        <option>A-</option>
                                        <option>B+</option>
                                        <option>B-</option>
                                        <option>AB+</option>
                                        <option>AB-</option>
                                        <option>O+</option>
                                        <option>O-</option>
                                    </select>
                                    {errors.bloodGroup && (
                                        <p className="text-red-500 text-sm">
                                            {errors.bloodGroup}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold">Weight (kg)</label>
                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaWeight className="text-red-500" />
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        placeholder="Enter Weight"
                                        className="w-full p-3 outline-none"
                                        required
                                    />
                                    {errors.weight && (
                                        <p className="text-red-500 text-sm">
                                            {errors.weight}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold">Last Donation Date</label>
                                <input
                                    type="date"
                                    name="lastDonation"
                                    value={formData.lastDonation}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 mt-2"
                                />
                                {errors.lastDonation && (
                                    <p className="text-red-500 text-sm">
                                        {errors.lastDonation}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="font-semibold">Address</label>
                                <div className="flex items-center border rounded-lg mt-2 px-3">
                                    <FaMapMarkerAlt className="text-red-500" />
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Enter Address"
                                        className="w-full p-3 outline-none resize-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 mt-2"
                                    required
                                />
                                {errors.city && (
                                    <p className="text-red-500 text-sm">
                                        {errors.city}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="font-semibold">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 mt-2"
                                    required
                                />
                                {errors.state && (
                                    <p className="text-red-500 text-sm">
                                        {errors.state}
                                    </p>
                                )}
                            </div>
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
                                    <p className="text-red-500 text-sm">
                                        {errors.pincode}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="font-semibold">
                                    Any Medical Conditions?
                                </label>
                                <input
                                    type="text"
                                    name="diseases"
                                    value={formData.diseases}
                                    onChange={handleChange}
                                    placeholder="If none, type 'No'"
                                    className="w-full border rounded-lg p-3 mt-2"
                                />
                                {errors.diseases && (
                                    <p className="text-red-500 text-sm">
                                        {errors.diseases}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="font-semibold">Available for Emergency?</label>
                                <select
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 mt-2"
                                >
                                    <option value="">Select</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                </select>
                                {errors.availability && (
                                    <p className="text-red-500 text-sm">
                                        {errors.availability}
                                    </p>
                                )}
                            </div>
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
                                        <p className="text-red-500 text-sm">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                            </div>
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
                                        <p className="text-red-500 text-sm">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </div>

                        <div className="text-center mt-10">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-10 py-3 rounded-lg flex items-center gap-2 mx-auto text-white transition duration-300 ${loading
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-red-700 hover:bg-red-800"
                                    }`}
                            >
                                <FaSave />

                                {loading ? "Registering..." : "Register as Donor"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default DonorRegistration;