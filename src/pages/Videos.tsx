import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Play, PlusCircle, Trash2, Pencil, Upload, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Video {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  url: string;
  thumbnail: string;
  userId: {
    _id: string;
    username?: string;
    email: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

const Videos = () => {
  const { user, getToken } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // DEBUG: Log user state
  useEffect(() => {
    console.log("🔍 Current user:", user);
    console.log("🔍 User exists:", !!user);
  }, [user]);

  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    url: "",
    thumbnail: "",
  });

  // Fetch all videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/videos`);
      if (response.data.success) {
        setVideos(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewVideo({ ...newVideo, thumbnail: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!user) {
      toast.error("Please login to add videos");
      return;
    }

    if (!newVideo.title || !newVideo.description || !newVideo.category || !newVideo.duration || !newVideo.url) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      
      const response = await axios.post(
        `${API_URL}/videos`,
        newVideo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setVideos([response.data.data, ...videos]);
        setNewVideo({
          title: "",
          description: "",
          category: "",
          duration: "",
          url: "",
          thumbnail: "",
        });
        setIsDialogOpen(false);
        toast.success("Video added successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (video: Video) => {
    const userId = typeof video.userId === 'string' ? video.userId : video.userId._id;
    
    if (user && userId === user._id) {
      setEditingVideo(video);
      setNewVideo({
        title: video.title,
        description: video.description,
        category: video.category,
        duration: video.duration,
        url: video.url,
        thumbnail: video.thumbnail,
      });
      setIsDialogOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (!user || !editingVideo) return;

    try {
      setSubmitting(true);
      const token = getToken();
      
      const response = await axios.put(
        `${API_URL}/videos/${editingVideo._id}`,
        newVideo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setVideos(videos.map(v => v._id === editingVideo._id ? response.data.data : v));
        setNewVideo({
          title: "",
          description: "",
          category: "",
          duration: "",
          url: "",
          thumbnail: "",
        });
        setEditingVideo(null);
        setIsDialogOpen(false);
        toast.success("Video updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user || userId !== user._id) {
      toast.error("You can only delete your own videos");
      return;
    }

    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const token = getToken();
      
      const response = await axios.delete(`${API_URL}/videos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setVideos(videos.filter((video) => video._id !== id));
        toast.success("Video deleted successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete video");
    }
  };

  const resetDialog = () => {
    setNewVideo({
      title: "",
      description: "",
      category: "",
      duration: "",
      url: "",
      thumbnail: "",
    });
    setEditingVideo(null);
    setIsDialogOpen(false);
  };

  const isVideoOwner = (video: Video) => {
    if (!user) return false;
    const userId = typeof video.userId === 'string' ? video.userId : video.userId._id;
    return userId === user._id;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-rose-950 to-black">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-romantic text-rose-400">
              Helpful YouTube Guides 🎥
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Carefully curated video content from relationship experts to guide your journey
            </p>
          </div>

          {/* Add Video Button */}
          <div className="flex justify-center mb-10">
            {!user ? (
              <Button 
                className="bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg"
                onClick={() => {
                  toast.error("Please login to add videos");
                }}
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Add Video
              </Button>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) resetDialog();
                setIsDialogOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/60 backdrop-blur-xl border border-rose-500/40">
                  <DialogHeader>
                    <DialogTitle className="text-rose-400">
                      {editingVideo ? "Edit Video" : "Add New Video"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    <Input
                      placeholder="Title"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      disabled={submitting}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newVideo.description}
                      onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                      disabled={submitting}
                    />
                    <Input
                      placeholder="Category"
                      value={newVideo.category}
                      onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                      disabled={submitting}
                    />
                    <Input
                      placeholder="Duration (e.g. 12:45)"
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                      disabled={submitting}
                    />
                    <Input
                      placeholder="YouTube URL"
                      value={newVideo.url}
                      onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                      disabled={submitting}
                    />

                    {/* Thumbnail Upload */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300 flex items-center gap-2">
                        <Upload size={16} /> Upload Thumbnail (Optional, max 5MB)
                      </label>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleThumbnailUpload}
                        disabled={submitting}
                      />
                      {newVideo.thumbnail && (
                        <img
                          src={newVideo.thumbnail}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-md border border-rose-400/30"
                        />
                      )}
                    </div>

                    <Button
                      className="bg-gradient-to-r from-rose-500 to-red-600 text-white w-full"
                      onClick={editingVideo ? handleUpdate : handleAdd}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingVideo ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        editingVideo ? "Update" : "Add"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-rose-400" />
            </div>
          ) : (
            /* Video Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const userId = typeof video.userId === 'string' ? video.userId : video.userId._id;
                const isOwner = isVideoOwner(video);

                return (
                  <Card
                    key={video._id}
                    className="glass-card border-rose-500/30 hover:border-rose-400 transition shadow-lg group overflow-hidden relative"
                  >
                    <div className="relative aspect-video flex items-center justify-center bg-black/40">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100"
                        />
                      ) : (
                        <Play className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition" />
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                        {video.duration}
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-rose-400">{video.category}</span>

                        {/* Only show edit/delete if owned by logged-in user */}
                        {isOwner && (
                          <div className="flex gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-rose-400 hover:text-rose-500"
                              onClick={() => handleEdit(video)}
                            >
                              <Pencil size={18} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(video._id, userId)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg text-rose-300">{video.title}</CardTitle>
                      <CardDescription className="text-gray-300">{video.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 text-white"
                        asChild
                      >
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          Watch Video
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && videos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No videos available yet. Be the first to add one!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Videos;