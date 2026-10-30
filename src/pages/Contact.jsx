import { useState } from "react";
import axios from "axios";
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
} from "react-icons/fa";
import Navbar from "../components/Navbar";

const API_URL =
    "https://blood-donation-backend-olwl.onrender.com/feedback";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [serverError, setServerError] = useState("");

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

        setSuccess("");
        setServerError("");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 3) {
            newErrors.name =
                "Name must contain at least 3 characters";
        } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
            newErrors.name =
                "Name should contain only letters and spaces";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email.trim()
            )
        ) {
            newErrors.email =
                "Please enter a valid email address";
        }

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required";
        } else if (formData.subject.trim().length < 3) {
            newErrors.subject =
                "Subject must contain at least 3 characters";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        } else if (formData.message.trim().length < 10) {
            newErrors.message =
                "Message must contain at least 10 characters";
        } else if (formData.message.trim().length > 500) {
            newErrors.message =
                "Message cannot exceed 500 characters";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccess("");
        setServerError("");

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const feedbackData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                subject: formData.subject.trim(),
                message: formData.message.trim(),
                status: "New",
                createdAt: new Date().toISOString(),
            };

            await axios.post(API_URL, feedbackData);

            setSuccess(
                "Thank you! Your message has been submitted successfully."
            );

            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
            });

            setErrors({});
        } catch (error) {
            console.error(
                "Error submitting feedback:",
                error
            );

            setServerError(
                "Unable to send your message. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-100">

                <div className="bg-gradient-to-r from-red-900 to-red-400 text-white py-16">

                    <div className="max-w-6xl mx-auto px-6 text-center">

                        <h1 className="text-4xl font-bold mb-3">
                            Contact Us
                        </h1>

                        <p className="text-lg">
                            We'd love to hear from you.
                            Feel free to contact us anytime.
                        </p>

                    </div>

                </div>

                <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-10">

                    <div className="bg-white rounded-2xl shadow-lg p-8">

                        <h2 className="text-2xl font-bold text-red-600 mb-6">
                            Get In Touch
                        </h2>

                        <div className="space-y-6">

                            <div className="flex items-center gap-4">

                                <div className="bg-red-100 p-4 rounded-full">
                                    <FaPhoneAlt className="text-red-600 text-xl" />
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        Phone
                                    </h3>

                                    <p className="text-gray-600">
                                        +91 98765 43210
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center gap-4">

                                <div className="bg-red-100 p-4 rounded-full">
                                    <FaEnvelope className="text-red-600 text-xl" />
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        Email
                                    </h3>

                                    <p className="text-gray-600">
                                        support@givelife.com
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center gap-4">

                                <div className="bg-red-100 p-4 rounded-full">
                                    <FaMapMarkerAlt className="text-red-600 text-xl" />
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        Address
                                    </h3>

                                    <p className="text-gray-600">
                                        Kochi, Kerala, India
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center gap-4">

                                <div className="bg-red-100 p-4 rounded-full">
                                    <FaClock className="text-red-600 text-xl" />
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        Working Hours
                                    </h3>

                                    <p className="text-gray-600">
                                        Monday - Saturday
                                        <br />
                                        9:00 AM - 6:00 PM
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">

                        <h2 className="text-2xl font-bold text-red-600 mb-6">
                            Send a Message
                        </h2>


                        {success && (
                            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-5">
                                {success}
                            </div>
                        )}


                        {serverError && (
                            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-5">
                                {serverError}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-5"
                        >


                            <div>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${errors.name
                                        ? "border-red-500 focus:ring-red-300"
                                        : "focus:border-red-500 focus:ring-red-200"
                                        }`}
                                />

                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}

                            </div>

                            <div>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address"
                                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${errors.email
                                        ? "border-red-500 focus:ring-red-300"
                                        : "focus:border-red-500 focus:ring-red-200"
                                        }`}
                                />

                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            <div>

                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Subject"
                                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${errors.subject
                                        ? "border-red-500 focus:ring-red-300"
                                        : "focus:border-red-500 focus:ring-red-200"
                                        }`}
                                />

                                {errors.subject && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.subject}
                                    </p>
                                )}

                            </div>


                            <div>

                                <textarea
                                    rows="5"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Your Message"
                                    maxLength="500"
                                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 resize-none ${errors.message
                                        ? "border-red-500 focus:ring-red-300"
                                        : "focus:border-red-500 focus:ring-red-200"
                                        }`}
                                />

                                <div className="flex justify-between">

                                    {errors.message ? (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.message}
                                        </p>
                                    ) : (
                                        <span></span>
                                    )}

                                    <p className="text-gray-400 text-sm mt-1">
                                        {formData.message.length}/500
                                    </p>

                                </div>

                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-800 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
                            >
                                {loading
                                    ? "Sending..."
                                    : "Send Message"}
                            </button>

                        </form>

                    </div>

                </div>

            </div>
        </>
    );
}

export default Contact;