import {
    FiUser,
    FiClipboard,
    FiDroplet,
    FiHeart,
} from "react-icons/fi";

function HowItWorks() {
    const steps = [
        {
            id: "1",
            icon: <FiUser size={34} />,
            title: "Register",
            description:
                "Create your donor account and provide basic information.",
        },
        {
            id: "2",
            icon: <FiClipboard size={34} />,
            title: "Eligibility Check",
            description:
                "Complete a quick health screening to ensure eligibility.",
        },
        {
            id: "3",
            icon: <FiDroplet size={34} />,
            title: "Donate at Center",
            description:
                "Visit our donation center and complete the process.",
        },
        {
            id: "4",
            icon: <FiHeart size={34} />,
            title: "Save a Life",
            description:
                "Your blood goes directly to patients in need.",
        },
    ];

    return (
        <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-gray-800">
                        How It Works
                    </h2>
                    <p className="text-gray-500 mt-3">
                        Simple steps to become a life-saver
                    </p>
                </div>
                <div className="relative">
                    <div className="absolute top-12 left-0 w-full h-[2px] bg-red-200"></div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className="flex flex-col items-center text-center relative"
                            >

                                <span className="absolute -top-8 right-[] text-red-600 font-semibold">
                                    {step.id}
                                </span>
                                <div className="w-20 h-20 rounded-full bg-red-600 shadow-lg flex items-center justify-center text-white z-10">
                                    {step.icon}
                                </div>
                                <h3 className="mt-6 text-xl font-bold text-gray-800">
                                    {step.title}
                                </h3>

                                <p className="mt-3 text-gray-500 text-sm leading-7 max-w-[220px]">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;