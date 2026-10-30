import API from "./axiosInstance";

export const registerRecipient = async (recipientData) => {
    try {
        const response = await API.post("/recipients", recipientData);

        return response.data;
    } catch (error) {
        console.error(
            "Recipient API error:",
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.message || "Failed to register recipient"
        );
    }
};