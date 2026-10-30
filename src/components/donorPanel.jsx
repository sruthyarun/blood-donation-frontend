
import { useState } from "react";
import {
    FaTint,
    FaCalendarAlt,
    FaHistory,
    FaBell,
    FaUser,
    FaSignOutAlt,
    FaHome,
    FaHeartbeat,
    FaBars,
    FaTimes,
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/userSlice";
import { useSelector, useDispatch } from "react-redux";

function DonorPanel() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
        localStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("donorToken");
        setMenuOpen(false);
        navigate("/login");
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const menuItems = [
        {
            path: "/donor-dashboard",
            icon: <FaHome />,
            label: "Dashboard",
        },
        {
            path: "/notifications",
            icon: <FaBell />,
            label: "Notifications",
        },
        {
            path: "/appointments",
            icon: <FaCalendarAlt />,
            label: "Appointments",
        },
        {
            path: "/donationHistory",
            icon: <FaHistory />,
            label: "Donation History",
        },
        {
            path: "/emergencyRequests",
            icon: <FaHeartbeat />,
            label: "Emergency Requests",
        },
        {
            path: "/profile",
            icon: <FaUser />,
            label: "My Profile",
        },
    ];

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between bg-red-800 text-white p-4">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <FaTint />
                    Donor Panel
                </h1>

                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-2xl p-1"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {menuOpen && (
                <div
                    onClick={closeMenu}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50
                    h-screen w-64
                    bg-red-800 text-white
                    p-6
                    flex flex-col
                    transform transition-transform duration-300
                    lg:translate-x-0 lg:static lg:z-auto
                    lg:min-h-screen lg:shrink-0
                    ${menuOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >
                {/* Sidebar Heading */}
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FaTint />
                        Donor Panel
                    </h1>

                    <button
                        onClick={closeMenu}
                        className="text-xl lg:hidden"
                        aria-label="Close menu"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-5 flex-1">

                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeMenu}
                            className="flex items-center gap-3 hover:text-yellow-300 transition-colors"
                        >
                            <span className="text-lg">
                                {item.icon}
                            </span>

                            <span>{item.label}</span>
                        </Link>
                    ))}
                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 hover:text-yellow-300 transition-colors mt-8"
                    >
                        <FaSignOutAlt />
                        Logout
                    </button>
                </nav>



            </aside>
        </>
    );
}

export default DonorPanel;
