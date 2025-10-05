import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import API from "@/utils/axios";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Use AuthContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", form);
      
      console.log("Login response:", data); // Debug log
      
      // ✅ Call login from AuthContext to set user state
      login(data);
      
      toast.success("Login successful 🎉");
      navigate("/"); // go to home
    } catch (err: any) {
      console.error("Login error:", err); // Debug log
      toast.error(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=1171&auto=format&fit=crop')",
      }}
    >
      <div className="backdrop-blur-xl bg-black/40 p-8 rounded-2xl shadow-2xl w-[350px]">
        <h1 className="text-3xl font-bold text-center font-romantic text-rose-400 mb-6">
          Welcome Back ❤️
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white hover:opacity-90"
            disabled={loading}
            type="submit"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-300 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-rose-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}