export default function validateBloodBank(formData) {
    const errors = {};

    // Blood Bank Name
    if (!formData.bloodBankName.trim()) {
        errors.bloodBankName = "Blood bank name is required";
    } else if (formData.bloodBankName.trim().length < 3) {
        errors.bloodBankName = "Minimum 3 characters required";
    }

    // Manager Name
    if (!formData.managerName.trim()) {
        errors.managerName = "Manager name is required";
    } else if (formData.managerName.trim().length < 3) {
        errors.managerName = "Minimum 3 characters required";
    }

    // Email
    if (!formData.email.trim()) {
        errors.email = "Email is required";
    } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
        errors.email = "Enter a valid email address";
    }

    // Phone
    if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        errors.phone = "Enter a valid 10-digit phone number";
    }

    // License Number
    if (!formData.licenseNumber.trim()) {
        errors.licenseNumber = "License number is required";
    }

    // Registration Number
    if (!formData.registrationNumber.trim()) {
        errors.registrationNumber = "Registration number is required";
    }

    // State
    if (!formData.state) {
        errors.state = "Please select a state";
    }

    // District / City
    if (!formData.city) {
        errors.city = "Please select a district";
    }

    // Address
    if (!formData.address.trim()) {
        errors.address = "Address is required";
    }

    // Pincode
    if (!formData.pincode.trim()) {
        errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
        errors.pincode = "Enter a valid 6-digit pincode";
    }

    // Storage Capacity
    if (!formData.storageCapacity) {
        errors.storageCapacity = "Storage capacity is required";
    } else if (Number(formData.storageCapacity) <= 0) {
        errors.storageCapacity = "Storage capacity must be greater than 0";
    }

    // Operating Hours
    if (!formData.operatingHours.trim()) {
        errors.operatingHours = "Operating hours are required";
    }



    // Logo
    if (!formData.logo) {
        errors.logo = "Please upload the blood bank logo";
    }

    // Password
    if (!formData.password) {
        errors.password = "Password is required";
    } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(formData.password)
    ) {
        errors.password =
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
}