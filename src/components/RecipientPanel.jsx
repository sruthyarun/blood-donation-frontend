import {
    FaHome,
    FaTint,
    FaHospital,
    FaBell,
    FaUser,
    FaSignOutAlt,
    FaHeartbeat,
    FaClipboardList,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/userSlice";
import { useSelector, useDispatch } from "react-redux";

function RecipientPanel() {
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
                <FaTint />
                Recipient
            </h1>

            <nav className="space-y-5">

                <Link to="/recipient-dashboard" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaHome />
                    Dashboard
                </Link>

                <Link to="/recipient-emergency" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaHeartbeat />
                    Emergency Request
                </Link>

                <Link to="/my-requests" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaClipboardList />
                    My Requests
                </Link>



                <Link to="/Rnotifications" className="flex items-center gap-3 hover:text-yellow-300">
                    <FaBell />
                    Notifications
                </Link>

                <Link to="/Rprofile" className="flex items-center gap-3 hover:text-yellow-300">
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

export default RecipientPanel;