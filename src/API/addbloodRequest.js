
import API from "./axiosInstance";

export const bloodRequest = async (requestData) => {
    try {
        console.log("Blood request payload:", requestData);

        const response = await API.post(
            "/bloodRequests",
            requestData
        );

        return response.data;
    } catch (error) {
        console.error(
            "Blood request API error:",
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Failed to submit blood request"
        );
    }
};
