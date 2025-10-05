import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleExploreClick = () => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      navigate("/techniques");
    }
  };

  return (
    <section className="relative overflow-hidden py-24 md:py-40 bg-white">
      {/* Central Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548210612-9968def675bb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHJvbWFudGljfGVufDB8fDB8fHww')" }} />
      <div className="absolute inset-0 bg-black opacity-60" />
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Tagline */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-full border border-white/30 backdrop-blur-sm">
            <span>
              Your Personal Love & Relationship Guide
            </span>
          </div>
          
          {/* Title */}
          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-romantic lg:text-6xl tracking-tight text-rose-100">
            Ignite Passion, Build Forever Love
          </h1>
          
          {/* Subtitle */}
          <p className="mb-10 text-lg md:text-xl font-romantic text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Transform your love life with proven techniques and romantic wisdom.
          </p>
          
          {/* Primary Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleExploreClick}
              className="bg-rose-600 hover:bg-rose-700 text-white text-lg px-8 h-14 rounded-full font-semibold transition-transform duration-300 hover:scale-105"
            >
              Start Exploring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;