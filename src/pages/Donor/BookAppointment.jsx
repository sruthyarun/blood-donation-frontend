
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import DonorPanel from "../../components/donorPanel";
import axiosInstance from "../../API/axiosInstance";

// Supported appointment times
const TIME_SLOTS = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
];

function getLocalDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Handles APIs that return either an array or { data: [...] }
function extractArray(response) {
    const result = response?.data;

    if (Array.isArray(result)) {
        return result;
    }

    if (Array.isArray(result?.data)) {
        return result.data;
    }

    if (Array.isArray(result?.hospitals)) {
        return result.hospitals;
    }

    if (Array.isArray(result?.bloodBanks)) {
        return result.bloodBanks;
    }

    return [];
}

function getDestinationId(item) {
    return String(item?._id || item?.id || "");
}

function getDestinationName(item, type) {
    if (type === "Hospital") {
        return (
            item?.hospitalName ||
            item?.name ||
            item?.destinationName ||
            ""
        );
    }

    return (
        item?.bloodBankName ||
        item?.bankName ||
        item?.name ||
        item?.destinationName ||
        ""
    );
}

function getDestinationLocation(item) {
    return (
        item?.district ||
        item?.city ||
        item?.address?.district ||
        item?.address?.city ||
        ""
    );
}

function getUserName(user) {
    return (
        user?.fullName ||
        user?.donorName ||
        user?.name ||
        ""
    );
}

function BookAppointment() {
    const user = useSelector((state) => state.user.currentUser);

    const [destinationType, setDestinationType] = useState("Hospital");
    const [hospitals, setHospitals] = useState([]);
    const [bloodBanks, setBloodBanks] = useState([]);

    const [loadingDestinations, setLoadingDestinations] = useState(true);
    const [destinationError, setDestinationError] = useState("");

    const [formData, setFormData] = useState({
        destinationId: "",
        district: "",
        date: "",
        time: "",
        phone: "",
        notes: "",
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const destinations = useMemo(() => {
        return destinationType === "Hospital"
            ? hospitals
            : bloodBanks;
    }, [destinationType, hospitals, bloodBanks]);

    const selectedDestination = useMemo(() => {
        return destinations.find(
            (item) =>
                getDestinationId(item) === formData.destinationId
        );
    }, [destinations, formData.destinationId]);

    // Load hospitals and blood banks from MongoDB-backed APIs.
    useEffect(() => {
        let active = true;

        async function loadDestinations() {
            setLoadingDestinations(true);
            setDestinationError("");

            try {
                const results = await Promise.allSettled([
                    axiosInstance.get("/hospitals"),
                    axiosInstance.get("/bloodBanks"),
                ]);

                if (!active) return;

                const hospitalResult = results[0];
                const bloodBankResult = results[1];

                if (hospitalResult.status === "fulfilled") {
                    const hospitalData = extractArray(
                        hospitalResult.value
                    );

                    setHospitals(
                        hospitalData.filter(
                            (item) =>
                                item.status?.toLowerCase() !==
                                "rejected"
                        )
                    );
                } else {
                    console.error(
                        "Failed to load hospitals:",
                        hospitalResult.reason?.response?.data ||
                        hospitalResult.reason?.message
                    );

                    setHospitals([]);
                }

                if (bloodBankResult.status === "fulfilled") {
                    const bloodBankData = extractArray(
                        bloodBankResult.value
                    );

                    setBloodBanks(
                        bloodBankData.filter(
                            (item) =>
                                item.status?.toLowerCase() !==
                                "rejected"
                        )
                    );
                } else {
                    console.error(
                        "Failed to load blood banks:",
                        bloodBankResult.reason?.response?.data ||
                        bloodBankResult.reason?.message
                    );

                    setBloodBanks([]);
                }

                if (
                    hospitalResult.status === "rejected" &&
                    bloodBankResult.status === "rejected"
                ) {
                    setDestinationError(
                        "Unable to load hospitals and blood banks. Please check your backend connection."
                    );
                }
            } catch (error) {
                if (!active) return;

                console.error("Destination loading error:", error);

                setDestinationError(
                    "Unable to load destinations. Please try again."
                );
            } finally {
                if (active) {
                    setLoadingDestinations(false);
                }
            }
        }

        loadDestinations();

        return () => {
            active = false;
        };
    }, []);

    // Update the selected destination when the destination type changes.
    useEffect(() => {
        setFormData((previous) => ({
            ...previous,
            destinationId: "",
            district: "",
        }));

        setErrors({});
        setSubmitError("");
        setSuccessMessage("");
    }, [destinationType]);

    // Automatically populate the district when possible.
    useEffect(() => {
        if (!selectedDestination) return;

        const location = getDestinationLocation(selectedDestination);

        if (location) {
            setFormData((previous) => ({
                ...previous,
                district: location,
            }));
        }
    }, [selectedDestination]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setSubmitError("");
        setSuccessMessage("");
    }

    function validateForm() {
        const newErrors = {};

        if (!user) {
            newErrors.user = "Please log in as a donor before booking.";
        }

        if (!getUserName(user)) {
            newErrors.donorName =
                "Your donor name is missing. Please check your profile.";
        }

        if (!(user?.email || user?.donorEmail)) {
            newErrors.donorEmail =
                "Your email is missing. Please check your profile.";
        }

        if (!user?.bloodGroup) {
            newErrors.bloodGroup =
                "Your blood group is missing from your profile.";
        }

        if (!formData.destinationId) {
            newErrors.destinationId =
                "Please select a destination.";
        }

        if (!selectedDestination) {
            newErrors.destinationId =
                "Please select a valid destination.";
        }

        if (!formData.district.trim()) {
            newErrors.district = "District is required.";
        }

        if (!formData.date) {
            newErrors.date = "Please select an appointment date.";
        } else if (formData.date < getLocalDate()) {
            newErrors.date =
                "Appointment date cannot be in the past.";
        }

        if (!formData.time) {
            newErrors.time = "Please select a time slot.";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required.";
        }

        return newErrors;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSubmitError("");
        setSuccessMessage("");

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setSubmitError(
                "Please correct the highlighted form fields."
            );
            return;
        }

        setErrors({});
        setSubmitting(true);

        const destinationName = getDestinationName(
            selectedDestination,
            destinationType
        );

        const destinationId = getDestinationId(
            selectedDestination
        );

        const email = String(
            user?.email || user?.donorEmail || ""
        )
            .trim()
            .toLowerCase();

        // Field names match backend/routes/appointmentRoutes.js
        const payload = {
            donorId: String(user?._id || user?.id || ""),
            donorName: getUserName(user).trim(),
            donorEmail: email,
            email,
            bloodGroup: String(user?.bloodGroup || "").trim(),
            district: formData.district.trim(),

            destinationType,
            destinationId,
            destinationName,

            hospital:
                destinationType === "Hospital"
                    ? destinationName
                    : "",

            hospitalId:
                destinationType === "Hospital"
                    ? destinationId
                    : "",

            bloodBankId:
                destinationType === "BloodBank"
                    ? destinationId
                    : "",

            bloodBankName:
                destinationType === "BloodBank"
                    ? destinationName
                    : "",

            date: formData.date,
            time: formData.time,
            phone: formData.phone.trim(),
            notes: formData.notes.trim(),
            status: "Pending",
        };

        console.log("Appointment request payload:", payload);

        try {
            const response = await axiosInstance.post(
                "/appointments",
                payload
            );

            console.log(
                "Appointment booking response:",
                response.data
            );

            setSuccessMessage(
                response.data?.message ||
                "Appointment booked successfully!"
            );

            setFormData({
                destinationId: "",
                district: "",
                date: "",
                time: "",
                phone: "",
                notes: "",
            });
        } catch (error) {
            const responseData = error.response?.data;

            console.error("Appointment booking failed:", {
                status: error.response?.status,
                response: responseData,
                message: error.message,
                payload,
            });

            // Display field-level errors when the backend supplies them.
            if (Array.isArray(responseData?.missingFields)) {
                const backendErrors = {};

                responseData.missingFields.forEach((field) => {
                    backendErrors[field] =
                        `${field} is required by the server.`;
                });

                setErrors((previous) => ({
                    ...previous,
                    ...backendErrors,
                }));
            }

            if (Array.isArray(responseData?.errors)) {
                const backendErrors = {};

                responseData.errors.forEach((item) => {
                    if (item.field) {
                        backendErrors[item.field] = item.message;
                    }
                });

                setErrors((previous) => ({
                    ...previous,
                    ...backendErrors,
                }));
            }

            setSubmitError(
                responseData?.message ||
                responseData?.error ||
                "Failed to book appointment. Please check the form and try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100";

    const labelClass =
        "mb-1.5 block text-sm font-medium text-gray-700";

    function renderError(field) {
        if (!errors[field]) return null;

        return (
            <p className="mt-1 text-sm text-red-600">
                {errors[field]}
            </p>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <DonorPanel />

            <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                            Book an Appointment
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            Schedule a blood donation appointment
                            at a hospital or blood bank.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
                        {successMessage && (
                            <div
                                role="status"
                                className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
                            >
                                {successMessage}
                            </div>
                        )}

                        {submitError && (
                            <div
                                role="alert"
                                className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                            >
                                <p className="font-semibold">
                                    {submitError}
                                </p>

                                {errors.user && (
                                    <p className="mt-1">
                                        {errors.user}
                                    </p>
                                )}
                            </div>
                        )}

                        {destinationError && (
                            <div
                                role="alert"
                                className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                            >
                                {destinationError}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-5"
                        >
                            {/* Donor details */}
                            <section>
                                <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800">
                                    Donor Details
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>
                                            Donor Name
                                        </label>

                                        <input
                                            className={`${inputClass} bg-gray-50`}
                                            value={getUserName(user)}
                                            readOnly
                                        />

                                        {renderError("donorName")}
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            className={`${inputClass} bg-gray-50`}
                                            value={
                                                user?.email ||
                                                user?.donorEmail ||
                                                ""
                                            }
                                            readOnly
                                        />

                                        {renderError("donorEmail")}
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Blood Group
                                        </label>

                                        <input
                                            className={`${inputClass} bg-gray-50`}
                                            value={user?.bloodGroup || ""}
                                            readOnly
                                        />

                                        {renderError("bloodGroup")}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className={labelClass}
                                        >
                                            Phone Number *
                                        </label>

                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Enter phone number"
                                            autoComplete="tel"
                                        />

                                        {renderError("phone")}
                                    </div>
                                </div>
                            </section>

                            {/* Destination details */}
                            <section>
                                <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800">
                                    Appointment Location
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>
                                            Appointment At *
                                        </label>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDestinationType(
                                                        "Hospital"
                                                    )
                                                }
                                                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${destinationType ===
                                                        "Hospital"
                                                        ? "border-red-600 bg-red-50 text-red-700"
                                                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                Hospital
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDestinationType(
                                                        "BloodBank"
                                                    )
                                                }
                                                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${destinationType ===
                                                        "BloodBank"
                                                        ? "border-red-600 bg-red-50 text-red-700"
                                                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                Blood Bank
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="destinationId"
                                            className={labelClass}
                                        >
                                            Select{" "}
                                            {destinationType ===
                                                "Hospital"
                                                ? "Hospital"
                                                : "Blood Bank"}{" "}
                                            *
                                        </label>

                                        <select
                                            id="destinationId"
                                            name="destinationId"
                                            value={
                                                formData.destinationId
                                            }
                                            onChange={handleChange}
                                            className={inputClass}
                                            disabled={
                                                loadingDestinations
                                            }
                                        >
                                            <option value="">
                                                {loadingDestinations
                                                    ? "Loading destinations..."
                                                    : `Select a ${destinationType ===
                                                        "Hospital"
                                                        ? "hospital"
                                                        : "blood bank"
                                                    }`}
                                            </option>

                                            {destinations.map(
                                                (item) => {
                                                    const id =
                                                        getDestinationId(
                                                            item
                                                        );

                                                    const name =
                                                        getDestinationName(
                                                            item,
                                                            destinationType
                                                        );

                                                    if (!id || !name) {
                                                        return null;
                                                    }

                                                    return (
                                                        <option
                                                            key={id}
                                                            value={id}
                                                        >
                                                            {name}
                                                            {getDestinationLocation(
                                                                item
                                                            )
                                                                ? ` - ${getDestinationLocation(
                                                                    item
                                                                )}`
                                                                : ""}
                                                        </option>
                                                    );
                                                }
                                            )}
                                        </select>

                                        {!loadingDestinations &&
                                            destinations.length ===
                                            0 && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    No{" "}
                                                    {destinationType ===
                                                        "Hospital"
                                                        ? "hospitals"
                                                        : "blood banks"}{" "}
                                                    were returned by the
                                                    API.
                                                </p>
                                            )}

                                        {renderError("destinationId")}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="district"
                                            className={labelClass}
                                        >
                                            District *
                                        </label>

                                        <input
                                            id="district"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Enter district"
                                        />

                                        {renderError("district")}
                                    </div>
                                </div>
                            </section>

                            {/* Date and time */}
                            <section>
                                <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800">
                                    Date and Time
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="date"
                                            className={labelClass}
                                        >
                                            Appointment Date *
                                        </label>

                                        <input
                                            id="date"
                                            name="date"
                                            type="date"
                                            min={getLocalDate()}
                                            value={formData.date}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />

                                        {renderError("date")}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="time"
                                            className={labelClass}
                                        >
                                            Time Slot *
                                        </label>

                                        <select
                                            id="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Select time
                                            </option>

                                            {TIME_SLOTS.map((slot) => (
                                                <option
                                                    key={slot}
                                                    value={slot}
                                                >
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>

                                        {renderError("time")}
                                    </div>
                                </div>
                            </section>

                            {/* Additional notes */}
                            <section>
                                <label
                                    htmlFor="notes"
                                    className={labelClass}
                                >
                                    Additional Notes (Optional)
                                </label>

                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Enter any additional information"
                                />
                            </section>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    loadingDestinations
                                }
                                className="w-full rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting
                                    ? "Booking Appointment..."
                                    : "Book Appointment"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default BookAppointment;
