import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GameProvider, useGame } from "@/contexts/GameContext";
import CRTOverlay from "@/components/CRTOverlay";
import AntiCheat from "@/components/AntiCheat";
import HUD from "@/components/HUD";
import Login from "@/pages/Login";
import Level1 from "@/pages/Level1";
import Level2 from "@/pages/Level2";
import Level3 from "@/pages/Level3";
import Level3Admin from "@/pages/Level3Admin";
import Level3Complete from "@/pages/Level3Complete";
import Level4 from "@/pages/Level4";
import Victory from "@/pages/Victory";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const { isLoggedIn } = useGame();

  return (
    <>
      {isLoggedIn && <HUD />}
      <AntiCheat />
      <CRTOverlay />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Login />} />
          <Route path="/level/1" element={<Level1 />} />
          <Route path="/level/2" element={<Level2 />} />
          <Route path="/level/3" element={<Level3 />} />
          <Route path="/level3-admin" element={<Level3Admin />} />
          <Route path="/level3-complete" element={<Level3Complete />} />
          <Route path="/level/4" element={<Level4 />} />
          <Route path="/victory" element={<Victory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GameProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
