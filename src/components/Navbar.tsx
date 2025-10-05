import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  // ✅ hybrid authentication check (context or localStorage)
  const isLoggedIn = !!(user || localStorage.getItem("token"));

  const links = [
    { name: "Home", path: "/" },
    { name: "Techniques", path: "/techniques" },
    { name: "Solutions", path: "/solutions" },
    { name: "Videos", path: "/videos" },
    { name: "Shots", path: "/screenshots" },
    // { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    toast.success("You have been logged out.");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          to={isLoggedIn ? "/" : "/login"}
          className="flex items-center space-x-2 transition-smooth hover:opacity-80"
        >
          <Heart className="h-6 w-6 fill-primary text-primary" />
          <span className="text-xl font-bold font-romantic text-rose-100">
            Girls Magnet
          </span>
        </Link>

        {/* Desktop Menu */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={isActive(link.path) ? "default" : "ghost"}
                  className={
                    isActive(link.path)
                      ? "gradient-romantic text-primary-foreground hover:gradient-romantic-hover"
                      : "hover:bg-muted"
                  }
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>
        )}

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2">
          {!isLoggedIn ? (
            <>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex border-primary/50 hover:bg-primary/10"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="gradient-romantic hover:gradient-romantic-hover glow-primary">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-primary/50 hover:bg-primary/10"
            >
              Logout
            </Button>
          )}

          {/* Mobile Menu */}
          {isLoggedIn && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-primary/10"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isLoggedIn && isOpen && (
        <div className="md:hidden bg-background/95 border-t border-border/40">
          <div className="flex flex-col p-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.path)
                    ? "gradient-romantic text-white"
                    : "hover:bg-muted"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-primary/50 hover:bg-primary/10 w-full"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
