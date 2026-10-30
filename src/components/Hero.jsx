import hero from "../assets/hero.png";
import bgs from "../assets/bgs.jpg";
import { useNavigate } from "react-router-dom";

function Hero() {
    const navigate = useNavigate();
    return (

        <section className="bg-gradient-to-r from-red-700 via-white to-red-400  h-screen bg-cover bg-center bg-no-repeat " style={{ backgroundImage: `url(${bgs})` }}>
            < div className="max-w-7xl mx-auto px-8 py-20 opacity-70" >

                <div className="grid lg:grid-cols-2 items-center gap-10">
                    <div>
                        <p className="uppercase tracking-wider text-red-600 font-semibold">
                            Be A Hero. Save A Life.
                        </p>

                        <h1 className="text-6xl font-extrabold leading-tight mt-5">
                            Your Blood
                            <br />
                            Can
                            <span className="text-red-600">
                                {" "}Save Lives.
                            </span>
                        </h1>
                        <p className="text-gray-600 mt-8 text-xl leading-9">
                            Every donation has the power to save lives.
                            Join thousands of heroes making a difference
                            in their communities.

                        </p>
                        <div className="flex gap-5 mt-10">
                            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl shadow-lg transition" onClick={() => navigate("/login")}>
                                Donate Blood
                            </button>

                            <button className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 rounded-xl transition" onClick={() => navigate("/login")}>
                                Schedule Appointment
                            </button>
                        </div>
                    </div>

                </div>
            </div >
        </section >
    );
}
export default Hero;