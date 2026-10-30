
const validateAppointment = (data) => {
    const errors = {};

    if (!data.donorName?.trim()) {
        errors.donorName = "Donor name is required";
    }

    if (!data.bloodGroup?.trim()) {
        errors.bloodGroup = "Please select a blood group";
    }

    if (!data.email?.trim()) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Enter a valid email address";
    }

    if (!data.district?.trim()) {
        errors.district = "Please select a district";
    }

    if (!data.hospital?.trim()) {
        errors.hospital = "Please select a hospital";
    }

    if (!data.date) {
        errors.date = "Please select an appointment date";
    } else {
        const selectedDate = new Date(`${data.date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
            errors.date = "Choose today or a future date";
        }
    }

    if (!data.time?.trim()) {
        errors.time = "Please select a time slot";
    }

    if (!data.phone?.trim()) {
        errors.phone = "Contact number is required";
    } else if (!/^[0-9]{10}$/.test(data.phone.trim())) {
        errors.phone = "Enter a valid 10-digit mobile number";
    }

    return errors;
};

export default validateAppointment;
