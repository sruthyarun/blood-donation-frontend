import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import DonorRegister from "../pages/Donor/DonorRegister";

function Register() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="px-5 py-3 rounded-lg hover:text-red-700"
            >
                Register ▼
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl divide-y divide-gray-200 text-black">
                    <Link
                        to="/register/donor"
                        className="block px-4 py-3 hover:bg-blue-50 hover:text-red-500"
                    >
                        As Donor
                    </Link>

                    <Link
                        to="/register/recipient"
                        className="block px-4 py-3 hover:bg-blue-50 hover:text-red-500"
                    >
                        As Recipient
                    </Link>

                    <Link
                        to="/hospital-register"
                        className="block px-4 py-3 hover:bg-blue-50 hover:text-red-500"
                    >
                        As Hospital
                    </Link>

                    <Link
                        to="/register/bloodbanks"
                        className="block px-4 py-3 hover:bg-blue-50 hover:text-red-500"
                    >
                        As Blood Bank
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Register;