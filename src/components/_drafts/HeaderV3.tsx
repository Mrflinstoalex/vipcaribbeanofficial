// Header V3: Transparent Dark — totalmente transparente sobre hero oscuro, se oscurece al hacer scroll
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const HeaderV3 = ({ pathname }: { pathname: string }) => {
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
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-lg border-b border-white/8"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <span className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">
              VIP Caribbean
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
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-1 w-1 h-1 rounded-full bg-white" />
                )}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <a
              href="/aplicar"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl bg-[#0f172a] text-white shadow-lg transition-all duration-200 hover:bg-[#1e293b] hover:shadow-xl active:scale-[0.98]"
            >
              Aplicar Ahora
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 bg-black/70 backdrop-blur-lg -mx-4 px-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium rounded-xl px-4 py-3 transition-all duration-150 ${
                    isActive(item.href)
                      ? "text-white bg-white/15"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10 mt-2">
                <a
                  href="/aplicar"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl bg-[#0f172a] text-white transition-all duration-200 hover:bg-[#1e293b] active:scale-[0.98]"
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

export default HeaderV3;
