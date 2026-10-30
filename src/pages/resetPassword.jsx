import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaLock, FaArrowLeft, FaKey } from "react-icons/fa";

function ResetPassword() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    if (!state) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-red-600">
                        Invalid Request
                    </h2>

                    <p className="text-gray-500 mt-3">
                        Password reset session expired.
                    </p>

                    <Link
                        to="/forgot-password"
                        className="text-red-600 mt-5 inline-block hover:underline"
                    >
                        Go Back
                    </Link>
                </div>
            </div>
        );
    }

    const { user, role } = state;

    const handleReset = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const updatedUser = {
            ...user,
            password,
        };

        try {
            const response = await fetch(
                `http://localhost:5000/${role}/${user.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedUser),
                }
            );

            if (response.ok) {
                alert("Password updated successfully.");
                navigate("/login");
            } else {
                alert("Failed to update password.");
            }
        } catch (error) {
            console.log(error);
            alert("Something went wrong.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

                <Link
                    to="/forgot-password"
                    className="flex items-center gap-2 text-red-600 mb-6 hover:underline"
                >
                    <FaArrowLeft />
                    Back
                </Link>

                <div className="text-center">

                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <FaKey className="text-4xl text-red-600" />
                    </div>

                    <h1 className="text-3xl font-bold mt-5">
                        Reset Password
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Enter your new password.
                    </p>

                </div>

                <form
                    onSubmit={handleReset}
                    className="space-y-5 mt-8"
                >

                    <div className="relative">

                        <FaLock className="absolute left-4 top-4 text-gray-400" />

                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded-lg pl-11 py-3 outline-none focus:border-red-600"
                            required
                        />

                    </div>

                    <div className="relative">

                        <FaLock className="absolute left-4 top-4 text-gray-400" />

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            className="w-full border rounded-lg pl-11 py-3 outline-none focus:border-red-600"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
                    >
                        Reset Password
                    </button>

                </form>

            </div>

        </div>
    );
}

export default ResetPassword;