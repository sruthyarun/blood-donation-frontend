
import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../API/axiosInstance";

function ViewDonationCamps() {
    const [camps, setCamps] = useState([]);
    const [search, setSearch] = useState("");
    const [district, setDistrict] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCamps = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/donationCamps");
            setCamps(response.data.camps || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load donation camps. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCamps();
    }, [loadCamps]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const districts = [
        ...new Set(
            camps.map((camp) => camp.district).filter(Boolean)
        ),
    ].sort();

    const visibleCamps = camps.filter((camp) => {
        const campDate = new Date(camp.date);
        campDate.setHours(0, 0, 0, 0);

        const isUpcoming =
            camp.status === "Upcoming" &&
            campDate >= today;

        const matchesSearch = [
            camp.campName,
            camp.hospitalName,
            camp.venue,
            camp.district,
        ].some((value) =>
            String(value || "")
                .toLowerCase()
                .includes(search.trim().toLowerCase())
        );

        const matchesDistrict =
            !district || camp.district === district;

        return isUpcoming && matchesSearch && matchesDistrict;
    });

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    return (
        <main className="min-h-screen bg-gray-100 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 rounded-2xl bg-red-700 p-6 text-white md:p-10">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider">
                        Give blood. Save lives.
                    </p>

                    <h1 className="text-3xl font-bold md:text-4xl">
                        Upcoming Blood Donation Camps
                    </h1>

                    <p className="mt-3 max-w-2xl text-red-50">
                        Find a camp organized by a hospital near you.
                        Check the date, venue, blood groups needed, and contact details.
                    </p>
                </div>

                <div className="mb-6 grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-2">
                    <input
                        type="search"
                        placeholder="Search camp, hospital, or venue..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                    />

                    <select
                        value={district}
                        onChange={(event) => setDistrict(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-600"
                    >
                        <option value="">All districts</option>
                        {districts.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                        <button
                            type="button"
                            onClick={loadCamps}
                            className="ml-3 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <p className="py-12 text-center text-gray-600">
                        Loading donation camps...
                    </p>
                ) : visibleCamps.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800">
                            No upcoming camps found
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Try another search or district, or check back later.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {visibleCamps.map((camp) => (
                            <article
                                key={camp._id}
                                className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                            >
                                <div className="h-2 bg-red-600" />

                                <div className="p-5">
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                                        {camp.status}
                                    </span>

                                    <h2 className="mt-3 text-xl font-bold text-gray-800">
                                        {camp.campName}
                                    </h2>

                                    <p className="mt-1 text-sm font-medium text-red-700">
                                        {camp.hospitalName}
                                    </p>

                                    <div className="mt-4 space-y-3 text-sm text-gray-600">
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {formatDate(camp.date)}
                                        </p>

                                        <p>
                                            <strong>Time:</strong>{" "}
                                            {camp.startTime} – {camp.endTime}
                                        </p>

                                        <p>
                                            <strong>Venue:</strong>{" "}
                                            {camp.venue}, {camp.district}
                                        </p>

                                        <p>
                                            <strong>Donor capacity:</strong>{" "}
                                            {camp.capacity}
                                        </p>

                                        <p>
                                            <strong>Blood groups needed:</strong>{" "}
                                            {camp.bloodGroupsNeeded?.length
                                                ? camp.bloodGroupsNeeded.join(", ")
                                                : "All eligible donors welcome"}
                                        </p>

                                        {camp.description && (
                                            <p className="whitespace-pre-line">
                                                {camp.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-5 border-t pt-4">
                                        <p className="text-sm text-gray-600">
                                            Contact the hospital
                                        </p>

                                        <a
                                            href={`tel:${camp.contact}`}
                                            className="mt-1 inline-block font-semibold text-red-700 hover:underline"
                                        >
                                            {camp.contact}
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default ViewDonationCamps;
