
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaTint,
    FaVenusMars,
    FaBirthdayCake,
    FaWeight,
    FaMapMarkerAlt,
    FaEdit,
} from "react-icons/fa";

import { setUser } from "../../redux/userSlice";
import { updateProfile } from "../../API/updateProfile";
import ProfileEditForm from "../../components/ProfileEditForm";
import RecipientPanel from "../../components/RecipientPanel";

function Profile() {
    const dispatch = useDispatch();

    const reduxUser = useSelector(
        (state) => state.user.currentUser
    );

    let storedUser = null;

    try {
        storedUser = JSON.parse(
            localStorage.getItem("loggedInUser") || "null"
        );
    } catch {
        storedUser = null;
    }

    const user =
        reduxUser?.recipient ||
        reduxUser ||
        storedUser?.recipient ||
        storedUser;

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex">
                <RecipientPanel />

                <main className="flex-1 p-8 text-center">
                    <h2 className="mt-10 text-xl text-gray-700">
                        Please log in to view your profile.
                    </h2>
                </main>
            </div>
        );
    }

    const saveProfile = async (updatedUser) => {
        if (saving) return;

        try {
            setSaving(true);

            const userId =
                user._id ||
                user.id ||
                user.userId ||
                user.recipientId;

            if (!userId) {
                alert("User ID not found. Please log in again.");
                return;
            }

            const data = await updateProfile(
                userId,
                updatedUser,
                "recipient"
            );

            const responseUser =
                data?.recipient ||
                data?.data ||
                data;

            const updatedUserData = {
                ...user,
                ...responseUser,
                ...updatedUser,
                _id: responseUser?._id || user._id || userId,
                id: responseUser?.id || user.id,
                userId: responseUser?.userId || user.userId,
            };

            dispatch(setUser(updatedUserData));

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(updatedUserData)
            );

            alert("Profile updated successfully.");
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
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <RecipientPanel />

            <main className="flex-1 min-w-0 p-4 sm:p-8">
                {!editing ? (
                    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-5 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">
                                    My Profile
                                </h1>

                                <p className="text-gray-500 mt-1">
                                    Manage your personal information
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg"
                            >
                                <FaEdit />
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <ProfileItem
                                icon={<FaUser />}
                                label="Name"
                                value={user.fullName}
                            />

                            <ProfileItem
                                icon={<FaEnvelope />}
                                label="Email"
                                value={user.email}
                            />

                            <ProfileItem
                                icon={<FaPhone />}
                                label="Phone"
                                value={user.phone}
                            />

                            <ProfileItem
                                icon={<FaTint />}
                                label="Blood Group"
                                value={user.bloodGroup}
                            />

                            <ProfileItem
                                icon={<FaVenusMars />}
                                label="Gender"
                                value={user.gender}
                            />

                            <ProfileItem
                                icon={<FaBirthdayCake />}
                                label="Date of Birth"
                                value={formatDate(user.dob)}
                            />

                            <ProfileItem
                                icon={<FaWeight />}
                                label="Weight"
                                value={
                                    user.weight
                                        ? `${user.weight} kg`
                                        : ""
                                }
                            />

                            <ProfileItem
                                icon={<FaMapMarkerAlt />}
                                label="City"
                                value={user.city}
                            />

                            <ProfileItem
                                icon={<FaMapMarkerAlt />}
                                label="State"
                                value={user.state}
                            />

                            <ProfileItem
                                icon={<FaMapMarkerAlt />}
                                label="Address"
                                value={user.address}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-5 sm:p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-8">
                            Edit Profile
                        </h1>

                        <ProfileEditForm
                            user={user}
                            onSave={saveProfile}
                            onCancel={() => setEditing(false)}
                            saving={saving}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString();
}

function ProfileItem({ icon, label, value }) {
    return (
        <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <div className="text-red-600 text-xl shrink-0">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-sm text-gray-500">
                    {label}
                </p>

                <p className="font-semibold text-gray-800 break-words">
                    {value || "Not Provided"}
                </p>
            </div>
        </div>
    );
}

export default Profile;
