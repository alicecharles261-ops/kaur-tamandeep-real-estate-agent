import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/")({
  component: AdminIndexRedirect,
});

function AdminIndexRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (user) {
        navigate({ to: "/admin/dashboard" });
      } else {
        navigate({ to: "/admin/login" });
      }
    }
  }, [user, loading, navigate]);

  return null;
}
