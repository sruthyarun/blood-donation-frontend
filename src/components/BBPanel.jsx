
import {
    FaTint,
    FaHome,
    FaWarehouse,
    FaClipboardList,
    FaCalendarAlt,
    FaHeartbeat,
    FaBell,
    FaUser,
    FaSignOutAlt,
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/userSlice";
import { useSelector, useDispatch } from "react-redux";

function BloodBankPanel({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector(
        (state) => state.user.currentUser
    );

    const handleLogout = () => {
        dispatch(logoutUser());
        localStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("bloodBankToken");
        navigate("/login");
    };

    const links = [
        {
            to: "/bloodbank-dashboard",
            icon: FaHome,
            label: "Dashboard",
        },
        {
            to: "/bloodbank-inventory",
            icon: FaWarehouse,
            label: "Blood Inventory",
        },
        {
            to: "/bloodbank-bloodrequests",
            icon: FaClipboardList,
            label: "Blood Requests",
        },
        {
            to: "/bloodbank-donor-management",
            icon: FaCalendarAlt,
            label: "Donor Appointments",
        },
        {
            to: "/bloodbank-emergency",
            icon: FaHeartbeat,
            label: "Emergency Requests",
        },

        {
            to: "/bloodbank/completion-actions",
            icon: FaClipboardList,
            label: "Completion Actions",
        },
        {
            to: "/bloodbank-notifications",
            icon: FaBell,
            label: "Notifications",
        },
        {
            to: "/bloodbank-profile",
            icon: FaUser,
            label: "Profile",
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 bg-red-800 p-6 text-white">
                <div className="mb-8">
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <FaTint />
                        Blood Bank
                    </h1>

                    {user && (
                        <div className="mt-5 rounded-lg bg-red-700 p-3">
                            <p className="break-words font-semibold">
                                {user.bankName ||
                                    user.bloodBankName ||
                                    user.fullName ||
                                    "Blood Bank User"}
                            </p>

                            <p className="mt-1 break-all text-sm text-red-200">
                                {user.email}
                            </p>
                        </div>
                    )}
                </div>

                <nav className="space-y-5">
                    {links.map(({ to, icon: Icon, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-3 transition hover:text-yellow-300"
                        >
                            <Icon className="shrink-0" />
                            <span>{label}</span>
                        </Link>
                    ))}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-3 transition hover:text-yellow-300"
                    >
                        <FaSignOutAlt />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main page content */}
            <main className="min-w-0 flex-1">
                {children}
            </main>
        </div>
    );
}

export default BloodBankPanel;
