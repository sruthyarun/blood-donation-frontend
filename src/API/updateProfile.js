
import axiosInstance from "./axiosInstance";

export const updateProfile = async (userId, updatedUser, role = "donor") => {
    if (!userId) {
        throw new Error("User ID is missing");
    }

    const normalizedRole = String(role).toLowerCase();

    let endpoint;

    if (normalizedRole === "recipient") {
        endpoint = `/recipients/${encodeURIComponent(userId)}`;
    } else if (normalizedRole === "donor") {
        endpoint = `/donors/${encodeURIComponent(userId)}`;
    } else {
        throw new Error("Unsupported user role");
    }

    try {
        const response = await axiosInstance.put(endpoint, updatedUser);

        return response.data.data || response.data;
    } catch (error) {
        console.error(
            "Profile update error:",
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Failed to update profile"
        );
    }
};
