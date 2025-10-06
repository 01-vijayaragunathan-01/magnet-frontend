import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, PlusCircle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Technique {
  _id: string;
  title: string;
  category: string;
  description: string;
  tips: string[];
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const Techniques = () => {
  const { user, getToken } = useAuth();
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    tips: "",
  });

  // Debug: Log user state
  useEffect(() => {
    console.log("🔍 Current user:", user);
  }, [user]);

  // Fetch techniques on load
  useEffect(() => {
    fetchTechniques();
  }, []);

  const fetchTechniques = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/techniques`);
      console.log("Fetched techniques:", res.data);
      setTechniques(res.data);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch techniques");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ title: "", category: "", description: "", tips: "" });
    setEditingId(null);
  };

  // Handle Add / Update
  const handleSave = async () => {
    if (!user) {
      toast.error("Please login to add techniques");
      return;
    }

    if (!formData.title || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();

      const payload = {
        ...formData,
        tips: formData.tips.split(",").map((t) => t.trim()).filter(Boolean),
      };

      console.log("Submitting payload:", payload);

      if (editingId) {
        const res = await axios.put(`${API_URL}/techniques/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTechniques(techniques.map((t) => (t._id === editingId ? res.data : t)));
        toast.success("Technique updated successfully");
      } else {
        const res = await axios.post(`${API_URL}/techniques`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTechniques([res.data, ...techniques]);
        toast.success("Technique added successfully");
      }

      resetForm();
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Save technique error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to save technique");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!user) {
      toast.error("Please login to delete techniques");
      return;
    }

    if (!confirm("Are you sure you want to delete this technique?")) return;

    try {
      const token = getToken();
      await axios.delete(`${API_URL}/techniques/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTechniques(techniques.filter((t) => t._id !== id));
      toast.success("Technique deleted successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete technique");
    }
  };

  // Check if user owns the technique
  const isTechniqueOwner = (technique: Technique) => {
    if (!user) return false;
    return technique.user._id === user._id;
  };

  const categories = ["All", "Psychology", "Body Language", "Communication", "Attraction"];

  // Filter techniques by category
  const filteredTechniques = selectedCategory === "All" 
    ? techniques 
    : techniques.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-rose-950 to-black">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-romantic text-rose-400">
              Psychology & Communication Techniques
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Master the art of attraction and communication with proven psychological techniques
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className={`cursor-pointer hover:bg-rose-500/20 border-rose-400/30 px-4 py-2 transition ${
                  selectedCategory === category 
                    ? "bg-rose-500/30 text-rose-200" 
                    : "text-rose-300"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Add / Edit Technique Modal */}
          <div className="flex justify-center mb-10">
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    if (!user) {
                      toast.error("Please login to add techniques");
                      return;
                    }
                    resetForm();
                    setDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg"
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Technique
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/60 backdrop-blur-xl border border-rose-500/40">
                <DialogHeader>
                  <DialogTitle className="text-rose-400">
                    {editingId ? "Edit Technique" : "Add New Technique"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  <Input 
                    placeholder="Title" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={submitting}
                  />
                  <Input 
                    placeholder="Category (e.g., Psychology)" 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={submitting}
                  />
                  <Textarea 
                    placeholder="Description" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={submitting}
                  />
                  <Textarea 
                    placeholder="Tips (comma separated)" 
                    value={formData.tips}
                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                    disabled={submitting}
                  />
                  <Button
                    className="bg-gradient-to-r from-rose-500 to-red-600 text-white w-full"
                    onClick={handleSave}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingId ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      editingId ? "Update" : "Add"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-rose-400" />
            </div>
          ) : (
            /* Technique Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTechniques.map((technique) => {
                const isOwner = isTechniqueOwner(technique);

                return (
                  <Card 
                    key={technique._id} 
                    className="glass-card border-rose-500/30 hover:border-rose-400 transition shadow-lg relative"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-gradient-to-r from-rose-500 to-red-600 text-white">
                          {technique.category}
                        </Badge>
                        
                        {/* Only show edit/delete if user owns this technique */}
                        {isOwner && (
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-rose-400 hover:text-rose-500"
                              onClick={() => {
                                setEditingId(technique._id);
                                setFormData({
                                  title: technique.title,
                                  category: technique.category,
                                  description: technique.description,
                                  tips: technique.tips.join(", "),
                                });
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil size={18} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(technique._id)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl text-rose-300">{technique.title}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {technique.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-rose-400">Key Tips:</p>
                        <ul className="space-y-1">
                          {technique.tips.map((tip: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start">
                              <span className="text-rose-400 mr-2">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && filteredTechniques.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                No techniques found. {user ? "Be the first to add one!" : "Login to add techniques."}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Techniques;