import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, Upload, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Screenshot {
  _id: string;
  imageUrl: string;
  description: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

const ChatScreenshots = () => {
  const { user, getToken } = useAuth();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    imageUrl: "",
    description: "",
  });

  // Fetch all screenshots
  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/screenshots`);
      if (response.data.success) {
        setScreenshots(response.data.data);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch screenshots");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, imageUrl: base64String });
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload/submit
  const handleUpload = async () => {
    if (!user) {
      toast.error("Please login to upload screenshots");
      return;
    }

    if (!formData.imageUrl) {
      toast.error("Please select an image");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();

      const response = await axios.post(
        `${API_URL}/screenshots`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setScreenshots([response.data.data, ...screenshots]);
        setFormData({ imageUrl: "", description: "" });
        setImagePreview("");
        setDialogOpen(false);
        toast.success("Screenshot uploaded successfully");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload screenshot");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, uploaderId: string) => {
    if (!user) {
      toast.error("Please login to delete screenshots");
      return;
    }

    const userIdToCheck = typeof uploaderId === 'string' ? uploaderId : uploaderId;
    
    if (user._id !== userIdToCheck) {
      toast.error("You can only delete your own screenshots");
      return;
    }

    if (!confirm("Are you sure you want to delete this screenshot?")) return;

    try {
      const token = getToken();
      const response = await axios.delete(`${API_URL}/screenshots/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setScreenshots(screenshots.filter((s) => s._id !== id));
        toast.success("Screenshot deleted successfully");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete screenshot");
    }
  };

  // Check if user owns the screenshot
  const isScreenshotOwner = (screenshot: Screenshot) => {
    if (!user) return false;
    const userId = typeof screenshot.userId === 'string' ? screenshot.userId : screenshot.userId._id;
    return userId === user._id;
  };

  // Get uploader name
  const getUploaderName = (screenshot: Screenshot) => {
    if (typeof screenshot.userId === 'string') return 'Unknown';
    return screenshot.userId.name || 'Unknown';
  };

  const resetForm = () => {
    setFormData({ imageUrl: "", description: "" });
    setImagePreview("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-rose-950 to-black">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-romantic text-rose-400">
              Shared Chat Screenshots 💬
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Explore real conversations. Learn what works and what doesn't.
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center mb-10">
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    if (!user) {
                      toast.error("Please login to upload screenshots");
                      return;
                    }
                    setDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg"
                >
                  <Plus className="mr-2 h-4 w-4" /> Upload Screenshot
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/60 backdrop-blur-xl border border-rose-500/40">
                <DialogHeader>
                  <DialogTitle className="text-rose-400">Upload Chat Screenshot</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300 flex items-center gap-2">
                      <Upload size={16} /> Select Image (Max 5MB)
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={submitting}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-60 object-cover rounded-md border border-rose-400/30"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            setFormData({ ...formData, imageUrl: "" });
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <Textarea
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={submitting}
                    rows={3}
                  />

                  <Button
                    className="bg-gradient-to-r from-rose-500 to-red-600 text-white w-full"
                    onClick={handleUpload}
                    disabled={submitting || !formData.imageUrl}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload"
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
            /* Grid of screenshots */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {screenshots.map((screenshot) => {
                const isOwner = isScreenshotOwner(screenshot);
                const uploaderName = getUploaderName(screenshot);

                return (
                  <Card
                    key={screenshot._id}
                    className="glass-card border-rose-500/30 hover:border-rose-400 transition shadow-lg overflow-hidden group relative"
                  >
                    <img
                      src={screenshot.imageUrl}
                      alt="chat screenshot"
                      className="w-full h-60 object-cover cursor-pointer group-hover:scale-105 transition-transform"
                      onClick={() => setSelected(screenshot.imageUrl)}
                    />
                    
                    {/* Uploader Badge */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 text-xs rounded-full backdrop-blur-sm">
                      Uploaded by {uploaderName}
                    </div>

                    {/* Description if available */}
                    {screenshot.description && (
                      <div className="absolute bottom-10 left-2 right-2 bg-black/70 text-white px-3 py-2 text-xs rounded backdrop-blur-sm">
                        {screenshot.description}
                      </div>
                    )}

                    {/* Delete Button - Only for owner */}
                    {isOwner && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 shadow-lg"
                        onClick={() => {
                          const userId = typeof screenshot.userId === 'string' 
                            ? screenshot.userId 
                            : screenshot.userId._id;
                          handleDelete(screenshot._id, userId);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && screenshots.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                No screenshots yet. {user ? "Be the first to upload one!" : "Login to upload screenshots."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-12 right-0"
              onClick={() => setSelected(null)}
            >
              <X size={20} />
            </Button>
            <img
              src={selected}
              alt="screenshot large"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ChatScreenshots;