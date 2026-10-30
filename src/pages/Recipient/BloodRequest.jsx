
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FaUser,
    FaTint,
    FaHospital,
    FaCalendarAlt,
    FaPhoneAlt,
    FaNotesMedical,
    FaEnvelope,
} from "react-icons/fa";
import { toast } from "react-toastify";

import RecipientPanel from "../../components/RecipientPanel";
import API from "../../API/axiosInstance";

const initialFormData = {
    recipientId: "",
    recipientName: "",
    patientName: "",
    bloodGroup: "",
    units: "",
    requestToType: "Hospital",
    requestToId: "",
    requestToName: "",
    requiredDate: "",
    priority: "",
    email: "",
    phone: "",
    notes: "",
};

function BloodRequest() {
    const navigate = useNavigate();

    const reduxUser = useSelector(
        (state) => state.user?.currentUser
    );

    const [formData, setFormData] = useState(initialFormData);
    const [hospitals, setHospitals] = useState([]);
    const [bloodBanks, setBloodBanks] = useState([]);
    const [loadingDestinations, setLoadingDestinations] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const user = reduxUser?.recipient || reduxUser;

    const getRecipientId = (currentUser) =>
        String(
            currentUser?._id ||
            currentUser?.id ||
            currentUser?.userId ||
            currentUser?.recipientId ||
            ""
        );

    // Populate recipient details from Redux.
    useEffect(() => {
        if (!user) return;

        setFormData((previous) => ({
            ...previous,
            recipientId: getRecipientId(user),
            recipientName:
                user.fullName || user.name || "",
            patientName:
                user.fullName || user.name || "",
            bloodGroup: user.bloodGroup || "",
            email: user.email || "",
            phone: user.phone || "",
        }));
    }, [user]);

    // Load approved hospitals and blood banks.
    useEffect(() => {
        let cancelled = false;

        const fetchDestinations = async () => {
            setLoadingDestinations(true);

            try {
                const [hospitalResponse, bankResponse] =
                    await Promise.all([
                        API.get("/hospitals"),
                        API.get("/bloodBanks"),
                    ]);

                const extractList = (response) => {
                    const data = response.data;

                    if (Array.isArray(data)) return data;
                    if (Array.isArray(data?.hospitals)) return data.hospitals;
                    if (Array.isArray(data?.bloodBanks)) return data.bloodBanks;
                    if (Array.isArray(data?.data)) return data.data;

                    return [];
                };

                const hospitalList = extractList(hospitalResponse);
                const bankList = extractList(bankResponse);

                const approved = (item) =>
                    String(item.status || "")
                        .trim()
                        .toLowerCase() === "approved";

                if (!cancelled) {
                    setHospitals(hospitalList.filter(approved));
                    setBloodBanks(bankList.filter(approved));
                }
            } catch (error) {
                console.error(
                    "Failed to load request destinations:",
                    error.response?.data || error.message
                );

                if (!cancelled) {
                    toast.error(
                        "Unable to load hospitals and blood banks. Please check your backend."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingDestinations(false);
                }
            }
        };

        fetchDestinations();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => {
            if (name === "requestToType") {
                return {
                    ...previous,
                    requestToType: value,
                    requestToId: "",
                    requestToName: "",
                };
            }

            if (name === "requestToId") {
                const list =
                    previous.requestToType === "Hospital"
                        ? hospitals
                        : bloodBanks;

                const destination = list.find(
                    (item) =>
                        String(item._id || item.id) === value
                );

                const destinationName =
                    previous.requestToType === "Hospital"
                        ? destination?.hospitalName || destination?.name || ""
                        : destination?.bloodBankName ||
                        destination?.bankName ||
                        destination?.name ||
                        "";

                return {
                    ...previous,
                    requestToId: value,
                    requestToName: destinationName,
                };
            }

            return {
                ...previous,
                [name]: value,
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const recipientId = getRecipientId(user);

        if (!recipientId) {
            toast.error("Recipient ID is missing. Please log in again.");
            return;
        }

        if (!formData.recipientName || !formData.bloodGroup) {
            toast.error("Your name or blood group is missing from your profile.");
            return;
        }

        if (!formData.patientName.trim()) {
            toast.error("Please enter the patient name.");
            return;
        }

        if (!formData.requestToType || !formData.requestToId) {
            toast.error(
                `Please select an approved ${formData.requestToType === "Hospital"
                    ? "hospital"
                    : "blood bank"
                }.`
            );
            return;
        }

        if (
            !Number.isInteger(Number(formData.units)) ||
            Number(formData.units) < 1
        ) {
            toast.error("Enter a valid number of units.");
            return;
        }

        if (!formData.requiredDate) {
            toast.error("Please select the required date.");
            return;
        }

        const selectedDate = new Date(
            `${formData.requiredDate}T00:00:00`
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (
            Number.isNaN(selectedDate.getTime()) ||
            selectedDate < today
        ) {
            toast.error("Required date cannot be in the past.");
            return;
        }

        if (!formData.priority) {
            toast.error("Please select the priority.");
            return;
        }

        if (!formData.email.trim()) {
            toast.error("Your email address is missing.");
            return;
        }

        if (!formData.phone.trim()) {
            toast.error("Please enter your contact number.");
            return;
        }

        const payload = {
            recipientId,
            recipientName: formData.recipientName.trim(),
            patientName: formData.patientName.trim(),
            bloodGroup: formData.bloodGroup.trim().toUpperCase(),
            units: Number(formData.units),

            // Destination fields for the backend.
            requestToType: formData.requestToType,
            requestToId: formData.requestToId,
            requestToName: formData.requestToName,

            // Legacy field retained for compatibility with older pages.
            hospital:
                formData.requestToType === "Hospital"
                    ? formData.requestToName
                    : "",

            requiredDate: formData.requiredDate,
            priority: formData.priority,
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            notes: formData.notes.trim(),
        };

        try {
            setSubmitting(true);

            // Uses the existing MongoDB API helper.
            const response = await API.post("/bloodRequests", payload);

            toast.success(
                response.data?.message ||
                "Blood request submitted successfully!"
            );

            navigate("/my-requests");
        } catch (error) {
            console.error(
                "Blood request submission failed:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to submit blood request."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const destinations =
        formData.requestToType === "Hospital"
            ? hospitals
            : bloodBanks;

    const getDestinationName = (item) =>
        formData.requestToType === "Hospital"
            ? item.hospitalName || item.name || "Unnamed Hospital"
            : item.bloodBankName ||
            item.bankName ||
            item.name ||
            "Unnamed Blood Bank";

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <RecipientPanel />

            <main className="flex-1 min-w-0 p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-red-800 to-red-500 text-white p-6">
                        <h1 className="text-3xl font-bold">
                            Request Blood
                        </h1>
                        <p className="mt-2">
                            Send your blood requirement to a hospital or blood bank.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8"
                    >
                        <div>
                            <label className="font-semibold flex gap-2 mb-2">
                                <FaUser className="text-red-600" />
                                Patient Name
                            </label>
                            <input
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                                required
                            />
                        </div>

                        <div>
                            <label className="font-semibold flex gap-2 mb-2">
                                <FaTint className="text-red-600" />
                                Blood Group
                            </label>
                            <input
                                value={formData.bloodGroup}
                                readOnly
                                className="w-full border rounded-lg p-3 bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="font-semibold mb-2 block">
                                Units Required
                            </label>
                            <input
                                type="number"
                                name="units"
                                min="1"
                                step="1"
                                value={formData.units}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                                required
                            />
                        </div>

                        {/* Select destination type */}
                        <div>
                            <label className="font-semibold mb-2 block">
                                Request To
                            </label>
                            <select
                                name="requestToType"
                                value={formData.requestToType}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                                required
                            >
                                <option value="Hospital">Hospital</option>
                                <option value="Blood Bank">Blood Bank</option>
                            </select>
                        </div>

                        {/* Destination list changes with the selected type */}
                        <div className="md:col-span-2">
                            <label className="font-semibold flex gap-2 mb-2">
                                <FaHospital className="text-red-600" />
                                Select {formData.requestToType}
                            </label>

                            <select
                                name="requestToId"
                                value={formData.requestToId}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                                disabled={loadingDestinations}
                                required
                            >
                                <option value="">
                                    {loadingDestinations
                                        ? "Loading..."
                                        : `Select ${formData.requestToType}`}
                                </option>

                                {destinations.map((item) => (
                                    <option
                                        key={item._id || item.id}
                                        value={item._id || item.id}
                                    >
                                        {getDestinationName(item)}
                                        {item.city ? ` — ${item.city}` : ""}
                                    </option>
                                ))}
                            </select>

                            {!loadingDestinations &&
                                destinations.length === 0 && (
                                    <p className="text-sm text-red-600 mt-2">
                                        No approved {formData.requestToType.toLowerCase()} records found.
                                    </p>
                                )}
                        </div>

                        <div>
                            <label className="font-semibold flex gap-2 mb-2">
                                <FaCalendarAlt className="text-red-600" />
                                Required Date
                            </label>
                            <input
                                type="date"
                                name="requiredDate"
                                min={(() => {
                                    const d = new Date();
                                    d.setMinutes(
                                        d.getMinutes() -
                                        d.getTimezoneOffset()
                                    );
                                    return d.toISOString().slice(0, 10);
                                })()}
                                value={formData.requiredDate}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                                required
                            />
                        </div>

                        <div>
                            <label className="font-semibold mb-2 block">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                                required
                            >
                                <option value="">Select Priority</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Normal">Normal</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-semibold flex gap-2 mb-2">
                                <FaEnvelope className="text-red-600" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                className="w-full border rounded-lg p-3 bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="font-semibold flex gap-2 mb-2">
                                <FaPhoneAlt className="text-red-600" />
                                Contact Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="font-semibold flex gap-2 mb-2">
                                <FaNotesMedical className="text-red-600" />
                                Notes
                            </label>
                            <textarea
                                rows="4"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3"
                                placeholder="Enter additional details"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    loadingDestinations ||
                                    !getRecipientId(user)
                                }
                                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Blood Request"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default BloodRequest;
