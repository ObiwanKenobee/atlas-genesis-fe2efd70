import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_MS = 60_000; // 1 request / minute per browser
const MIN_FILL_MS = 1500; // bots usually submit faster than this
const COOLDOWN_KEY = "newsletter:lastAttemptAt";

// Optional bot-protection widgets — render only when a site key is provided.
// Supports either Cloudflare Turnstile or hCaptcha. Site keys are public.
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY as string | undefined;
const CAPTCHA_PROVIDER: "turnstile" | "hcaptcha" | null = TURNSTILE_SITE_KEY
  ? "turnstile"
  : HCAPTCHA_SITE_KEY
    ? "hcaptcha"
    : null;

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset?: (id?: string) => void };
    hcaptcha?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset?: (id?: string) => void };
  }
}

function useCaptchaScript() {
  useEffect(() => {
    if (!CAPTCHA_PROVIDER) return;
    const src =
      CAPTCHA_PROVIDER === "turnstile"
        ? "https://challenges.cloudflare.com/turnstile/v0/api.js"
        : "https://js.hcaptcha.com/1/api.js";
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, []);
}

const NewsletterBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const captchaWidgetId = useRef<string | null>(null);

  useCaptchaScript();

  // Mount captcha widget when the form expands
  useEffect(() => {
    if (!isExpanded || !CAPTCHA_PROVIDER || !captchaRef.current) return;
    let cancelled = false;
    const interval = window.setInterval(() => {
      if (cancelled) return;
      const api = CAPTCHA_PROVIDER === "turnstile" ? window.turnstile : window.hcaptcha;
      if (!api || !captchaRef.current || captchaWidgetId.current) return;
      const siteKey = (CAPTCHA_PROVIDER === "turnstile" ? TURNSTILE_SITE_KEY : HCAPTCHA_SITE_KEY) as string;
      try {
        captchaWidgetId.current = api.render(captchaRef.current, {
          sitekey: siteKey,
          callback: (token: string) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(null),
          "error-callback": () => setCaptchaToken(null),
          size: "normal",
        });
        window.clearInterval(interval);
      } catch {
        /* widget still loading */
      }
    }, 200);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isExpanded]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Bot protection — invisible honeypot
    if (honeypot) {
      toast.success("Welcome to our newsletter!");
      setIsVisible(false);
      return;
    }

    // Bot protection — minimum interaction time
    if (openedAt && Date.now() - openedAt < MIN_FILL_MS) {
      toast.error("Please take a moment to review before subscribing.");
      return;
    }

    // Client-side rate limit (per browser)
    try {
      const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
      if (last && Date.now() - last < COOLDOWN_MS) {
        toast.error("Please wait a moment before trying again.");
        return;
      }
    } catch {
      /* localStorage unavailable — skip */
    }

    // Email format validation
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized) || normalized.length > 255) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Captcha verification (optional)
    if (CAPTCHA_PROVIDER && !captchaToken) {
      toast.error("Please complete the verification challenge.");
      return;
    }

    setIsLoading(true);
    try {
      try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch { /* noop */ }
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert({
          email: normalized,
          subscription_type: "general",
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome to our newsletter!");
        setIsVisible(false);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      if (CAPTCHA_PROVIDER) {
        const api = CAPTCHA_PROVIDER === "turnstile" ? window.turnstile : window.hcaptcha;
        try { api?.reset?.(captchaWidgetId.current ?? undefined); } catch { /* noop */ }
        setCaptchaToken(null);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 max-w-md"
      >
        <div className="relative bg-gradient-to-br from-card via-card to-primary/10 border border-border/50 rounded-2xl shadow-elevated backdrop-blur-xl overflow-hidden glass-panel">
          {/* Decorative gradient orb */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
          
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors z-10"
            aria-label="Close newsletter banner"
            title="Close newsletter banner"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="relative p-5">
            {!isExpanded ? (
              <motion.div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => { setIsExpanded(true); setOpenedAt(Date.now()); }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-ocean flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-xs font-medium text-accent uppercase tracking-wider">
                      Stay Updated
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    Get weekly insights on regenerative impact
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Join Our Newsletter
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Weekly updates on carbon markets, impact stories, and exclusive opportunities.
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-3">
                  {/* Honeypot — hidden from users, bots fill it */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
                    data-testid="newsletter-honeypot"
                  />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border/50"
                    required
                    data-testid="newsletter-email"
                  />
                  {CAPTCHA_PROVIDER && (
                    <div ref={captchaRef} data-testid="newsletter-captcha" className="flex justify-center" />
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-primary to-ocean"
                      data-testid="newsletter-submit"
                    >
                      {isLoading ? "Subscribing..." : "Subscribe"}
                    </Button>
                  </div>
                </form>

                <p className="text-xs text-muted-foreground text-center">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewsletterBanner;
