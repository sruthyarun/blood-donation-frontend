import { FaBell, FaSignOutAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

function NavbarDB({ notificationCount }) {
    const user = useSelector((state) => state.user.currentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("loggedInUser");
        dispatch({ type: "user/logoutUser" });
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

            <div className="flex items-center gap-4">

                <img
                    src={
                        user?.logo
                            ? user.logo
                            : "https://cdn-icons-png.flaticon.com/512/4320/4320337.png"
                    }
                    alt="Hospital Logo"
                    className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
                />

                <div>
                    <h2 className="text-xl font-bold text-red-600">
                        {user?.hospitalName}
                    </h2>

                    <p className="text-gray-500 text-sm">
                        {user?.hospitalType}
                    </p>
                </div>

            </div>

            <div className="flex items-center gap-6">

                <div className="relative cursor-pointer">

                    <FaBell className="text-2xl text-red-600" />

                    {notificationCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                            {notificationCount}
                        </span>
                    )}

                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                    <FaSignOutAlt />
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default NavbarDB;