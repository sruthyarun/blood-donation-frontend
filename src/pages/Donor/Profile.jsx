
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";
import { updateProfile } from "../../API/updateProfile";
import ProfileEditForm from "../../components/ProfileEditForm";
import DonorPanel from "../../components/donorPanel";

function Profile() {
    const dispatch = useDispatch();

    // Get the logged-in user from Redux
    const currentUser = useSelector(
        (state) => state.user.currentUser
    );

    // Handle both a direct donor object and a nested donor object
    const user = currentUser?.donor || currentUser;

    const [editing, setEditing] = useState(false);

    // Save updated profile information
    const saveProfile = async (updatedUser) => {
        try {
            const userId = user?._id || user?.id;

            if (!userId) {
                alert("User ID is missing. Please log in again.");
                console.error("Current user:", currentUser);
                return;
            }

            const response = await updateProfile(
                userId,
                updatedUser
            );

            // Extract the updated donor from the API response
            const updatedData =
                response?.donor ??
                response?.data?.donor ??
                response?.data ??
                response;

            // Update Redux
            dispatch(setUser(updatedData));

            // Update localStorage
            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(updatedData)
            );

            alert("Profile updated successfully!");
            setEditing(false);
        } catch (error) {
            console.error(
                "Profile update error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to update profile."
            );
        }
    };

    // Show login message if no user is available
    if (!user || !user._id && !user.id) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        Please Login
                    </h2>
                    <p className="text-gray-500">
                        Log in to view your donor profile.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Donor Sidebar */}
            <DonorPanel />

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 max-w-5xl mx-auto">

                    {!editing ? (
                        <>
                            {/* Profile Header */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800">
                                        My Profile
                                    </h1>
                                    <p className="text-gray-500 mt-2">
                                        View your personal and donor information.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition"
                                >
                                    Edit Profile
                                </button>
                            </div>

                            {/* Donor Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Full Name
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.fullName || "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Email
                                    </p>
                                    <p className="font-semibold text-gray-800 break-words">
                                        {user.email || "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Phone
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.phone || "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-2">
                                        Blood Group
                                    </p>
                                    <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full font-semibold">
                                        {user.bloodGroup || "Not provided"}
                                    </span>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Gender
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.gender || "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Date of Birth
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.dob
                                            ? String(user.dob).slice(0, 10)
                                            : "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Weight
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.weight != null
                                            ? `${user.weight} kg`
                                            : "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        City
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.city || "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        State
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.state || "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        PIN Code
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.pincode || "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4 md:col-span-2">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Address
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.address || "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Last Donation
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.lastDonation
                                            ? String(user.lastDonation).slice(0, 10)
                                            : "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Availability
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.availability || "Not provided"}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4 md:col-span-2">
                                    <p className="text-gray-500 text-sm mb-1">
                                        Diseases / Medical Information
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {user.diseases || "Not provided"}
                                    </p>
                                </div>

                            </div>
                        </>
                    ) : (
                        <>
                            {/* Edit Profile Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-800">
                                    Edit Profile
                                </h1>
                                <p className="text-gray-500 mt-2">
                                    Update your donor information below.
                                </p>
                            </div>

                            <ProfileEditForm
                                user={user}
                                onSave={saveProfile}
                                onCancel={() => setEditing(false)}
                            />
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}

export default Profile;
