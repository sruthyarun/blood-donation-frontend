
import { useState } from "react";

import icon from "../assets/logo.jpg";

import { Link, NavLink, useNavigate } from "react-router-dom";

import Register from "./Register";

import {
    FaSignInAlt,
    FaBars,
    FaTimes,
} from "react-icons/fa";

function Navbar() {
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const navLinkClass = ({ isActive }) =>
        `transition duration-200 ${isActive
            ? "text-red-600 font-bold border-b-2 border-red-600 pb-1"
            : "text-gray-700 hover:text-red-600"
        }`;

    const navItems = [
        { to: "/", label: "Home" },
        { to: "/about", label: "About" },
        { to: "/contact", label: "Contact" },
        { to: "/emergency", label: "Emergency" },
        { to: "/campaigns", label: "Campaigns" },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm">

            {/* Main Navbar */}
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 lg:py-5">

                {/* Logo and Website Name */}
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="flex items-center gap-2"
                >
                    <img
                        src={icon}
                        alt="Give Life Blood Donation Logo"
                        className="w-14 sm:w-16 lg:w-20"
                    />

                    <div>
                        <h1 className="text-lg font-bold sm:text-xl">
                            Give Life
                        </h1>

                        <p className="text-sm font-semibold text-red-600">
                            Blood Donation
                        </p>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <ul className="hidden items-center gap-6 font-medium lg:flex xl:gap-10">

                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={navLinkClass}
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}

                    <li>
                        <Register />
                    </li>

                </ul>

                {/* Desktop Login */}
                <button
                    onClick={() => navigate("/login")}
                    className="hidden items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-white shadow-md transition hover:bg-red-700 sm:flex lg:px-6"
                >
                    <FaSignInAlt />
                    Login
                </button>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="ml-3 text-2xl text-red-700 sm:ml-4 lg:hidden"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>

            </div>

            {/* Mobile Navigation */}
            {menuOpen && (
                <div className="border-t border-gray-200 bg-white px-5 py-5 shadow-lg lg:hidden">

                    <ul className="flex flex-col gap-5 font-medium">

                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    onClick={closeMenu}
                                    className={navLinkClass}
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}

                        {/* Register */}
                        <li onClick={closeMenu}>
                            <Register />
                        </li>

                        {/* Mobile Login */}
                        <li>
                            <button
                                onClick={() => {
                                    closeMenu();
                                    navigate("/login");
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-white shadow-md transition hover:bg-red-700"
                            >
                                <FaSignInAlt />
                                Login
                            </button>
                        </li>

                    </ul>

                </div>
            )}

        </nav>
    );
}

export default Navbar;
