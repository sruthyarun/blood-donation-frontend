import { Link } from "react-router-dom";
import { FaCheckCircle, FaHome, FaSignInAlt, FaHeartbeat } from "react-icons/fa";

function SuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-100 to-red-200 px-4">

            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-10 text-center animate-fade-in">

                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                        <FaCheckCircle className="text-green-600 text-6xl" />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-4xl font-bold text-green-700 mt-6">
                    Registration Successful!
                </h1>

                {/* Message */}
                <p className="text-gray-600 mt-4 leading-7">
                    Congratulations!
                    <br />
                    Your account has been created successfully.
                </p>



                {/* Buttons */}
                <div className="flex justify-center gap-4 mt-8">

                    <Link
                        to="/"
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300 hover:scale-105"
                    >
                        <FaHome />
                        Home
                    </Link>

                    <Link
                        to="/login"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300 hover:scale-105"
                    >
                        <FaSignInAlt />
                        Login
                    </Link>

                </div>

                {/* Footer */}
                <p className="mt-8 text-gray-400 text-sm">
                    Thank you for joining our Blood Donation Management System.
                </p>

            </div>

        </div>
    );
}

export default SuccessPage;