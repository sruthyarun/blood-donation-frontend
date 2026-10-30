import { useState } from "react";

function ProfileEditForm({ user, onSave, onCancel }) {
    const [formData, setFormData] = useState(user);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border p-3 rounded-lg"
            />

            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
            />

            <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
            />

            <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
            />

            <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
            />

            <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
            />

            <div className="flex gap-4">

                <button
                    type="submit"
                    className="bg-red-600 text-white px-6 py-2 rounded-lg"
                >
                    Save
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg"
                >
                    Cancel
                </button>

            </div>

        </form>
    );
}

export default ProfileEditForm;