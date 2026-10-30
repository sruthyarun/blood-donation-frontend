import { useSelector, useDispatch } from "react-redux";
import {
    Link

} from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSignOutAlt, FaHospital } from "react-icons/fa";
import { logoutUser } from "../../redux/userSlice";
import HospitalPanel from "../../components/HospitalPanel";
import NavbarDB from "../../components/NavbarDB";
import axios from "axios";
function HospitalDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector((state) => state.user.currentUser);

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        axios
            .get(
                `https://blood-donation-backend-olwl.onrender.com/api/notifications?email=${user.email}&read=false`
            )
            .then((res) => setNotifications(res.data))
            .catch((err) => console.log(err));
    }, [user.email]);

    const handleLogout = () => {
        dispatch(logoutUser());
        localStorage.removeItem("loggedInUser");
        navigate("/login");
    };

    if (!user) {
        return (

            <div className="min-h-screen flex justify-center items-center">
                <h2 className="text-2xl font-bold">
                    Please Login First
                </h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}

            <HospitalPanel />

            <div className="min-h-screen bg-gray-100 flex-1">

                {/* Navbar */}

                <NavbarDB notificationCount={notifications.length} />


                {/* Dashboard Content */}

                <div className="flex-1 p-8" >

                    <div className="bg-white rounded-xl shadow-lg p-8" >

                        <h1 className="text-3xl font-bold text-gray-800">
                            Welcome, {user.hospitalName}
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage blood inventory, requests, appointments and donors from here.
                        </p>

                    </div>

                </div>

            </div>
        </div >


    );
}

export default HospitalDashboard;