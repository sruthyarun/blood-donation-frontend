import { useEffect, useState } from "react";
import axios from "axios";
import {
    FaSearch,
    FaUser,
    FaHospital,
    FaTint,
    FaCalendarAlt,
    FaClock,
    FaEye,
    FaCheck,
    FaTimes,
    FaTrash,
} from "react-icons/fa";
import AdminPanel from "../../components/AdminPanel";
function AppointmentManagementADm() {
    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get(
                "https://blood-donation-backend-olwl.onrender.com/appointments"
            );
            setAppointments(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredAppointments = appointments.filter((appointment) =>
        (appointment.donor || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (appointment.recipient || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (appointment.hospital || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (appointment.bloodGroup || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed":
                return "bg-green-100 text-green-700";
            case "Completed":
                return "bg-blue-100 text-blue-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };
    const updateStatus = async (id, status) => {
        const appointment = appointments.find((a) => a.id === id);

        await axios.put(
            `https://blood-donation-backend-olwl.onrender.com/api/appointments/${id}`,
            {
                ...appointment,
                status,
            }
        );

        fetchAppointments();
    };
    const deleteAppointment = async (id) => {
        if (!window.confirm("Delete this appointment?")) return;

        await axios.delete(
            `https://blood-donation-backend-olwl.onrender.com/api/appointments/${id}`
        );

        fetchAppointments();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />
            <div className="min-h-screen bg-gray-100 p-8 flex-1">


                <div className="flex flex-col md:flex-row justify-between items-center mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Appointment Management
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Manage all donor and recipient appointments.
                        </p>
                    </div>

                    <div className="flex items-center bg-white rounded-lg shadow px-4 py-3 mt-4 md:mt-0">
                        <FaSearch className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search appointment..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="ml-2 outline-none"
                        />
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
                        <h3 className="text-gray-500">Total Appointments</h3>
                        <h2 className="text-4xl font-bold text-red-600 mt-2">
                            {appointments.length}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                        <h3 className="text-gray-500">Pending</h3>
                        <h2 className="text-4xl font-bold text-yellow-600 mt-2">
                            {appointments.filter(a => a.status === "Pending").length}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
                        <h3 className="text-gray-500">Confirmed</h3>
                        <h2 className="text-4xl font-bold text-green-600 mt-2">
                            {appointments.filter(a => a.status === "Confirmed").length}
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
                        <h3 className="text-gray-500">Completed</h3>
                        <h2 className="text-4xl font-bold text-blue-600 mt-2">
                            {appointments.filter(a => a.status === "Completed").length}
                        </h2>
                    </div>

                </div>

                <div className="space-y-5">

                    {filteredAppointments.map((appointment) => (

                        <div
                            key={appointment.id}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 p-6"
                        >

                            <div className="flex flex-col lg:flex-row justify-between gap-6">


                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 flex-1">

                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Appointment ID
                                        </p>
                                        <h3 className="font-bold text-gray-800">
                                            {appointment.id}
                                        </h3>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Donor
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            <FaUser className="text-red-600" />
                                            {appointment.donorName}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Recipient
                                        </p>

                                        <h3 className="font-medium">
                                            {appointment.recipientName}
                                        </h3>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Hospital
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            <FaHospital className="text-red-600" />
                                            {appointment.hospital}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Blood Group
                                        </p>

                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-semibold">
                                            <FaTint className="inline mr-1" />
                                            {appointment.bloodGroup}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Date
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            <FaCalendarAlt className="text-red-600" />
                                            {appointment.date}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Time
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            <FaClock className="text-red-600" />
                                            {appointment.time}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Status
                                        </p>

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                                appointment.status
                                            )}`}
                                        >
                                            {appointment.status}
                                        </span>
                                    </div>

                                </div>

                                <div className="flex lg:flex-col justify-center gap-3">

                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
                                    >
                                        <FaEye />
                                    </button>

                                    {appointment.status === "Pending" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    appointment.id,
                                                    "Confirmed"
                                                )
                                            }
                                            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg"
                                        >
                                            <FaCheck />
                                        </button>
                                    )}

                                    {appointment.status === "Confirmed" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    appointment.id,
                                                    "Completed"
                                                )
                                            }
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg text-white"
                                        >
                                            Done
                                        </button>
                                    )}

                                    {(appointment.status === "Pending" ||
                                        appointment.status === "Confirmed") && (
                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        appointment.id,
                                                        "Cancelled"
                                                    )
                                                }
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}

                                    <button
                                        onClick={() =>
                                            deleteAppointment(appointment.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg"
                                    >
                                        <FaTrash />
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>
            </div>
        </div >

    );
}

export default AppointmentManagementADm;