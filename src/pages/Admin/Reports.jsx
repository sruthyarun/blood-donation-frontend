import { useEffect, useState } from "react";
import axios from "axios";
import {
    FaUsers,
    FaUserInjured,
    FaHospital,
    FaTint,
    FaCalendarAlt,
    FaClipboardList,
    FaExclamationTriangle,
    FaFilePdf,
    FaFileExcel,
} from "react-icons/fa";
import AdminPanel from "../../components/AdminPanel";

function Reports() {
    const [donors, setDonors] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [bloodBanks, setBloodBanks] = useState([]);
    const [bloodInventory, setBloodInventory] = useState([]);
    const [bloodRequests, setBloodRequests] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [emergencyRequests, setEmergencyRequests] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [
                donorRes,
                recipientRes,
                hospitalRes,
                bankRes,
                inventoryRes,
                requestRes,
                appointmentRes,
                emergencyRes,
            ] = await Promise.all([
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/donors"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/recipients"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/hospitals"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/bloodBanks"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/bloodInventory"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/bloodRequests"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/appointments"),
                axios.get("https://blood-donation-backend-olwl.onrender.com/api/emergencyRequests"),
            ]);

            setDonors(donorRes.data);
            setRecipients(recipientRes.data);
            setHospitals(hospitalRes.data);
            setBloodBanks(bankRes.data);
            setBloodInventory(inventoryRes.data);
            setBloodRequests(requestRes.data);
            setAppointments(appointmentRes.data);
            setEmergencyRequests(emergencyRes.data);
        } catch (err) {
            console.log(err);
        }
    };

    const totalBloodUnits = bloodInventory.reduce(
        (sum, item) => sum + Number(item.units || 0),
        0
    );

    const approvedDonors = donors.filter(
        (d) => d.status === "Approved"
    ).length;

    const pendingRequests = bloodRequests.filter(
        (r) => r.status === "Pending"
    ).length;

    const completedAppointments = appointments.filter(
        (a) => a.status === "Completed"
    ).length;

    return (
        <div className="min-h-screen bg-gray-100 flex">

            <AdminPanel />
            <div className="min-h-screen bg-gray-100 p-8 flex-1">


                <div className="flex justify-between items-center mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Reports & Analytics
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Blood Donation System Statistics
                        </p>
                    </div>

                    {/* <div className="flex gap-3">

                        <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg flex items-center gap-2">
                            <FaFilePdf />
                            Export PDF
                        </button>

                        <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg flex items-center gap-2">
                            <FaFileExcel />
                            Export Excel
                        </button>

                    </div> */}

                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">


                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                            <FaUsers className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {donors.length}
                            </h2>
                            <p className="text-gray-500 text-sm">Total Donors</p>
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
                        <div className="bg-green-100 text-green-600 p-4 rounded-full">
                            <FaUserInjured className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {recipients.length}
                            </h2>
                            <p className="text-gray-500 text-sm">Recipients</p>
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
                        <div className="bg-red-100 text-red-600 p-4 rounded-full">
                            <FaHospital className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {hospitals.length}
                            </h2>
                            <p className="text-gray-500 text-sm">Hospitals</p>
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
                        <div className="bg-pink-100 text-pink-600 p-4 rounded-full">
                            <FaTint className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {totalBloodUnits}
                            </h2>
                            <p className="text-gray-500 text-sm">Blood Units</p>
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
                        <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
                            <FaCalendarAlt className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {appointments.length}
                            </h2>
                            <p className="text-gray-500 text-sm">Appointments</p>
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
                        <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full">
                            <FaClipboardList className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {bloodRequests.length}
                            </h2>
                            <p className="text-gray-500 text-sm">Blood Requests</p>
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
                        <div className="bg-orange-100 text-orange-600 p-4 rounded-full">
                            <FaExclamationTriangle className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {emergencyRequests.length}
                            </h2>
                            <p className="text-gray-500 text-sm">Emergency Requests</p>
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-4">
                        <div className="bg-rose-100 text-rose-600 p-4 rounded-full">
                            <FaHospital className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {bloodBanks.length}
                            </h2>
                            <p className="text-gray-500 text-sm">Blood Banks</p>
                        </div>
                    </div>

                </div>



                <div className="grid md:grid-cols-2 gap-6 mt-8">

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-red-700 mb-4">
                            System Summary
                        </h2>

                        <div className="w-[90%] mx-auto space-y-4">

                            <div className="flex justify-between">
                                <span>Approved Donors</span>
                                <span className="font-bold text-green-600">
                                    {approvedDonors}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Pending Blood Requests</span>
                                <span className="font-bold text-yellow-600">
                                    {pendingRequests}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Completed Appointments</span>
                                <span className="font-bold text-blue-600">
                                    {completedAppointments}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Blood Banks</span>
                                <span className="font-bold text-red-600">
                                    {bloodBanks.length}
                                </span>
                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-xl shadow-md p-4">
                        <h2 className="text-lg font-semibold text-red-600 mb-3">
                            Blood Inventory
                        </h2>

                        <div className="w-[90%] mx-auto space-y-2">
                            {bloodInventory.map((blood) => (
                                <div
                                    key={blood.id}
                                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg"
                                >
                                    <span className="font-medium text-gray-700">
                                        {blood.bloodGroup}
                                    </span>

                                    <span
                                        className={`text-sm font-bold px-2 py-1 rounded-full ${blood.units <= 5
                                            ? "bg-red-100 text-red-600"
                                            : blood.units <= 10
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-green-100 text-green-600"
                                            }`}
                                    >
                                        {blood.units} Units
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>

            </div >
        </div >
    );
}

export default Reports;