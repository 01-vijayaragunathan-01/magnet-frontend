import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/FeatureCards";
import CTASection from "@/components/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeatureCards />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
