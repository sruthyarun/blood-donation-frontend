
import { useState } from "react";

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
    FaBars,
    FaTimes,
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/userSlice";
import { useSelector, useDispatch } from "react-redux";

function BloodBankPanel({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [menuOpen, setMenuOpen] = useState(false);

    const user = useSelector(
        (state) => state.user.currentUser
    );

    const handleLogout = () => {
        dispatch(logoutUser());

        localStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("bloodBankToken");

        setMenuOpen(false);
        navigate("/login");
    };

    const closeMenu = () => {
        setMenuOpen(false);
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
        <div className="min-h-screen bg-gray-100">

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between bg-red-800 p-4 text-white">

                <h1 className="flex items-center gap-2 text-xl font-bold">
                    <FaTint />
                    Blood Bank
                </h1>

                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1 text-2xl"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>

            </div>

            {/* Mobile Overlay */}
            {menuOpen && (
                <div
                    onClick={closeMenu}
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                />
            )}

            <div className="flex min-h-screen flex-col lg:flex-row">

                {/* Sidebar */}
                <aside
                    className={`
                        fixed left-0 top-0 z-50
                        flex h-screen w-64 flex-col
                        overflow-y-auto
                        bg-red-800 p-6 text-white
                        transform transition-transform duration-300
                        lg:sticky lg:top-0 lg:translate-x-0
                        lg:z-auto lg:shrink-0
                        ${menuOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                        }
                    `}
                >

                    {/* Sidebar Heading */}
                    <div className="mb-8">

                        <div className="mb-8 flex items-center justify-between">

                            <h1 className="flex items-center gap-2 text-2xl font-bold">
                                <FaTint />
                                Blood Bank
                            </h1>

                            <button
                                type="button"
                                onClick={closeMenu}
                                className="text-xl lg:hidden"
                                aria-label="Close menu"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        {/* Blood Bank User Information */}
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

                    {/* Navigation */}
                    <nav className="flex-1 space-y-5">

                        {links.map(({ to, icon: Icon, label }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={closeMenu}
                                className="flex items-center gap-3 transition-colors hover:text-yellow-300"
                            >
                                <Icon className="shrink-0 text-lg" />

                                <span>{label}</span>
                            </Link>
                        ))}
                        {/* Logout */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-8 flex items-center gap-3 transition-colors hover:text-yellow-300"
                        >
                            <FaSignOutAlt />
                            Logout
                        </button>
                    </nav>



                </aside>

                {/* Main Page Content */}
                <main className="min-w-0 flex-1">
                    {children}
                </main>

            </div>
        </div>
    );
}

export default BloodBankPanel;
