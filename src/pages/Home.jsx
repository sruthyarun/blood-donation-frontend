import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Stats from "../components/Stats";
import WhyDonate from "../components/WhyDonate";
import Lives from "../components/lives";
import Footer from "../components/Footer";
import HowItWorks from "../components/HowItWorks";
function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Services />
            <Stats />
            <WhyDonate />
            <HowItWorks />
            <Lives />
            <Footer />
        </>
    );
}

export default Home;