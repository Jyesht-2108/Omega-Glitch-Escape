import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GameProvider, useGame } from "@/contexts/GameContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import GameCompletedGuard from "@/components/GameCompletedGuard";
import LevelGuard from "@/components/LevelGuard";
import CRTOverlay from "@/components/CRTOverlay";
import AntiCheat from "@/components/AntiCheat";
import HUD from "@/components/HUD";
import Login from "@/pages/Login";
import Intro from "@/pages/Intro";
import Instructions from "@/pages/Instructions";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLeaderboard from "@/pages/AdminLeaderboard";
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
  
  // Don't show HUD/AntiCheat/CRT on admin pages, intro, or instructions
  const isAdminPage = location.pathname.startsWith('/admin');
  const isIntroOrInstructions = location.pathname === '/intro' || location.pathname === '/instructions';
  const showHUD = isLoggedIn && location.pathname !== '/' && location.pathname !== '/victory' && !isAdminPage && !isIntroOrInstructions;

  return (
    <>
      {showHUD && <HUD />}
      {!isAdminPage && (
        <GameCompletedGuard>
          <AntiCheat />
          <CRTOverlay />
        </GameCompletedGuard>
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
          
          {/* Game Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/intro" element={
            <ProtectedRoute>
              <Intro />
            </ProtectedRoute>
          } />
          <Route path="/instructions" element={
            <ProtectedRoute>
              <Instructions />
            </ProtectedRoute>
          } />
          <Route path="/level/1" element={
            <ProtectedRoute>
              <LevelGuard requiredLevel={1}>
                <Level1 />
              </LevelGuard>
            </ProtectedRoute>
          } />
          <Route path="/level/2" element={
            <ProtectedRoute>
              <LevelGuard requiredLevel={2}>
                <Level2 />
              </LevelGuard>
            </ProtectedRoute>
          } />
          <Route path="/level/3" element={
            <ProtectedRoute>
              <LevelGuard requiredLevel={3}>
                <Level3 />
              </LevelGuard>
            </ProtectedRoute>
          } />
          <Route path="/level3-admin" element={
            <ProtectedRoute>
              <LevelGuard requiredLevel={2}>
                <Level3Admin />
              </LevelGuard>
            </ProtectedRoute>
          } />
          <Route path="/level3-complete" element={
            <ProtectedRoute>
              <LevelGuard requiredLevel={3}>
                <Level3Complete />
              </LevelGuard>
            </ProtectedRoute>
          } />
          <Route path="/level/4" element={
            <ProtectedRoute>
              <LevelGuard requiredLevel={4}>
                <Level4 />
              </LevelGuard>
            </ProtectedRoute>
          } />
          <Route path="/victory" element={<ProtectedRoute><Victory /></ProtectedRoute>} />
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
