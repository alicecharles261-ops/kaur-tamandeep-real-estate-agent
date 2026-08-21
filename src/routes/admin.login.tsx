import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginComponent,
});

function AdminLoginComponent() {
  const { user, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal / Tab state for Forgot Password
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (user) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(email, password, rememberMe);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || "Failed to sign in. Please verify your credentials.");
    } else {
      setSuccessMessage("Authenticated successfully. Redirecting to Dashboard...");
      setTimeout(() => {
        navigate({ to: "/admin/dashboard" });
      }, 500);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);

    if (!resetEmail) {
      setResetStatus({ type: "error", msg: "Please enter your admin email address." });
      return;
    }

    setIsResetting(true);
    const { error } = await resetPassword(resetEmail);
    setIsResetting(false);

    if (error) {
      setResetStatus({ type: "error", msg: error.message || "Could not send password reset email." });
    } else {
      setResetStatus({
        type: "success",
        msg: "Password reset link has been dispatched to your email address.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#d4af37]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-700/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 shadow-xl shadow-[#d4af37]/10 mb-4">
            <ShieldCheck className="h-7 w-7 text-[#d4af37]" />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Kaur Tamandeep
          </h1>
          <p className="text-xs font-sans tracking-widest text-[#d4af37] uppercase mt-1">
            Luxury Real Estate Admin Portal
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-white/10 bg-[#121212]/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-serif font-semibold text-foreground">Admin Sign In</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your credentials to access the management dashboard.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-400 flex items-start gap-2">
              <span className="font-semibold shrink-0">Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cassandraburgos.com"
                  required
                  className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white caret-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-colors admin-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-10 py-2.5 text-sm text-white caret-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-colors admin-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-0 accent-[#d4af37]"
                />
                <span className="text-xs text-zinc-400">Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs text-[#d4af37] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-semibold py-3 text-sm shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Public Website</span>
            </a>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Reset Admin Password
              </h3>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-zinc-500 hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Enter your registered administrator email address below. We will send you a password reset link.
            </p>

            {resetStatus && (
              <div
                className={`mb-4 rounded-lg p-3 text-xs border ${
                  resetStatus.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {resetStatus.msg}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@cassandraburgos.com"
                  required
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white caret-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none admin-input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-400 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="rounded-lg bg-[#d4af37] text-black font-semibold px-4 py-2 text-xs shadow hover:brightness-110 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isResetting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Send Reset Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
