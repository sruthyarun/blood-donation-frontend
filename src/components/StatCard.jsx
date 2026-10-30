function StatCard({ number, title }) {
    return (
        <div className="text-center">

            <h2 className="text-4xl font-bold text-red-600">
                {number}
            </h2>

            <p className="text-gray-600 mt-2">
                {title}
            </p>

        </div>
    );
}

export default StatCard;