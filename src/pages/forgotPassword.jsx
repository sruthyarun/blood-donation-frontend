import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaKey } from "react-icons/fa";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const roles = [
            "donors",
            "recipients",
            "hospitals",
            "bloodBanks",
            "admins",
        ];

        let userFound = false;

        for (let role of roles) {
            const response = await fetch(
                `https://blood-donation-backend-olwl.onrender.com/api/${role}?email=${email}`
            );
            const data = await response.json();

            if (data.length > 0) {
                userFound = true;
                navigate("/reset-password", {
                    state: {
                        user: data[0],
                        role,
                    },
                });
                break;
            }
        }

        if (!userFound) {
            alert("Email not found.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

                <Link
                    to="/login"
                    className="flex items-center gap-2 text-red-600 mb-6"
                >
                    <FaArrowLeft />
                    Back to Login
                </Link>

                <div className="text-center">

                    <FaKey className="text-5xl text-red-600 mx-auto mb-4" />

                    <h2 className="text-3xl font-bold">
                        Forgot Password
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Enter your registered email.
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                >

                    <div className="relative">

                        <FaEnvelope className="absolute left-3 top-4 text-gray-400" />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-lg pl-10 py-3 outline-none focus:border-red-600"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                    >
                        Continue
                    </button>

                </form>

            </div>

        </div>
    );
}

export default ForgotPassword;