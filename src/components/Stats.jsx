import StatCard from "./StatCard";

function Stats() {
    return (
        <section className="bg-white py-20">

            <div className="max-w-7xl mx-auto px-8">

                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10 bg-white rounded-3xl shadow-lg p-10">

                    <StatCard
                        number="25,000+"
                        title="Happy Donors"
                    />

                    <StatCard
                        number="50,000+"
                        title="Units Donated"
                    />

                    <StatCard
                        number="1,00,000+"
                        title="Lives Saved"
                    />

                    <StatCard
                        number="1,200+"
                        title="Blood Banks"
                    />

                </div>

            </div>

        </section>
    );
}

export default Stats;