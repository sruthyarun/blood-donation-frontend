import { Link } from "react-router-dom";
import {
    FaCheckCircle,
    FaHospital,
    FaCalendarAlt,
    FaClock,
    FaTint,
    FaMapMarkerAlt,
} from "react-icons/fa";

function AppointmentConfirmation() {

    const appointment = {
        appointmentId: "APT10254",
        hospital: "City Hospital",
        bloodGroup: "A+",
        units: "2 Units",
        date: "28 July 2026",
        time: "10:30 AM",
        location: "Kochi",
        status: "Confirmed",
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
            <div className="bg-white shadow-xl rounded-2xl w-full max-w-3xl overflow-hidden">
                <div className="bg-green-600 text-white text-center py-8">
                    <FaCheckCircle className="text-7xl mx-auto mb-4" />
                    <h1 className="text-3xl font-bold">
                        Appointment Booked Successfully
                    </h1>
                    <p className="mt-2">
                        Your appointment has been confirmed.
                    </p>
                </div>
                <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="font-semibold">Appointment ID</p>
                            <p>{appointment.appointmentId}</p>
                        </div>
                        <div>
                            <p className="font-semibold flex items-center gap-2">
                                <FaHospital className="text-red-600" />
                                Hospital
                            </p>

                            <p>{appointment.hospital}</p>
                        </div>

                        <div>
                            <p className="font-semibold flex items-center gap-2">
                                <FaTint className="text-red-600" />
                                Blood Group
                            </p>

                            <p>{appointment.bloodGroup}</p>
                        </div>

                        <div>
                            <p className="font-semibold">
                                Units Required
                            </p>

                            <p>{appointment.units}</p>
                        </div>

                        <div>
                            <p className="font-semibold flex items-center gap-2">
                                <FaCalendarAlt className="text-red-600" />
                                Date
                            </p>

                            <p>{appointment.date}</p>
                        </div>

                        <div>
                            <p className="font-semibold flex items-center gap-2">
                                <FaClock className="text-red-600" />
                                Time
                            </p>

                            <p>{appointment.time}</p>
                        </div>

                        <div>
                            <p className="font-semibold flex items-center gap-2">
                                <FaMapMarkerAlt className="text-red-600" />
                                Location
                            </p>

                            <p>{appointment.location}</p>
                        </div>

                        <div>
                            <p className="font-semibold">
                                Status
                            </p>

                            <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full">
                                {appointment.status}
                            </span>
                        </div>

                    </div>

                    <div className="flex flex-wrap gap-4 mt-10">

                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
                            Download Receipt
                        </button>

                        <Link
                            to="/myappointments"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                        >
                            My Appointments
                        </Link>

                        <Link
                            to="/recipient"
                            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppointmentConfirmation;