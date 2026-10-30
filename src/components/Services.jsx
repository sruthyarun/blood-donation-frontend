

import ServiceCard from "./ServiceCard";
import Bloodbanks from "../assets/Bloodbanks.png";
import blooddonation from "../assets/blooddonation.png";
import findDonor from "../assets/findDonor.png";
import SaveLife from "../assets/SaveLife.png";

function Services() {
    return (
        <section className="bg-red-50 py-20">

            <div className="max-w-7xl mx-auto px-8">

                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-3">

                    <ServiceCard
                        icon={blooddonation}
                        title="Donate Blood"
                        description="Find nearby donation centers and become a lifesaver."
                    />

                    <ServiceCard
                        icon={findDonor}
                        title="Find Donors"
                        description="Search donors by blood group and location."
                    />

                    <ServiceCard
                        icon={Bloodbanks}
                        title="Blood Banks"
                        description="Locate trusted blood banks near you."
                    />

                    <ServiceCard
                        icon={SaveLife}
                        title="Save Lives"
                        description="Every donation gives hope to someone in need."
                    />

                </div>

            </div>

        </section>
    );
}

export default Services;