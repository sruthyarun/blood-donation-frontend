

export default function validateHospital(formData) {
    const errors = {};


    if (!formData.hospitalName.trim()) {
        errors.hospitalName = "Hospital name is required";
    } else if (formData.hospitalName.trim().length < 3) {
        errors.hospitalName = "Hospital name must be at least 3 characters";
    }


    if (!formData.hospitalType) {
        errors.hospitalType = "Select hospital type";
    }


    if (!formData.contactPerson.trim()) {
        errors.contactPerson = "Contact person is required";
    }


    if (!formData.adminName.trim()) {
        errors.adminName = "Administrator name is required";
    }


    if (!formData.email.trim()) {
        errors.email = "Email is required";
    } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
        errors.email = "Enter a valid email address";
    }


    if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        errors.phone = "Enter a valid 10-digit mobile number";
    }


    if (!formData.registrationNumber.trim()) {
        errors.registrationNumber = "Registration number is required";
    }


    if (!formData.licenseNumber.trim()) {
        errors.licenseNumber = "License number is required";
    }


    if (!formData.address.trim()) {
        errors.address = "Address is required";
    }


    if (!formData.pincode.trim()) {
        errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
        errors.pincode = "Enter a valid 6-digit pincode";
    }

    if (!formData.bloodBank) {
        errors.bloodBank = "Please select an option";
    }

    if (!formData.totalBeds) {
        errors.totalBeds = "Total beds is required";
    } else if (
        isNaN(formData.totalBeds) ||
        Number(formData.totalBeds) <= 0
    ) {
        errors.totalBeds = "Enter a valid number of beds";
    }

    if (!formData.emergencyPhone.trim()) {
        errors.emergencyPhone = "Emergency phone is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.emergencyPhone)) {
        errors.emergencyPhone = "Enter a valid 10-digit emergency phone number";
    }

    if (!formData.password) {
        errors.password = "Password is required";
    } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    if (formData.logo) {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

        if (
            formData.logo instanceof File &&
            !allowedTypes.includes(formData.logo.type)
        ) {
            errors.logo = "Only JPG, JPEG, PNG or WEBP images are allowed";
        }

        if (
            formData.logo instanceof File &&
            formData.logo.size > 2 * 1024 * 1024
        ) {
            errors.logo = "Image size should not exceed 2 MB";
        }
    }

    return errors;
}