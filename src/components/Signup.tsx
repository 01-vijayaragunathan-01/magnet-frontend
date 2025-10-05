import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import API from "@/utils/axios";
import toast from "react-hot-toast";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/auth/signup", form);
      
      console.log("Signup response:", data); // Debug log
      
      toast.success("Signup successful 🎉 Please login now");
      navigate("/login"); // go to login after signup
    } catch (err: any) {
      console.error("Signup error:", err); // Debug log
      toast.error(err.response?.data?.message || "Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0')",
      }}
    >
      <div className="backdrop-blur-xl bg-black/40 p-8 rounded-2xl shadow-2xl w-[350px]">
        <h1 className="text-3xl font-bold text-center font-romantic text-rose-400 mb-6">
          Create Love 💕
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Full Name"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
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
            placeholder="Password (min 6 characters)"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          <Button
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white hover:opacity-90"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-300 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-rose-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}