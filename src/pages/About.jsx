import {
    FaTint,
    FaHeartbeat,
    FaUsers,
    FaHospital,
    FaHandHoldingHeart,
    FaCalendarCheck,
    FaBoxes,
    FaExclamationTriangle,
    FaBullhorn,
    FaArrowRight,
    FaCheckCircle,
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function About() {
    const navigate = useNavigate();
    const services = [
        {
            icon: <FaUsers />,
            title: "Donor Management",
            text: "Register donors, manage profiles, check eligibility and maintain donation history.",
        },
        {
            icon: <FaBoxes />,
            title: "Blood Stock Management",
            text: "Track available, reserved, issued and expired blood units in real time.",
        },
        {
            icon: <FaHospital />,
            title: "Hospital Services",
            text: "Connect hospitals with blood banks and simplify blood request management.",
        },
        {
            icon: <FaCalendarCheck />,
            title: "Donation Appointments",
            text: "Allow donors to schedule and manage their blood donation appointments.",
        },
        {
            icon: <FaBullhorn />,
            title: "Blood Donation Campaigns",
            text: "Organize donation camps and allow donors to register for upcoming campaigns.",
        },
        {
            icon: <FaExclamationTriangle />,
            title: "Emergency Blood Support",
            text: "Handle urgent blood requirements and help hospitals find available blood quickly.",
        },
    ];

    return (
        <>
            <Navbar />

            <section className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-800 to-red-500 text-white">


                <div className="max-w-7xl mx-auto px-6 py-24 lg:py-28">

                    <div className="grid lg:grid-cols-2 gap-16 items-center">


                        <div>

                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-2 rounded-full mb-6">

                                <FaTint />

                                <span className="font-semibold">
                                    BLOOD DONATION MANAGEMENT
                                </span>

                            </div>

                            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">

                                Every Drop Has The Power To{" "}

                                <span className="text-red-200">
                                    Save A Life
                                </span>

                            </h1>

                            <p className="text-red-100 text-lg leading-8 mt-6 max-w-xl">

                                Our platform connects blood donors,
                                recipients, hospitals and blood banks
                                through one simple and reliable system.

                            </p>



                        </div>


                        <div className="relative flex justify-center">

                            <div className="absolute w-80 h-80 bg-red-400 rounded-full opacity-20 blur-2xl"></div>

                            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 text-center shadow-2xl">

                                <FaHandHoldingHeart className="text-8xl mx-auto text-red-100" />

                                <h2 className="text-5xl font-bold mt-6">
                                    1000+
                                </h2>

                                <p className="text-red-100 mt-2">
                                    Lives Impacted
                                </p>

                                <div className="grid grid-cols-3 gap-4 mt-8">

                                    <div className="bg-white/10 rounded-xl p-4">

                                        <FaUsers className="mx-auto text-2xl" />

                                        <p className="font-bold mt-2">
                                            Donors
                                        </p>

                                    </div>

                                    <div className="bg-white/10 rounded-xl p-4">

                                        <FaHospital className="mx-auto text-2xl" />

                                        <p className="font-bold mt-2">
                                            Hospitals
                                        </p>

                                    </div>
                                    <div className="bg-white/10 rounded-xl p-4">

                                        <FaTint className="mx-auto text-2xl" />

                                        <p className="font-bold mt-2">
                                            Blood Banks
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            <section className="py-20 bg-white">

                <div className="max-w-6xl mx-auto px-6 text-center">

                    <span className="text-red-600 font-bold tracking-wider">
                        ABOUT OUR PLATFORM
                    </span>

                    <h2 className="text-4xl font-bold text-gray-800 mt-4">
                        Making Blood Donation Simple & Accessible
                    </h2>

                    <p className="max-w-3xl mx-auto text-gray-500 leading-8 mt-6">

                        Our Blood Bank Management System is designed to
                        simplify the complete blood donation process.
                        From donor registration and appointment scheduling
                        to blood inventory and emergency requests, the
                        platform brings all essential services together.

                    </p>

                </div>

            </section>


            <section className="py-20 bg-gray-50">

                <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center mb-14">

                        <span className="bg-red-100 text-red-600 px-5 py-2 rounded-full font-semibold">
                            WHAT WE OFFER
                        </span>

                        <h2 className="text-4xl font-bold text-gray-800 mt-5">
                            Everything You Need in One Platform
                        </h2>

                        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                            A complete digital solution for managing
                            blood donation and blood bank operations.
                        </p>

                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">

                        {services.map((service, index) => (

                            <div
                                key={index}
                                className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition duration-300 border border-gray-100"
                            >

                                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl">

                                    {service.icon}

                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mt-6">
                                    {service.title}
                                </h3>

                                <p className="text-gray-500 leading-7 mt-3">
                                    {service.text}
                                </p>



                            </div>

                        ))}

                    </div>

                </div>

            </section>


            <section className="py-20 bg-white">

                <div className="max-w-7xl mx-auto px-6">

                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        <div>

                            <span className="text-red-600 font-bold">
                                SIMPLE PROCESS
                            </span>

                            <h2 className="text-4xl font-bold text-gray-800 mt-4">
                                How Our System Works
                            </h2>

                            <p className="text-gray-500 leading-7 mt-5">

                                We simplify the journey from blood donation
                                to blood distribution through a connected
                                digital platform.

                            </p>

                            <div className="space-y-6 mt-8">

                                <Process
                                    number="01"
                                    title="Register"
                                    text="Donors, recipients and hospitals create their profiles."
                                />

                                <Process
                                    number="02"
                                    title="Connect"
                                    text="Hospitals and recipients can submit blood requirements."
                                />

                                <Process
                                    number="03"
                                    title="Manage"
                                    text="Blood banks monitor donations and available inventory."
                                />

                                <Process
                                    number="04"
                                    title="Save Lives"
                                    text="Required blood reaches patients when they need it."
                                />

                            </div>

                        </div>


                        <div className="bg-gradient-to-br from-red-700 to-red-500 rounded-3xl p-10 text-white shadow-2xl">

                            <FaHeartbeat className="text-6xl mb-7" />

                            <h3 className="text-3xl font-bold">
                                Why Blood Donation Matters
                            </h3>

                            <p className="text-red-100 leading-8 mt-5">

                                Blood cannot be manufactured. It can only
                                come from generous donors. A single donation
                                can become a valuable resource for patients
                                undergoing surgery, treatment or emergency
                                care.

                            </p>

                            <div className="mt-8 space-y-4">

                                <Benefit text="Help patients in emergencies" />

                                <Benefit text="Support hospitals and healthcare centers" />

                                <Benefit text="Contribute to your community" />

                                <Benefit text="Become a lifesaving donor" />

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            <section className="py-20 bg-red-50">

                <div className="max-w-6xl mx-auto px-6">

                    <div className="text-center mb-12">

                        <span className="text-red-600 font-bold">
                            OUR IMPACT
                        </span>

                        <h2 className="text-4xl font-bold text-gray-800 mt-4">
                            Together We Can Make A Difference
                        </h2>

                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

                        <Impact
                            number="1000+"
                            label="Lives Impacted"
                        />

                        <Impact
                            number="500+"
                            label="Registered Donors"
                        />

                        <Impact
                            number="50+"
                            label="Donation Campaigns"
                        />

                        <Impact
                            number="25+"
                            label="Partner Hospitals"
                        />

                    </div>

                </div>

            </section>


            <section className="py-20 bg-gradient-to-r from-red-900 to-red-600 text-white">

                <div className="max-w-4xl mx-auto px-6 text-center">

                    <FaHandHoldingHeart className="text-6xl mx-auto text-red-200" />

                    <h2 className="text-4xl font-bold mt-6">
                        Our Mission
                    </h2>

                    <p className="text-red-100 text-lg leading-8 mt-6">

                        To create a connected and efficient blood donation
                        ecosystem where donors can contribute easily,
                        hospitals can manage blood requirements efficiently,
                        and patients can receive the blood they need
                        without unnecessary delays.

                    </p>

                </div>

            </section>


            <section className="py-20 bg-white">

                <div className="max-w-5xl mx-auto px-6 text-center">

                    <div className="bg-gray-50 rounded-3xl p-10 lg:p-14 shadow-sm">

                        <FaTint className="text-5xl text-red-600 mx-auto" />

                        <h2 className="text-4xl font-bold text-gray-800 mt-5">
                            Be Someone's Reason to Live
                        </h2>

                        <p className="text-gray-500 max-w-2xl mx-auto mt-4 leading-7">

                            Your decision to donate blood today could make
                            a life-saving difference tomorrow.

                        </p>

                        <button onClick={() => navigate("/register/donor")}
                            className="mt-8 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold transition"
                        >

                            Become a Blood Donor

                        </button>

                    </div>

                </div>

            </section >

        </>
    );
}



function Process({ number, title, text }) {

    return (
        <div className="flex gap-5">

            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                {number}
            </div>

            <div>

                <h3 className="text-xl font-bold text-gray-800">
                    {title}
                </h3>

                <p className="text-gray-500 mt-1">
                    {text}
                </p>

            </div>

        </div>
    );
}


function Benefit({ text }) {

    return (
        <div className="flex items-center gap-3">

            <FaCheckCircle className="text-red-200" />

            <span>
                {text}
            </span>

        </div>
    );
}


function Impact({ number, label }) {

    return (
        <div className="bg-white rounded-2xl p-7 text-center shadow-sm">

            <h3 className="text-4xl font-bold text-red-600">
                {number}
            </h3>

            <p className="text-gray-500 mt-2">
                {label}
            </p>

        </div>
    );
}


export default About;