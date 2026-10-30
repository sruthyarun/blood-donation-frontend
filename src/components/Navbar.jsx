import icon from "../assets/logo.jpg";
import { Link } from "react-router-dom";
import Register from "./Register";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
function Navbar() {
    const navigate = useNavigate();
    const navLinkClass = ({ isActive }) =>
        `transition duration-200 ${isActive
            ? "text-red-600 font-bold border-b-2 border-red-600 pb-1"
            : "text-gray-700 hover:text-red-600"
        }`;
    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={icon} className="w-20"></img>
                    <div>
                        <h1 className="text-xl font-bold">
                            Give Life
                        </h1>
                        <p className="text-red-600 text-sm font-semibold">
                            Blood Donation
                        </p>
                    </div>
                </div>
                <ul className="hidden lg:flex items-center gap-10 font-medium">

                    <li>
                        <NavLink to="/" className={navLinkClass}>
                            Home
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/about" className={navLinkClass}>
                            About
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/contact" className={navLinkClass}>
                            Contact
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/emergency" className={navLinkClass}>
                            Emergency
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/campaigns" className={navLinkClass}>
                            Campaigns
                        </NavLink>
                    </li>

                    <li>
                        <Register />
                    </li>

                </ul>

                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-md transition"
                >
                    <FaSignInAlt />
                    Login
                </button>

            </div >
        </nav >
    );
}

export default Navbar;