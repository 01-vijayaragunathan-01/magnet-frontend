import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Clock, Trash2, Edit, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Mistake {
  _id: string;
  task: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  user: string;
}

interface Solution {
  _id: string;
  title: string;
  description?: string;
  timeframe: string;
  user: string;
}

// Edit Modal Component
const EditModal = ({ isOpen, onClose, data, onSave, type }: {
  isOpen: boolean;
  onClose: () => void;
  data: Mistake | Solution | null;
  onSave: (id: string, updatedData: any) => void;
  type: "mistake" | "solution";
}) => {
  const [formData, setFormData] = useState<any>({});
  const isMistake = type === "mistake";

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (data) {
      onSave(data._id, formData);
    }
  };

  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border border-rose-500/40 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-rose-400">
            Edit {isMistake ? "Mistake" : "Solution"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={isMistake ? "task" : "title"} className="text-right text-gray-300">
              {isMistake ? "Mistake" : "Title"}
            </Label>
            <Input
              id={isMistake ? "task" : "title"}
              name={isMistake ? "task" : "title"}
              value={isMistake ? formData.task : formData.title}
              onChange={handleChange}
              className="col-span-3 bg-white/10 border-white/20 text-white"
            />
          </div>
          {!isMistake && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  className="col-span-3 bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeframe" className="text-right text-gray-300">
                  Timeframe
                </Label>
                <Input
                  id="timeframe"
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleChange}
                  className="col-span-3 bg-white/10 border-white/20 text-white"
                />
              </div>
            </>
          )}
          {isMistake && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right text-gray-300">
                Priority
              </Label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="col-span-3 bg-white/10 border-white/20 text-white rounded-md p-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
        </div>
        <Button onClick={handleSave} className="w-full bg-rose-500 hover:bg-rose-600">
          Save changes
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
const SolutionsComponent = () => {
  const { user, getToken } = useAuth();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [newMistake, setNewMistake] = useState("");
  const [newSolution, setNewSolution] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Mistake | Solution | null>(null);
  const [editingType, setEditingType] = useState<"mistake" | "solution" | null>(null);

  // Debug: Log user state
  useEffect(() => {
    console.log("🔍 Solutions page - Current user:", user);
  }, [user]);

  // Fetch all data
  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAllData = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Please login to view your mistakes and solutions");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching data with token...");
      
      const [mistakesRes, solutionsRes] = await Promise.all([
        axios.get(`${API_URL}/mistakes`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/solutions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      
      console.log("Mistakes response:", mistakesRes.data);
      console.log("Solutions response:", solutionsRes.data);
      
      setMistakes(mistakesRes.data);
      setSolutions(solutionsRes.data);
    } catch (error: any) {
      console.error("Fetch error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Mistake CRUD Operations
  const handleAddMistake = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Please login first");
      return;
    }
    
    if (!newMistake.trim()) {
      toast.error("Please enter a mistake");
      return;
    }
    
    try {
      const res = await axios.post(`${API_URL}/mistakes`, {
        task: newMistake,
        priority: "medium",
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMistakes((prev) => [...prev, res.data]);
      setNewMistake("");
      toast.success("Mistake added!");
    } catch (err: any) {
      console.error("Add mistake error:", err);
      toast.error(err.response?.data?.message || "Failed to add mistake");
    }
  };

  const handleToggleMistake = async (id: string, current: boolean) => {
    const token = getToken();
    if (!token) return;
    
    try {
      const res = await axios.put(`${API_URL}/mistakes/${id}`, 
        { completed: !current },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setMistakes((prev) => prev.map((m) => (m._id === id ? res.data : m)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update mistake");
    }
  };
  
  const handleDeleteMistake = async (id: string) => {
    const token = getToken();
    if (!token) return;
    
    if (!confirm("Are you sure you want to delete this mistake?")) return;
    
    try {
      await axios.delete(`${API_URL}/mistakes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMistakes((prev) => prev.filter((m) => m._id !== id));
      toast.success("Mistake deleted!");
    } catch {
      toast.error("Failed to delete mistake");
    }
  };

  const handleEditMistake = async (id: string, updatedData: any) => {
    const token = getToken();
    if (!token) return;
    
    try {
      const res = await axios.put(`${API_URL}/mistakes/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMistakes((prev) => prev.map((m) => (m._id === id ? res.data : m)));
      toast.success("Mistake updated!");
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update mistake");
    }
  };

  // Solution CRUD Operations
  const handleAddSolution = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Please login first");
      return;
    }
    
    if (!newSolution.trim()) {
      toast.error("Please enter a solution");
      return;
    }
    
    try {
      const res = await axios.post(`${API_URL}/solutions`, {
        title: newSolution,
        timeframe: "This Week", 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSolutions((prev) => [...prev, res.data]);
      setNewSolution("");
      toast.success("Solution added!");
    } catch (err: any) {
      console.error("Add solution error:", err);
      toast.error(err.response?.data?.message || "Failed to add solution");
    }
  };

  const handleDeleteSolution = async (id: string) => {
    const token = getToken();
    if (!token) return;

    if (!confirm("Are you sure you want to delete this solution?")) return;

    try {
      await axios.delete(`${API_URL}/solutions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolutions((prev) => prev.filter((s) => s._id !== id));
      toast.success("Solution deleted!");
    } catch {
      toast.error("Failed to delete solution");
    }
  };
  
  const handleEditSolution = async (id: string, updatedData: any) => {
    const token = getToken();
    if (!token) return;

    try {
      const payload = { 
        title: updatedData.title, 
        description: updatedData.description, 
        timeframe: updatedData.timeframe 
      };
      const res = await axios.put(`${API_URL}/solutions/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolutions((prev) => prev.map((s) => (s._id === id ? res.data : s)));
      toast.success("Solution updated!");
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update solution");
    }
  };

  // Modal Handlers
  const openEditModal = (item: Mistake | Solution, type: "mistake" | "solution") => {
    setEditingItem(item);
    setEditingType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setEditingType(null);
  };

  const handleModalSave = (id: string, updatedData: any) => {
    if (editingType === 'mistake') {
      handleEditMistake(id, updatedData);
    } else if (editingType === 'solution') {
      handleEditSolution(id, updatedData);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-rose-900 to-red-700">
        <Navbar />
        <main className="flex-1 py-20">
          <div className="container text-white text-center">
            <h2 className="text-3xl font-bold mb-4 text-rose-400">Login Required</h2>
            <p className="text-lg text-gray-300">Please login to view and manage your mistakes and solutions.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-rose-900 to-red-700">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container text-white">
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-rose-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* Mistakes Section */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                  Your Relationship Mistakes
                </h2>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="What mistake did you make?"
                    value={newMistake}
                    onChange={(e) => setNewMistake(e.target.value)}
                    className="bg-white/10 text-white border-white/20 placeholder:text-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMistake()}
                  />
                  <Button onClick={handleAddMistake} className="bg-red-500 hover:bg-red-600">
                    Add
                  </Button>
                </div>
                <div className="space-y-4">
                  {mistakes.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No mistakes added yet</p>
                  )}
                  {mistakes.map((m) => (
                    <Card
                      key={m._id}
                      className="glass-card border-red-400/30 hover:border-red-400/60 transition-all duration-300"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3 items-center">
                            <Checkbox
                              className="mt-1 min-w-[20px]"
                              checked={m.completed}
                              onCheckedChange={() => handleToggleMistake(m._id, m.completed)}
                            />
                            <div>
                              <CardTitle
                                className={`text-base ${
                                  m.completed ? "line-through opacity-50" : ""
                                }`}
                              >
                                {m.task}
                              </CardTitle>
                              <Badge variant="destructive" className={`text-xs ${m.priority === 'high' ? 'bg-red-600' : m.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                                {m.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(m, 'mistake')}>
                              <Edit className="h-4 w-4 text-gray-400 hover:text-rose-300" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMistake(m._id)}>
                              <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Solutions Section */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                  Your Solutions & Commitments
                </h2>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="How will you fix it?"
                    value={newSolution}
                    onChange={(e) => setNewSolution(e.target.value)}
                    className="bg-white/10 text-white border-white/20 placeholder:text-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSolution()}
                  />
                  <Button
                    onClick={handleAddSolution}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-4">
                  {solutions.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No solutions added yet</p>
                  )}
                  {solutions.map((s) => (
                    <Card
                      key={s._id}
                      className="glass-card border-green-400/30 hover:border-green-400/60 transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{s.title}</CardTitle>
                            <CardDescription className="opacity-80 mt-1 max-w-sm text-gray-300">
                              {s.description || "No description provided."}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(s, 'solution')}>
                              <Edit className="h-4 w-4 text-gray-400 hover:text-rose-300" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSolution(s._id)}>
                              <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Clock className="h-4 w-4 text-green-400" />
                          <span className="text-sm opacity-90 font-semibold">{s.timeframe}</span>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      
      {/* Edit Modal */}
      {editingItem && editingType && (
        <EditModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          data={editingItem} 
          onSave={handleModalSave} 
          type={editingType}
        />
      )}
    </div>
  );
};

export default SolutionsComponent;