
import axiosInstance from "./axiosInstance";

export const bookAppointment = async (appointmentData) => {
    const response = await axiosInstance.post(
        "/appointments",
        appointmentData
    );

    return response.data;
};

