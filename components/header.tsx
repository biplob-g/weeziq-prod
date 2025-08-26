"use client";

import type React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { UserProfile } from "./user-profile";
import { useRouter, usePathname } from "next/navigation";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Features", href: "#features-section" },
    { name: "Blog", href: "/blog" },
    { name: "Pricing", href: "#pricing-section" },
    { name: "FAQ", href: "#faq-section" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    // If we're not on the home page, navigate there first
    if (pathname !== "/") {
      router.push(`/${href}`);
      return;
    }

    const targetId = href.substring(1); // Remove '#' from href
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      // Account for sticky header height
      const headerHeight = 80;
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleSignIn = () => {
    router.push("/auth/sign-in");
  };

  const handleSignOut = () => {
    setUser(null);
    router.push("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full py-4 px-6 transition-all duration-300 ${
        isScrolled
          ? "header-glassmorphism"
          : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          <span className="text-foreground text-xl font-semibold">WeezIQ</span>
        </Link>

        <nav className="hidden lg:flex items-center justify-center flex-1">
          <div className="px-2 py-2">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleScroll(e, item.href)}
                  className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-full font-medium transition-all duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <UserProfile user={user} onSignOut={handleSignOut} />
            ) : (
              <>
                <Link href="/auth/sign-up">
                  <Button className="btn-primary-gradient px-6 py-2 font-medium shadow-sm">
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu - Right Side */}
          <Sheet>
            <SheetTrigger asChild className="block lg:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] bg-background/95 backdrop-blur-xl border-l border-border text-foreground"
            >
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-semibold text-foreground">
                  Navigation
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleScroll(e, item.href)}
                    className="text-muted-foreground hover:text-foreground text-lg py-3 px-2 rounded-md transition-colors hover:bg-accent/50"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2">
                        <UserProfile user={user} onSignOut={handleSignOut} />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="ghost"
                        onClick={handleSignIn}
                        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      >
                        Sign In
                      </Button>
                      <Link href="/auth/sign-up" className="w-full">
                        <Button className="btn-primary-gradient px-6 py-3 font-medium shadow-sm w-full">
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
