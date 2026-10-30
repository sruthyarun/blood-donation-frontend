import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/userSlice";
import login from "../assets/login.jpg";
import { FaArrowLeft } from "react-icons/fa";
import axiosInstance from "../API/axiosInstance";
import Swal from "sweetalert2";

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

    // SUCCESS POPUP
    const showLoginSuccess = (role, dashboard) => {
        Swal.fire({
            icon: "success",
            title: "Login Successful!",
            text: `Welcome back! You are logged in as ${role}.`,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then(() => {
            navigate(dashboard);
        });
    };

    // ERROR POPUP
    const showLoginError = (message) => {
        Swal.fire({
            icon: "error",
            title: "Login Failed!",
            text: message,
            confirmButtonText: "Try Again",
            confirmButtonColor: "#dc2626",
            allowOutsideClick: false,
        });
    };

    // WARNING POPUP
    const showLoginWarning = (message) => {
        Swal.fire({
            icon: "warning",
            title: "Attention!",
            text: message,
            confirmButtonText: "OK",
            confirmButtonColor: "#dc2626",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDATION
        if (!loginData.role) {
            showLoginWarning("Please select a role.");
            return;
        }

        if (!loginData.email.trim()) {
            showLoginWarning("Please enter your email address.");
            return;
        }

        if (!loginData.password) {
            showLoginWarning("Please enter your password.");
            return;
        }

        // ADMIN LOGIN
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
                    showLoginError("Invalid admin login response.");
                    return;
                }

                sessionStorage.setItem("adminToken", token);

                const user = {
                    ...admin,
                    role: "Admin",
                };

                dispatch(loginUser(user));

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                showLoginSuccess("Admin", "/admin-dashboard");

            } catch (error) {
                console.error(
                    "Admin login error:",
                    error.response?.data || error.message
                );

                showLoginError(
                    error.response?.data?.message ||
                    "Admin login failed. Please check your credentials."
                );
            }

            return;
        }

        // DONOR LOGIN
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
                    showLoginError("Invalid donor login response.");
                    return;
                }

                sessionStorage.setItem("donorToken", token);

                dispatch(loginUser(user));

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                showLoginSuccess("Donor", "/donor-dashboard");

            } catch (error) {
                console.error(
                    "Donor login status:",
                    error.response?.status
                );

                console.error(
                    "Donor login response:",
                    error.response?.data
                );

                showLoginError(
                    error.response?.data?.message ||
                    "Unable to log in. Please check your credentials."
                );
            }

            return;
        }

        // RECIPIENT LOGIN
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
                    showLoginError("Invalid recipient login response.");
                    return;
                }

                sessionStorage.setItem("recipientToken", token);

                dispatch(loginUser(user));

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                showLoginSuccess("Recipient", "/recipient-dashboard");

            } catch (error) {
                console.error(
                    "Recipient login status:",
                    error.response?.status
                );

                console.error(
                    "Recipient login response:",
                    error.response?.data
                );

                showLoginError(
                    error.response?.data?.message ||
                    "Recipient login failed. Please check your credentials."
                );
            }

            return;
        }

        // HOSPITAL LOGIN
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
                    showLoginError("Invalid hospital login response.");
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

                showLoginSuccess("Hospital", "/hospital-dashboard");

            } catch (error) {
                console.error(
                    "Hospital login error:",
                    error.response?.data || error.message
                );

                showLoginError(
                    error.response?.data?.message ||
                    "Hospital login failed. Please check your credentials."
                );
            }

            return;
        }

        // BLOOD BANK LOGIN
        if (loginData.role === "Blood Bank") {
            try {
                const response = await axiosInstance.post(
                    "/auth/bloodbank/login",
                    {
                        email: loginData.email.trim().toLowerCase(),
                        password: loginData.password,
                    }
                );

                const { success, token, user, message } = response.data;

                if (!success || !token || !user) {
                    console.error(
                        "Invalid Blood Bank login response:",
                        response.data
                    );

                    showLoginError(
                        message || "Invalid Blood Bank login response."
                    );

                    return;
                }

                const bloodBankUser = {
                    ...user,
                    id: user._id || user.id,
                    role: "Blood Bank",
                };

                sessionStorage.setItem("bloodBankToken", token);

                dispatch(loginUser(bloodBankUser));

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(bloodBankUser)
                );

                showLoginSuccess("Blood Bank", "/bloodbank-dashboard");

            } catch (error) {
                console.error(
                    "Blood Bank login status:",
                    error.response?.status
                );

                console.error(
                    "Blood Bank login response:",
                    error.response?.data || error.message
                );

                showLoginError(
                    error.response?.data?.message ||
                    "Blood Bank login failed. Please check your credentials."
                );
            }

            return;
        }

        // OTHER ROLES
        showLoginError(
            `${loginData.role} login is not yet connected to the MongoDB authentication API.`
        );
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-r from-red-100 via-white to-pink-100 flex items-center justify-center px-4">

                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

                    {/* LEFT SECTION */}
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

                    {/* RIGHT SECTION */}
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

                            {/* ROLE */}
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

                            {/* EMAIL */}
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

                            {/* PASSWORD */}
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

                            {/* REMEMBER ME AND FORGOT PASSWORD */}
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

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
                            >
                                Login
                            </button>

                        </form>

                        {/* REGISTER LINK */}
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

            </div>
        </>
    );
}

export default Login;