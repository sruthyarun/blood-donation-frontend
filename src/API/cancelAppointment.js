
import axiosInstance from "./axiosInstance";

export const cancelAppointment = async (id) => {
    const response = await axiosInstance.patch(
        `/appointments/${id}/cancel`
    );

    return response.data;
};
