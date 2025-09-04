import { useState } from 'react';
import { Search, Menu, Bell, User, LogOut, Briefcase, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AuthModal } from "./auth/AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { toast } from 'sonner@2.0.3';

interface HeaderProps {
  onPortfolioClick?: () => void;
  onSearchResults?: (results: any[]) => void;
}

export function Header({ onPortfolioClick, onSearchResults }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Sign out failed');
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim() || !onSearchResults) return;
    
    try {
      const { CryptoAPI } = await import('../services/cryptoApi');
      const data = await CryptoAPI.searchCoins(query);
      onSearchResults(data.coins || []);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">C</span>
                </div>
                <span className="font-semibold text-lg">CryptoTracker</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" className="text-sm">
                  Markets
                </Button>
                {user && (
                  <Button variant="ghost" className="text-sm" onClick={onPortfolioClick}>
                    Portfolio
                  </Button>
                )}
                <Button variant="ghost" className="text-sm">
                  Trade
                </Button>
                <Button variant="ghost" className="text-sm">
                  Learn
                </Button>
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search cryptocurrencies..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                />
              </div>
              
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-destructive"></Badge>
              </Button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="font-medium">
                      {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onPortfolioClick}>
                      <Briefcase className="w-4 h-4 mr-2" />
                      Portfolio
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  Sign In
                </Button>
              )}
              
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}