import { Heart, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const sections = [
    {
      title: "About",
      links: [
        { name: "Our Mission", path: "/about" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms", path: "/terms" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "YouTube Links", path: "/videos" },
        { name: "Tips", path: "/techniques" },
        { name: "Journal", path: "/solutions" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/40 bg-card mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 fill-primary text-primary" />
              <span className="text-lg font-bold">Relationship Guide</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your personal guide to better relationships and deeper connections.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4 text-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-smooth"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-smooth"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Relationship Guide. Made with{" "}
            <Heart className="inline h-4 w-4 fill-primary text-primary" /> for better
            relationships.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
