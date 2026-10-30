import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
    FaUsers,
    FaHospital,
    FaTint,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaUserInjured,
    FaClipboardList,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";

function AdminDashboard() {

    const [donors, setDonors] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [bloodBanks, setBloodBanks] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [bloodRequests, setBloodRequests] = useState([]);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const [
                donorRes,
                recipientRes,
                hospitalRes,
                bloodBankRes,
                appointmentRes,
                requestRes,
            ] = await Promise.all([
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/donors"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/recipients"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/hospitals"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/bloodBanks"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/appointments"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/bloodRequests"),
            ]);

            setDonors(donorRes.data);
            setRecipients(recipientRes.data);
            setHospitals(hospitalRes.data);
            setAppointments(appointmentRes.data);
            setBloodRequests(requestRes.data);
            setBloodBanks(bloodBankRes.data);

        } catch (err) {
            console.log(err);
        }
    };

    const emergencyCount = bloodRequests.filter(
        (item) => item.priority === "Emergency"
    ).length;

    const pendingCount = bloodRequests.filter(
        (item) => item.status === "Pending"
    ).length;

    const today = new Date().toLocaleDateString();

    const todayAppointments = appointments.filter(
        (item) =>
            new Date(item.date).toLocaleDateString() === today
    ).length;

    const activities = [
        ...donors.map((d) => ({
            activity: "New Donor Registered",
            user: d.fullName,
            time: d.createdAt || "-",
        })),

        ...hospitals.map((h) => ({
            activity: "Hospital Registered",
            user: h.hospitalName,
            time: h.createdAt || "-",
        })),

        ...bloodRequests.map((b) => ({
            activity: "Blood Request",
            user: b.patientName,
            time: b.createdAt || "-",
        })),
    ].slice(-8).reverse();

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />

            <main className="flex-1 p-8">

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Admin Dashboard
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Welcome back! Here's an overview of your Blood Donation Management System.
                    </p>

                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                        <FaUsers className="text-blue-600 text-4xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {donors.length}
                        </h2>
                        <p className="text-gray-500">Total Donors</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                        <FaUserInjured className="text-green-600 text-4xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {recipients.length}
                        </h2>
                        <p className="text-gray-500">Recipients</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                        <FaHospital className="text-red-600 text-4xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {hospitals.length}
                        </h2>
                        <p className="text-gray-500">Hospitals</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                        <FaTint className="text-pink-600 text-4xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {bloodBanks.length}
                        </h2>
                        <p className="text-gray-500">Blood Banks</p>
                    </div>

                </div>


                <div className="grid md:grid-cols-3 gap-6 mt-8">

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                        <FaClipboardList className="text-yellow-500 text-3xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {
                                bloodRequests.filter(
                                    (item) => item.status === "Pending"
                                ).length
                            }
                        </h2>
                        <p className="text-gray-500">Pending Requests</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                        <FaExclamationTriangle className="text-red-600 text-3xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {
                                bloodRequests.filter(
                                    (item) =>
                                        item.priority === "Critical" ||
                                        item.status === "Emergency"
                                ).length
                            }
                        </h2>
                        <p className="text-gray-500">Emergency Requests</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                        <FaCalendarAlt className="text-blue-600 text-3xl mb-3" />
                        <h2 className="text-3xl font-bold">
                            {
                                appointments.filter(
                                    (item) =>
                                        item.status === "Approved" ||
                                        item.status === "Confirmed"
                                ).length
                            }
                        </h2>
                        <p className="text-gray-500">Appointments</p>
                    </div>

                </div>


                < div className="mt-10" >

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Recent Activities
                        </h2>

                        <span className="text-sm text-gray-500">
                            Last 24 Hours
                        </span>
                    </div>

                    <div className="space-y-5">

                        {activities.map((item) => (

                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 p-5 border-l-4 border-red-600"
                            >

                                <div className="flex items-start justify-between">

                                    <div className="flex gap-4">

                                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">

                                            <FaClipboardList className="text-red-600 text-xl" />

                                        </div>

                                        <div>

                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {item.activity}
                                            </h3>

                                            <p className="text-gray-600 mt-1">
                                                {item.user}
                                            </p>

                                        </div>

                                    </div>

                                    <span className="text-sm text-gray-500">
                                        {item.time}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                </div >

            </main >

        </div >
    );
}

export default AdminDashboard;