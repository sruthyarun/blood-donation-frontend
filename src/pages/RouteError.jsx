
import { useRouteError, Link } from "react-router-dom";

function RouteError() {
    const error = useRouteError();

    console.error("Route error details:", error);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold text-red-700">
                    Page Error
                </h1>

                <p className="mb-2">
                    <strong>Status:</strong>{" "}
                    {error?.status || "Unknown"}
                </p>

                <p className="mb-4">
                    <strong>Message:</strong>{" "}
                    {error?.statusText ||
                        error?.message ||
                        "No error message available"}
                </p>

                {error?.data && (
                    <pre className="mb-4 overflow-auto rounded bg-gray-100 p-3 text-sm">
                        {typeof error.data === "string"
                            ? error.data
                            : JSON.stringify(error.data, null, 2)}
                    </pre>
                )}

                <Link
                    to="/"
                    className="inline-block rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}

export default RouteError;