import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/userSlice";
import login from "../assets/login.jpg";
import { FaArrowLeft } from "react-icons/fa";
import axiosInstance from "../API/axiosInstance";

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loginData, setLoginData] = useState({
        role: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value,
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!loginData.role) {
            alert("Please select a role.");
            return;
        }

        // Admin login through the MongoDB backend
        if (loginData.role === "Admin") {
            try {
                const response = await axiosInstance.post(
                    "/admin/login",
                    {
                        email: loginData.email.trim(),
                        password: loginData.password,
                    }
                );

                const { success, token, admin } = response.data;

                if (!success || !token || admin?.role !== "admin") {
                    alert("Invalid admin login response.");
                    return;
                }

                // Store the token for the current browser session
                sessionStorage.setItem("adminToken", token);

                // Keep your existing Redux login flow
                const user = {
                    ...admin,
                    role: "Admin",
                };

                dispatch(loginUser(user));

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                alert("Admin login successful!");
                navigate("/admin-dashboard");
            } catch (error) {
                console.error(
                    "Admin login error:",
                    error.response?.data || error.message
                );

                alert(
                    error.response?.data?.message ||
                    "Admin login failed. Please check your credentials."
                );
            }

            return;
        }

        if (loginData.role === "Donor") {
            try {
                const response = await axiosInstance.post(
                    "/auth/donor/login",
                    {
                        email: loginData.email.trim(),
                        password: loginData.password,
                    }
                );

                const { success, token, user } = response.data;

                if (!success || !token || !user) {
                    alert("Invalid login response.");
                    return;
                }

                sessionStorage.setItem("donorToken", token);

                dispatch(loginUser(user));

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                alert("Donor login successful!");
                navigate("/donor-dashboard");
            } catch (error) {
                console.error("Donor login status:", error.response?.status);
                console.error("Donor login response:", error.response?.data);
                console.error("Donor login error:", error.message);

                alert(
                    error.response?.data?.message ||
                    "Unable to log in. Please check your credentials."
                );
            }

            return;
        }

        // Recipient login through the MongoDB backend
        if (loginData.role === "Recipient") {
            try {
                const response = await axiosInstance.post(
                    "/auth/recipient/login",
                    {
                        email: loginData.email.trim(),
                        password: loginData.password,
                    }
                );

                const { success, token, user } = response.data;

                if (
                    !success ||
                    !token ||
                    !user ||
                    user.role !== "Recipient"
                ) {
                    alert("Invalid recipient login response.");
                    return;
                }

                sessionStorage.setItem("recipientToken", token);

                dispatch(loginUser(user));

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                alert("Recipient login successful!");
                navigate("/recipient-dashboard");
            } catch (error) {
                console.error(
                    "Recipient login status:",
                    error.response?.status
                );

                console.error(
                    "Recipient login response:",
                    error.response?.data
                );

                alert(
                    error.response?.data?.message ||
                    "Recipient login failed. Please check your credentials."
                );
            }

            return;
        }

        if (loginData.role === "Hospital") {
            try {
                const response = await axiosInstance.post(
                    "/auth/hospital/login",
                    {
                        email: loginData.email.trim(),
                        password: loginData.password,
                    }
                );

                const { success, token, user } = response.data;

                if (!success || !token || !user) {
                    alert("Invalid hospital login response.");
                    return;
                }

                sessionStorage.setItem("hospitalToken", token);

                const hospitalUser = {
                    ...user,
                    role: "Hospital",
                };

                dispatch(loginUser(hospitalUser));

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(hospitalUser)
                );

                alert("Hospital login successful!");
                navigate("/hospital-dashboard");
            } catch (error) {
                console.error(
                    "Hospital login error:",
                    error.response?.data || error.message
                );

                alert(
                    error.response?.data?.message ||
                    "Hospital login failed. Please check your credentials."
                );
            }

            return;
        }



        // Blood Bank login through MongoDB Atlas
        if (loginData.role === "Blood Bank") {
            try {
                const response = await axiosInstance.post(
                    "/auth/bloodbank/login",
                    {
                        email: loginData.email.trim().toLowerCase(),
                        password: loginData.password,
                    }
                );

                // Backend returns "bloodBank", not "user"

                const { success, token, user, message } = response.data;

                if (!success || !token || !user) {
                    console.error("Invalid Blood Bank login response:", response.data);
                    alert(message || "Invalid Blood Bank login response.");
                    return;
                }

                const bloodBankUser = {
                    ...user,
                    id: user._id || user.id,
                    role: "Blood Bank",
                };


                // Save the authentication token
                sessionStorage.setItem("bloodBankToken", token);

                // Update Redux
                dispatch(loginUser(bloodBankUser));

                // Save the logged-in user
                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(bloodBankUser)
                );

                alert("Blood Bank login successful!");

                navigate("/bloodbank-dashboard");
            } catch (error) {
                console.error(
                    "Blood Bank login status:",
                    error.response?.status
                );

                console.error(
                    "Blood Bank login response:",
                    error.response?.data || error.message
                );

                alert(
                    error.response?.data?.message ||
                    "Blood Bank login failed. Please check your credentials."
                );
            }

            return;
        }


        // Other roles need their own backend login endpoints.
        alert(
            `${loginData.role} login is not yet connected to the MongoDB authentication API.`
        );
    };

    return (
        <>

            <div className="min-h-screen bg-gradient-to-r from-red-100 via-white to-pink-100 flex items-center justify-center px-4">

                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

                    {/* Left Section */}
                    <div
                        className="bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${login})`,
                        }}
                    >
                        <div className="w-full h-full bg-red-900/50 flex items-center justify-center p-8">
                            <div className="text-center text-white">
                                <h1 className="text-4xl font-bold">
                                    Blood Donation System
                                </h1>

                                <p className="mt-6 text-lg leading-8">
                                    Every Login Supports a Life.
                                    <br />
                                    Together we can save lives by donating blood.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="p-10">


                        <h2 className="text-3xl font-bold text-gray-700 mb-2">
                            Welcome Back
                        </h2>


                        <p className="text-gray-500 mb-8">
                            Login to your account
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {/* Role */}
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Login As
                                </label>

                                <select
                                    name="role"
                                    value={loginData.role}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="Donor">Donor</option>
                                    <option value="Recipient">Recipient</option>
                                    <option value="Hospital">Hospital</option>
                                    <option value="Blood Bank">Blood Bank</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={loginData.email}
                                    onChange={handleChange}
                                    placeholder="Enter Email"
                                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleChange}
                                    placeholder="Enter Password"
                                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" />
                                    Remember Me
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-red-600 hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
                            >
                                Login
                            </button>
                        </form>

                        <p className="text-center mt-6">
                            Don't have an account?

                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium m-4"
                            >
                                <FaArrowLeft />
                                Back to Register
                            </Link>
                        </p>

                    </div>

                </div>



            </div >
        </>
    );
}

export default Login;