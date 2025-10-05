import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, CheckCircle, Video } from "lucide-react";

const FeatureCards = () => {
  const features = [
    {
      icon: Heart,
      title: "Attraction Cards",
      description: "Learn fun and smart ways to impress and attract. Master the art of connection.",
    },
    {
      icon: Brain,
      title: "Psychology & Manipulation Tactics",
      description: "Explore powerful techniques for better communication and understanding.",
    },
    {
      icon: CheckCircle,
      title: "Solutions & To-Do",
      description: "Fix mistakes with guided solutions and track your progress effectively.",
    },
    {
      icon: Video,
      title: "Video Links",
      description: "Handpicked YouTube videos for relationship guidance from experts.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-romantic">What You'll Get</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-romantic">
            Everything you need to build and maintain healthy, fulfilling relationships
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass-card border-primary/20 hover:border-primary/50 transition-smooth hover:glow-accent group cursor-pointer"
            >
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg gradient-romantic glow-primary group-hover:scale-110 transition-bounce">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
