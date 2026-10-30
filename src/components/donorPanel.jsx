import {
    FaTint,
    FaCalendarAlt,
    FaHistory,
    FaBell,
    FaUser,
    FaSignOutAlt,
    FaHome,
    FaHeartbeat,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/userSlice";
import { useSelector, useDispatch } from "react-redux";
function DonorPanel() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logoutUser());
        localStorage.removeItem("loggedInUser");
        navigate("/login");
    };
    return (

        <div className="w-64 bg-red-800 text-white p-6">

            <h1 className="text-2xl font-bold flex items-center gap-2 mb-10">
                <FaTint />
                Donor Panel
            </h1>

            <nav className="space-y-4">

                <Link
                    to="/donor-dashboard"
                    className="flex items-center gap-3 hover:text-yellow-300"
                >
                    <FaHome />
                    Dashboard
                </Link>

                <Link
                    to="/notifications"
                    className="flex items-center gap-3 hover:text-yellow-300"
                >
                    <FaBell />
                    Notifications
                </Link>


                <Link
                    to="/appointments"
                    className="flex items-center gap-3 hover:text-yellow-300"
                >
                    <FaCalendarAlt />
                    Appointments
                </Link>

                <Link
                    to="/donationHistory"
                    className="flex items-center gap-3 hover:text-yellow-300"
                >
                    <FaHistory />
                    Donation History
                </Link>

                <Link
                    to="/emergencyRequests"
                    className="flex items-center gap-3 hover:text-yellow-300"
                >
                    <FaHeartbeat />
                    Emergency Requests
                </Link>


                <Link
                    to="/profile"
                    className="flex items-center gap-3 hover:text-yellow-300"
                >
                    <FaUser />
                    My Profile
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 hover:text-yellow-300"
                >
                    <FaSignOutAlt />
                    Logout
                </button>

            </nav>

        </div>
    );
}

export default DonorPanel;