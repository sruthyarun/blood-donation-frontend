
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HospitalPanel from "../components/HospitalPanel";
import BloodBankPanel from "../components/BBPanel";
import axiosInstance from "../API/axiosInstance";

function CompletionActions({ destinationType: typeProp }) {
    const user = useSelector((state) => state.user.currentUser);

    const normalizedRole = String(user?.role || "")
        .toLowerCase()
        .replace(/[\s_-]/g, "");

    const destinationType =
        typeProp ||
        (normalizedRole === "bloodbank" ? "BloodBank" : "Hospital");

    // Match the organization ID stored on the logged-in user.
    const destinationId =
        destinationType === "Hospital"
            ? user?.hospitalId || user?.id || user?._id
            : user?.bloodBankId || user?.bloodbankId || user?.id || user?._id;

    // Names are also sent because legacy records may not have matching IDs.
    const destinationName =
        destinationType === "Hospital"
            ? user?.hospitalName || user?.name || user?.adminName
            : user?.bloodBankName ||
            user?.bankName ||
            user?.name;

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadRecords = useCallback(async () => {
        if (!destinationId && !destinationName) {
            setRecords([]);
            setError(
                "The logged-in organization could not be identified. Check the user data saved after login."
            );
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axiosInstance.get(
                "/completionActions",
                {
                    params: {
                        destinationType,
                        destinationId: destinationId || "",
                        destinationName: destinationName || "",
                    },
                }
            );

            console.log(
                "Completion Actions API response:",
                response.data
            );

            setRecords(
                Array.isArray(response.data?.data)
                    ? response.data.data
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load completion actions:",
                err.response?.data || err
            );

            setRecords([]);
            setError(
                err.response?.data?.message ||
                "Failed to load appointments and blood requests. Check that the backend route is running."
            );
        } finally {
            setLoading(false);
        }
    }, [destinationType, destinationId, destinationName]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const handleAction = async (record, action) => {
        const isAppointment = record.recordType === "appointment";
        const label = isAppointment ? "appointment" : "blood request";

        const confirmed = window.confirm(
            action === "Done"
                ? `Mark this ${label} as Done? This will update blood inventory and send a notification.`
                : `Mark this ${label} as Not Done? This will delete the record and send a notification.`
        );

        if (!confirmed) return;

        const processingKey = `${record.recordType}-${record._id}`;

        setProcessingId(processingKey);
        setError("");
        setMessage("");

        try {
            const response = await axiosInstance.post(
                `/completionActions/${record.recordType}/${record._id}`,
                {
                    action,
                    destinationType,
                    destinationId: destinationId || "",
                    destinationName: destinationName || "",
                }
            );

            setMessage(
                response.data?.message || "Action completed successfully."
            );

            await loadRecords();
        } catch (err) {
            console.error(
                "Failed to process completion action:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Could not process this record. Please try again."
            );
        } finally {
            setProcessingId("");
        }
    };

    const formatDate = (value) => {
        if (!value) return "—";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? String(value)
            : date.toLocaleDateString("en-IN");
    };

    const content = (
        <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Completion Actions
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Review completed appointments and confirmed blood
                        requests for{" "}
                        <span className="font-semibold">
                            {destinationName || destinationType}
                        </span>
                        .
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadRecords}
                    disabled={loading || Boolean(processingId)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {message && (
                <div
                    role="status"
                    className="mb-4 rounded-lg bg-green-100 p-3 text-green-800"
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="mb-4 rounded-lg bg-red-100 p-3 text-red-700"
                >
                    {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-xl bg-white shadow">
                {loading ? (
                    <p className="p-8 text-center text-gray-600">
                        Loading records...
                    </p>
                ) : records.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="font-medium text-gray-700">
                            No records found.
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            This page displays appointments with status
                            Completed and blood requests with status Confirmed
                            that match this organization.
                        </p>
                    </div>
                ) : (
                    <table className="w-full min-w-[1050px] text-left text-sm">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="p-3">Type</th>
                                <th className="p-3">Person</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Blood Group</th>
                                <th className="p-3">Units</th>
                                <th className="p-3">Destination</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.map((record) => {
                                const key =
                                    `${record.recordType}-${record._id}`;
                                const busy = processingId === key;
                                const isAppointment =
                                    record.recordType === "appointment";

                                return (
                                    <tr
                                        key={key}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-3">
                                            {isAppointment
                                                ? "Appointment"
                                                : "Blood Request"}
                                        </td>

                                        <td className="p-3 font-medium">
                                            {record.personName || "—"}
                                        </td>

                                        <td className="p-3">
                                            {record.personEmail || "—"}
                                        </td>

                                        <td className="p-3">
                                            {record.bloodGroup || "—"}
                                        </td>

                                        <td className="p-3">
                                            {isAppointment
                                                ? "1 donation unit"
                                                : record.units ?? "—"}
                                        </td>

                                        <td className="p-3">
                                            {record.destination ||
                                                destinationName ||
                                                "—"}
                                        </td>

                                        <td className="p-3">
                                            {formatDate(
                                                isAppointment
                                                    ? record.date
                                                    : record.requiredDate
                                            )}
                                        </td>

                                        <td className="p-3">
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                {record.status || "—"}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAction(
                                                            record,
                                                            "Done"
                                                        )
                                                    }
                                                    disabled={Boolean(
                                                        processingId
                                                    )}
                                                    className="rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {busy
                                                        ? "Processing..."
                                                        : "Done"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAction(
                                                            record,
                                                            "Not Done"
                                                        )
                                                    }
                                                    disabled={Boolean(
                                                        processingId
                                                    )}
                                                    className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Not Done
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    // BloodBankPanel provides its own sidebar/layout and accepts children.
    if (destinationType === "BloodBank") {
        return (
            <BloodBankPanel>
                {content}
            </BloodBankPanel>
        );
    }

    // HospitalPanel is rendered beside the page content.
    return (
        <div className="flex min-h-screen bg-gray-100">
            <HospitalPanel />
            <main className="min-w-0 flex-1">{content}</main>
        </div>
    );
}

export default CompletionActions;
