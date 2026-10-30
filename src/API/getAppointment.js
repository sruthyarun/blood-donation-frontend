
import axiosInstance from "./axiosInstance";

export const getAppointmentsByEmail = async (email) => {
    const response = await axiosInstance.get("/appointments", {
        params: { email },
    });

    const result = response.data;

    const appointments = Array.isArray(result)
        ? result
        : result.data || result.appointments || [];

    return appointments.filter(
        (appointment) =>
            appointment.email?.toLowerCase() === email.toLowerCase()
    );
};
