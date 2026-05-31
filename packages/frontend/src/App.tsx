import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/features/auth/LoginPage";
import { AdminPage } from "@/features/admin/AdminPage";
import { BrokerApp } from "@/features/broker/BrokerApp";

const queryClient = new QueryClient();

// Decide qué mostrar según el estado de auth — sin redirecciones
function AppContent() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;
  if (user.role === "ADMIN") return <AdminPage />;
  return <BrokerApp />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <AppContent />
            <Toaster richColors position="top-right" />
        </AuthProvider>
    </QueryClientProvider>
  );
}