const validateRecipient = (formData) => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
        newErrors.fullName = "Full Name is required";
    } else if (formData.fullName.trim().length < 3) {
        newErrors.fullName =
            "Full Name must contain at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
        newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid Email Address";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone Number must be 10 digits";
    }

    if (!formData.gender) {
        newErrors.gender = "Select Gender";
    }

    if (!formData.dob) {
        newErrors.dob = "Date of Birth is required";
    } else {
        const today = new Date();
        const dob = new Date(formData.dob);

        let age = today.getFullYear() - dob.getFullYear();

        const month = today.getMonth() - dob.getMonth();

        if (
            month < 0 ||
            (month === 0 && today.getDate() < dob.getDate())
        ) {
            age--;
        }

        if (age < 18) {
            newErrors.dob =
                "Recipient must be at least 18 years old";
        }
    }

    if (!formData.bloodGroup) {
        newErrors.bloodGroup = "Select Blood Group";
    }

    if (!formData.hospital.trim()) {
        newErrors.hospital = "Hospital Name is required";
    }

    if (!formData.medicalCondition.trim()) {
        newErrors.medicalCondition =
            "Medical Condition is required";
    }

    if (!formData.address.trim()) {
        newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
        newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
        newErrors.state = "State is required";
    }

    if (!/^[0-9]{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Pincode must be 6 digits";
    }

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
        newErrors.password =
            "Password must contain uppercase, lowercase, number and special character";
    }

    if (!formData.confirmPassword) {
        newErrors.confirmPassword =
            "Please confirm your password";
    } else if (
        formData.password !== formData.confirmPassword
    ) {
        newErrors.confirmPassword =
            "Passwords do not match";
    }

    return newErrors;
};

export default validateRecipient;