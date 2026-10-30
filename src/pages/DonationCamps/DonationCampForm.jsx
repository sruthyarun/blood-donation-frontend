
import { useEffect, useState } from "react";

const bloodGroups = [
    "A+", "A-", "B+", "B-",
    "AB+", "AB-", "O+", "O-",
];

const emptyForm = {
    campName: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    district: "",
    bloodGroupsNeeded: [],
    capacity: "50",
    contact: "",
    description: "",
};

function DonationCampForm({
    initialData,
    onSubmit,
    submitLabel = "Save Camp",
    busy = false,
}) {
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        if (!initialData) {
            setForm(emptyForm);
            return;
        }

        setForm({
            ...emptyForm,
            ...initialData,
            date: initialData.date
                ? String(initialData.date).slice(0, 10)
                : "",
            capacity: String(initialData.capacity ?? 50),
            bloodGroupsNeeded: initialData.bloodGroupsNeeded || [],
        });
    }, [initialData]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const toggleBloodGroup = (group) => {
        setForm((previous) => ({
            ...previous,
            bloodGroupsNeeded: previous.bloodGroupsNeeded.includes(group)
                ? previous.bloodGroupsNeeded.filter((item) => item !== group)
                : [...previous.bloodGroupsNeeded, group],
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (form.endTime <= form.startTime) {
            window.alert("End time must be later than start time.");
            return;
        }

        onSubmit({
            ...form,
            capacity: Number(form.capacity),
        });
    };

    const inputClass =
        "w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600";

    const labelClass = "mb-1 block text-sm font-medium text-gray-700";

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl bg-white p-5 shadow-sm md:p-7"
        >
            <div>
                <label className={labelClass}>Camp name *</label>
                <input
                    className={inputClass}
                    name="campName"
                    value={form.campName}
                    onChange={handleChange}
                    required
                    maxLength={120}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClass}>Date *</label>
                    <input
                        className={inputClass}
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        min={new Date().toLocaleDateString("en-CA")}
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>Capacity (donors) *</label>
                    <input
                        className={inputClass}
                        type="number"
                        name="capacity"
                        value={form.capacity}
                        onChange={handleChange}
                        min="1"
                        step="1"
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>Start time *</label>
                    <input
                        className={inputClass}
                        type="time"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>End time *</label>
                    <input
                        className={inputClass}
                        type="time"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClass}>Venue *</label>
                    <input
                        className={inputClass}
                        name="venue"
                        value={form.venue}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>District *</label>
                    <input
                        className={inputClass}
                        name="district"
                        value={form.district}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>Contact number *</label>
                    <input
                        className={inputClass}
                        name="contact"
                        type="tel"
                        value={form.contact}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div>
                <p className={labelClass}>Blood groups needed</p>
                <div className="flex flex-wrap gap-3">
                    {bloodGroups.map((group) => (
                        <label
                            key={group}
                            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                        >
                            <input
                                type="checkbox"
                                checked={form.bloodGroupsNeeded.includes(group)}
                                onChange={() => toggleBloodGroup(group)}
                            />
                            {group}
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className={labelClass}>Description</label>
                <textarea
                    className={inputClass}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={2000}
                    placeholder="Describe the camp and any instructions for donors"
                />
            </div>

            <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {busy ? "Saving..." : submitLabel}
            </button>
        </form>
    );
}

export default DonationCampForm;
