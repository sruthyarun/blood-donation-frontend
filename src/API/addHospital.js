import API from "./axiosInstance";

export const registerHospital = async (hospitalData) => {
    try {
        const response = await API.post(
            "/hospitals",
            hospitalData
        );

        return response.data;
    } catch (error) {
        console.error(
            "Hospital API error:",
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.message ||
            "Failed to register hospital"
        );
    }
};