import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FeatureCTA = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div 
          className="relative overflow-hidden rounded-2xl bg-cover bg-center text-white" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542045231780-332e9b0b4b2c?auto=format&fit=crop&q=80&w=2000')" }}
        >
          {/* Overlay to darken image */}
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative p-8 md:p-12 lg:p-16 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-romantic">
              Find Your Soulmate Strategy
            </h2>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto font-romantic">
              Access exclusive guides and personalized techniques to build lasting connections and attraction.
            </p>
            <div className="flex justify-center items-center">
              <Link to="/guides">
                <Button
                  size="lg"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-romantic text-lg px-8 h-12"
                >
                  Explore Guides
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCTA;