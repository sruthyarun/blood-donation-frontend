import API from "./axiosInstance";

export const registerDonor = async (donorData) => {
    try {
        const response = await API.post("/donors", donorData);

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to save donor"
        );
    }
};