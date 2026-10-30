export default function validateDonor(formData) {
    const errors = {};

    // Full Name
    if (!formData.fullName.trim()) {
        errors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
        errors.fullName = "Minimum 3 characters required";
    } else if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
        errors.fullName = "Only alphabets are allowed";
    }

    // Email
    if (!formData.email.trim()) {
        errors.email = "Email is required";
    } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
        errors.email = "Invalid email address";
    }

    // Phone
    if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        errors.phone = "Enter a valid 10-digit phone number";
    }

    // Gender
    if (!formData.gender) {
        errors.gender = "Select gender";
    }

    // Date of Birth
    if (!formData.dob) {
        errors.dob = "Date of birth is required";
    } else {
        const age =
            new Date().getFullYear() -
            new Date(formData.dob).getFullYear();

        if (age < 18) {
            errors.dob = "Donor must be at least 18 years old";
        }
    }

    // Blood Group
    if (!formData.bloodGroup) {
        errors.bloodGroup = "Select blood group";
    }

    // Weight
    if (!formData.weight) {
        errors.weight = "Weight is required";
    } else if (isNaN(formData.weight)) {
        errors.weight = "Weight must be a number";
    } else if (Number(formData.weight) < 45) {
        errors.weight = "Minimum weight is 45 kg";
    }

    // Last Donation
    if (formData.lastDonation) {
        const lastDonation = new Date(formData.lastDonation);
        const today = new Date();

        if (lastDonation > today) {
            errors.lastDonation = "Future date is not allowed";
        }
    }

    // // District
    // if (!formData.district) {
    //     errors.district = "Select district";
    // }

    // Address
    if (!formData.address.trim()) {
        errors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
        errors.address = "Enter a complete address";
    }

    // Diseases
    if (!formData.diseases) {
        errors.diseases = "Select Yes or No";
    }

    // Availability
    if (!formData.availability) {
        errors.availability = "Select availability";
    }

    // Password
    if (!formData.password) {
        errors.password = "Password is required";
    } else if (formData.password.length < 6) {
        errors.password = "Minimum 6 characters required";
    } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(formData.password)
    ) {
        errors.password =
            "Password must contain uppercase, lowercase and a number";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
        errors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
}