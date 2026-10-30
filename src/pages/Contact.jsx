
import { useState } from "react";

import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import axiosInstance from "../API/axiosInstance";

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

    // Handle input changes
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

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        const name = formData.name.trim();
        const email = formData.email.trim();
        const subject = formData.subject.trim();
        const message = formData.message.trim();

        if (!name) {
            newErrors.name = "Name is required";
        } else if (name.length < 3) {
            newErrors.name = "Name must contain at least 3 characters";
        } else if (!/^[A-Za-z\s]+$/.test(name)) {
            newErrors.name = "Name should contain only letters and spaces";
        }

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!subject) {
            newErrors.subject = "Subject is required";
        } else if (subject.length < 3) {
            newErrors.subject = "Subject must contain at least 3 characters";
        }

        if (!message) {
            newErrors.message = "Message is required";
        } else if (message.length < 10) {
            newErrors.message = "Message must contain at least 10 characters";
        } else if (message.length > 500) {
            newErrors.message = "Message cannot exceed 500 characters";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Submit feedback to MongoDB
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
                email: formData.email.trim().toLowerCase(),
                subject: formData.subject.trim(),
                message: formData.message.trim(),
                status: "New",
                createdAt: new Date().toISOString(),
            };

            // POST request using axiosInstance
            const response = await axiosInstance.post(
                "/feedback",
                feedbackData
            );

            if (response.data?.success === false) {
                throw new Error(
                    response.data.message || "Feedback submission failed"
                );
            }

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
                error.response?.data || error
            );

            setServerError(
                error.response?.data?.message ||
                error.message ||
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

                {/* Hero Section */}
                <section className="bg-gradient-to-r from-red-900 to-red-400 py-12 text-white sm:py-16">
                    <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
                        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
                            Contact Us
                        </h1>

                        <p className="text-base sm:text-lg">
                            We'd love to hear from you.
                            Feel free to contact us anytime.
                        </p>
                    </div>
                </section>

                {/* Contact Content */}
                <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-10">

                    {/* Contact Information */}
                    <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-8">
                        <h2 className="mb-6 text-xl font-bold text-red-600 sm:text-2xl">
                            Get In Touch
                        </h2>

                        <div className="space-y-6">

                            {/* Phone */}
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 rounded-full bg-red-100 p-3 sm:p-4">
                                    <FaPhoneAlt className="text-xl text-red-600" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-semibold">Phone</h3>
                                    <p className="break-words text-gray-600">
                                        +91 98765 43210
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 rounded-full bg-red-100 p-3 sm:p-4">
                                    <FaEnvelope className="text-xl text-red-600" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-semibold">Email</h3>
                                    <p className="break-all text-gray-600">
                                        support@givelife.com
                                    </p>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 rounded-full bg-red-100 p-3 sm:p-4">
                                    <FaMapMarkerAlt className="text-xl text-red-600" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-semibold">Address</h3>
                                    <p className="text-gray-600">
                                        Kochi, Kerala, India
                                    </p>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 rounded-full bg-red-100 p-3 sm:p-4">
                                    <FaClock className="text-xl text-red-600" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-semibold">Working Hours</h3>
                                    <p className="text-gray-600">
                                        Monday - Saturday
                                        <br />
                                        9:00 AM - 6:00 PM
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-8">
                        <h2 className="mb-6 text-xl font-bold text-red-600 sm:text-2xl">
                            Send a Message
                        </h2>

                        {/* Success Message */}
                        {success && (
                            <div
                                role="status"
                                className="mb-5 rounded-lg border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-700"
                            >
                                {success}
                            </div>
                        )}

                        {/* Server Error */}
                        {serverError && (
                            <div
                                role="alert"
                                className="mb-5 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700"
                            >
                                {serverError}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-5"
                        >

                            {/* Name */}
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    autoComplete="name"
                                    aria-invalid={!!errors.name}
                                    className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 sm:text-base ${errors.name
                                            ? "border-red-500 focus:ring-red-300"
                                            : "focus:border-red-500 focus:ring-red-200"
                                        }`}
                                />

                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address"
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 sm:text-base ${errors.email
                                            ? "border-red-500 focus:ring-red-300"
                                            : "focus:border-red-500 focus:ring-red-200"
                                        }`}
                                />

                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Subject */}
                            <div>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Subject"
                                    aria-invalid={!!errors.subject}
                                    className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 sm:text-base ${errors.subject
                                            ? "border-red-500 focus:ring-red-300"
                                            : "focus:border-red-500 focus:ring-red-200"
                                        }`}
                                />

                                {errors.subject && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.subject}
                                    </p>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <textarea
                                    rows={5}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Your Message"
                                    maxLength={500}
                                    aria-invalid={!!errors.message}
                                    className={`w-full resize-none rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 sm:text-base ${errors.message
                                            ? "border-red-500 focus:ring-red-300"
                                            : "focus:border-red-500 focus:ring-red-200"
                                        }`}
                                />

                                <div className="flex justify-between gap-2">
                                    <div>
                                        {errors.message && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.message}
                                            </p>
                                        )}
                                    </div>

                                    <p className="mt-1 shrink-0 text-sm text-gray-400">
                                        {formData.message.length}/500
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-red-800 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {loading ? "Sending..." : "Send Message"}
                            </button>

                        </form>
                    </div>

                </section>
            </div>
        </>
    );
}

export default Contact;
