import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaTwitter,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaTint,
    FaHeart,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white">

            <div className="max-w-7xl mx-auto px-6 py-16">

                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">

                    <div>

                        <div className="flex items-center gap-3">


                            <h2 className="text-3xl font-bold text-red-500">
                                Give Life Today
                            </h2>

                        </div>

                        <p className="text-gray-400 mt-6 leading-8">
                            Every blood donation is a precious gift that saves
                            lives. Join thousands of donors helping hospitals
                            and patients across Kerala.
                        </p>


                    </div>

                    <div>

                        <h3 className="text-2xl font-bold mb-6">
                            Quick Links
                        </h3>

                        <ul className="space-y-4 text-gray-400">

                            <li>
                                <Link to="/" className="hover:text-red-500 transition">
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link to="/about" className="hover:text-red-500 transition">
                                    About Us
                                </Link>
                            </li>

                            <li>
                                <Link to="/emergency" className="hover:text-red-500 transition">
                                    Emergency
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-red-500 transition">
                                    Contact Us
                                </Link>
                            </li>



                        </ul>

                    </div>


                    <div>

                        <h3 className="text-2xl font-bold mb-6">
                            Contact Us
                        </h3>

                        <div className="space-y-5">

                            <div className="flex gap-4 items-center">

                                <FaPhoneAlt className="text-red-500 text-xl" />

                                <span className="text-gray-400">
                                    +91 9876543210
                                </span>

                            </div>

                            <div className="flex gap-4 items-center">

                                <FaEnvelope className="text-red-500 text-xl" />

                                <span className="text-gray-400">
                                    support@givelife.com
                                </span>

                            </div>

                            <div className="flex gap-4 items-center">

                                <FaMapMarkerAlt className="text-red-500 text-xl" />

                                <span className="text-gray-400">
                                    Kerala, India
                                </span>

                            </div>

                        </div>

                    </div>


                    <div>

                        <h3 className="text-2xl font-bold mb-6">
                            Follow Us
                        </h3>

                        <p className="text-gray-400 mb-6">
                            Stay connected for blood donation campaigns,
                            awareness programs and emergency updates.
                        </p>

                        <div className="flex gap-4">

                            <a
                                href="#"
                                className="w-12 h-12 rounded-full bg-gray-700 hover:bg-red-600 flex items-center justify-center transition"
                            >
                                <FaFacebookF />
                            </a>

                            <a
                                href="#"
                                className="w-12 h-12 rounded-full bg-gray-700 hover:bg-pink-600 flex items-center justify-center transition"
                            >
                                <FaInstagram />
                            </a>

                            <a
                                href="#"
                                className="w-12 h-12 rounded-full bg-gray-700 hover:bg-blue-600 flex items-center justify-center transition"
                            >
                                <FaLinkedinIn />
                            </a>

                            <a
                                href="#"
                                className="w-12 h-12 rounded-full bg-gray-700 hover:bg-sky-500 flex items-center justify-center transition"
                            >
                                <FaTwitter />
                            </a>

                        </div>



                    </div>



                </div>
            </div >

        </footer >
    );
}

export default Footer;