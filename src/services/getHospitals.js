import axiosInstance from "../API/axiosInstance";

export const getHospitals = async () => {
    try {
        const response = await axiosInstance.get("/hospitals");
        return response.data;
    } catch (error) {
        console.error(
            "Failed to fetch hospitals:",
            error.response?.data || error.message
        );
        throw error;
    }
};