// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Techniques from "./pages/Techniques";
import Solutions from "./pages/Solutions";
import Videos from "./pages/Videos";
// import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider } from "./context/AuthContext";
import ChatScreenshots from "./pages/ChatScreenshots";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Toaster position="top-center" reverseOrder={false} />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
        
          <Routes>
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={<Home />} />
            <Route path="/techniques" element={<Techniques />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/screenshots" element={<ChatScreenshots/>} />
            {/* <Route path="/contact" element={<Contact />} /> */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
