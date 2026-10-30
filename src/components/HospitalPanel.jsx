
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

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
    FaBars,
    FaTimes,
} from "react-icons/fa";

import { logoutUser } from "../redux/userSlice";
import { useDispatch } from "react-redux";

function HospitalPanel() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());

        localStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("hospitalToken");

        setMenuOpen(false);
        navigate("/login");
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const menuItems = [
        {
            path: "/hospital-dashboard",
            icon: <FaHome />,
            label: "Dashboard",
        },
        {
            path: "/blood-inventory",
            icon: <FaTint />,
            label: "Blood Inventory",
        },
        {
            path: "/blood-requests",
            icon: <FaClipboardList />,
            label: "Blood Requests",
        },
        {
            path: "/donor-management",
            icon: <FaUsers />,
            label: "Donor's Appointments",
        },
        {
            path: "/hospital-emergency",
            icon: <FaExclamationTriangle />,
            label: "Emergency Requests",
        },
        {
            path: "/blood-donation-camps",
            icon: <FaCalendarAlt />,
            label: "Blood Donation Camps",
        },
        {
            path: "/hospital/completion-actions",
            icon: <FaClipboardList />,
            label: "Completion Actions",
        },
        {
            path: "/notifications-hospital",
            icon: <FaBell />,
            label: "Notifications",
        },
        {
            path: "/hospital-profile",
            icon: <FaUser />,
            label: "Profile",
        },
    ];

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between bg-red-800 text-white p-4">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <FaHospital />
                    Hospital
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
                    bg-red-800 text-white p-6
                    flex flex-col
                    overflow-y-auto
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
                        <FaHospital />
                        Hospital
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
                            <span className="text-lg shrink-0">
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

export default HospitalPanel;
