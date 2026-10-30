
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    FaHome,
    FaTint,
    FaUsers,
    FaClipboardList,
    FaCalendarAlt,
    FaBell,
    FaExclamationTriangle,
    FaUser,
    FaSignOutAlt,
    FaHospital,
} from "react-icons/fa";
import { logoutUser } from "../redux/userSlice";
import { useSelector, useDispatch } from "react-redux";
function HospitalPanel() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logoutUser());
        localStorage.removeItem("loggedInUser");
        navigate("/login");
    };
    return (

        <aside className="w-64 bg-red-800 text-white p-6">

            <h1 className="text-2xl font-bold flex items-center gap-2 mb-10">
                <FaHospital />
                Hospital
            </h1>

            <nav className="space-y-5">

                <Link to="/hospital-dashboard" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaHome />
                    Dashboard
                </Link>

                <Link to="/blood-inventory" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaTint />
                    Blood Inventory
                </Link>

                <Link to="/blood-requests" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaClipboardList />
                    Blood Requests
                </Link>

                <Link to="/donor-management" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaUsers />
                    Donor's Appointments
                </Link>

                <Link to="/hospital-emergency" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaExclamationTriangle />
                    Emergency Requests
                </Link>
                <Link to="/blood-donation-camps" className="flex items-center gap-3 hover:text-yellow-300">

                    <FaCalendarAlt />Blood Donation Camps
                </Link>

                <Link to="/hospital/completion-actions" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaClipboardList />
                    Completion Actions
                </Link>

                <Link to="/notifications-hospital" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaBell />
                    Notifications
                </Link>

                <Link to="/hospital-profile" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaUser />
                    Profile
                </Link>

                <Link to="/" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaSignOutAlt />
                    Logout
                </Link>

            </nav>

        </aside>
    );
}

export default HospitalPanel;