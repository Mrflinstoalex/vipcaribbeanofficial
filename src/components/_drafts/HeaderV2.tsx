import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const HeaderV2 = ({ pathname }: { pathname: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Empleos", href: "/empleos" },
    { label: "Resultados", href: "/resultados" },
    { label: "Galería", href: "/galeria" },
    { label: "Quiénes Somos", href: "/quienes-somos" },
    { label: "FAQ", href: "/faq" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-0 bg-white/10 backdrop-blur-2xl shadow-[0_4px_32px_-4px_rgba(0,0,0,0.18)] border-b border-white/20"
          : "py-2 bg-white/5 backdrop-blur-md border-b border-white/10"
      }`}
    >
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-18">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-2xl lg:text-3xl font-display font-bold text-foreground drop-shadow-sm">
              VIP{" "}
              <span className="bg-gradient-to-r from-[hsl(200,70%,50%)] to-[hsl(220,50%,35%)] bg-clip-text text-transparent">
                Caribbean
              </span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-foreground bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/15"
                }`}
              >
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 bottom-1 h-px bg-gradient-to-r from-transparent via-[hsl(200,70%,50%)] to-transparent" />
                )}
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <a
            href="/aplicar"
            className="hidden lg:flex items-center gap-4"
          >
            <span className="relative inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-white/20 text-foreground border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:bg-white/30 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98]">
              Aplicar Ahora
            </span>
          </a>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/25"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/15 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium rounded-xl px-4 py-3 transition-all duration-150 ${
                    isActive(item.href)
                      ? "text-foreground bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                      : "text-foreground/70 hover:text-foreground hover:bg-white/12"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/15 mt-2">
                <a
                  href="/aplicar"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-full bg-white/20 text-foreground border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-sm transition-all duration-200 hover:bg-white/30 active:scale-[0.98]"
                >
                  Aplicar Ahora
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderV2;
