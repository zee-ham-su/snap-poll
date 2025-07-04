"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { PlusCircle, Vote, BarChart3, User, LogOut, Shield, Sun, Moon } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-blue-600">
            PollApp
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            />
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/polls"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/polls") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Vote className="w-4 h-4" />
              <span>Browse Polls</span>
            </Link>

            {user && (
              <>
                <Link
                  href="/create"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive("/create") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Poll</span>
                </Link>

                <Link
                  href="/my-polls"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive("/my-polls") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>My Polls</span>
                </Link>

                <Link
                  href="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive("/admin") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </Button>

            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/polls">Browse Polls</Link>
            </Button>
            {user && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/create">Create Poll</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/my-polls">My Polls</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
