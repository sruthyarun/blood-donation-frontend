import {
    FaHeart,
    FaShieldAlt,
    FaHandsHelping,
    FaHeartbeat,
    FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function WhyDonate() {
    const navigate = useNavigate();

    const data = [
        {
            icon: <FaHeart />,
            title: "Save Lives",
            text: "A single blood donation can save up to three lives and bring hope to families in need.",
            color: "from-red-500 to-red-700",
        },
        {
            icon: <FaShieldAlt />,
            title: "Safe Process",
            text: "Every donation follows strict medical standards ensuring complete donor safety.",
            color: "from-blue-500 to-indigo-600",
        },
        {
            icon: <FaHandsHelping />,
            title: "Community Support",
            text: "Support hospitals during emergencies and become a hero in your community.",
            color: "from-green-500 to-emerald-600",
        },
        {
            icon: <FaHeartbeat />,
            title: "Healthy Habit",
            text: "Regular blood donation promotes health monitoring and social responsibility.",
            color: "from-pink-500 to-rose-600",
        },
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-red-50 via-white to-red-50">

            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center">

                    <span className="text-red-600 font-semibold uppercase tracking-widest">
                        Why Choose Us
                    </span>

                    <h2 className="text-5xl font-extrabold text-gray-800 mt-3">
                        Why Donate Blood?
                    </h2>

                    <p className="text-gray-600 mt-5 max-w-3xl mx-auto text-lg">
                        Every blood donation is a priceless gift that saves
                        lives, supports hospitals, and strengthens communities.
                    </p>

                </div>

                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-16">

                    {data.map((item, index) => (

                        <div
                            key={index}
                            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 overflow-hidden"
                        >

                            <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>

                            <div className="p-8 text-center">

                                <div
                                    className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${item.color} text-white flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition`}
                                >
                                    {item.icon}
                                </div>

                                <h3 className="text-2xl font-bold mt-6">
                                    {item.title}
                                </h3>

                                <p className="text-gray-600 mt-4 leading-7">
                                    {item.text}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>



            </div>

        </section>
    );
}

export default WhyDonate;