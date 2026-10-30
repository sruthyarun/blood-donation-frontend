
import l1 from "../assets/l1.avif";
function Lives() {
    return (
        <section className="py-20 bg-gradient-to-r from-red-300 to-red-200 text-white">

            <div className="max-w-7xl mx-auto px-8">

                <div className="grid lg:grid-cols-2 items-center gap-10">

                    <div>
                        <h2 className="text-5xl font-bold">
                            Be the Reason Someone Lives Today.
                        </h2>
                        <p className="mt-6 text-red-100 text-lg">
                            One blood donation can save up to three lives.
                            Become a hero by donating blood and inspiring others.
                        </p>
                        <button className="mt-8 flex items-center gap-2 text-white bg-red-600 px-8 py-4 rounded-xl font-semibold hover:scale-105 transition">
                            Donate Now
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <img
                            src={l1}
                            alt="Blood Donation"
                            className="w-[450px] opacity-80 rounded-[50%]"
                        />
                    </div>

                </div>

            </div>

        </section>
    );
}

export default Lives;