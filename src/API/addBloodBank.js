
import axiosInstance from "../API/axiosInstance";

export const registerBloodBank = async (bbData) => {
    try {
        // Check whether this email is already registered
        const checkResponse = await axiosInstance.get("/bloodBanks");

        const bloodBanks = Array.isArray(checkResponse.data)
            ? checkResponse.data
            : checkResponse.data.data || checkResponse.data.bloodBanks || [];

        const existingBank = bloodBanks.some(
            (bank) =>
                bank.email?.toLowerCase() === bbData.email?.toLowerCase()
        );

        if (existingBank) {
            throw new Error("Blood bank already registered with this email.");
        }

        // Register the blood bank
        const response = await axiosInstance.post("/bloodBanks", bbData);

        return response.data;

    } catch (error) {
        console.error("Error message:", error.message);
        console.error("Status code:", error.response?.status);
        console.error(
            "Backend error details:",
            JSON.stringify(error.response?.data, null, 2)
        );
        throw error;
    }
};