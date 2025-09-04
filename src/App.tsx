import { useState, useTransition } from 'react';
import { Header } from "./components/Header";
import { MarketOverview } from "./components/MarketOverview";
import { CryptoFilters } from "./components/CryptoFilters";
import { CryptoList } from "./components/CryptoList";
import { CoinDetailPage } from "./components/CoinDetailPage";
import { PortfolioDashboard } from "./components/PortfolioDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "./components/Toaster";

type Page = 'market' | 'coin-detail' | 'portfolio';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('market');
  const [selectedCoinId, setSelectedCoinId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePageTransition = (newPage: Page, coinId?: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      if (coinId) {
        setSelectedCoinId(coinId);
      }
      setIsTransitioning(false);
    }, 150);
  };

  const handleCoinSelect = (coinId: string) => {
    handlePageTransition('coin-detail', coinId);
  };

  const handleBackToMarket = () => {
    setSelectedCoinId('');
    setSearchResults([]);
    handlePageTransition('market');
  };

  const handlePortfolioClick = () => {
    handlePageTransition('portfolio');
  };

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <PortfolioProvider>
          <div className="min-h-screen bg-background">
            <Header 
              onPortfolioClick={handlePortfolioClick}
              onSearchResults={handleSearchResults}
            />
            <main className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100 fade-in'}`}>
              {currentPage === 'market' && (
                <>
                  <MarketOverview />
                  <CryptoFilters />
                  <CryptoList 
                    onCoinSelect={handleCoinSelect}
                    searchResults={searchResults.length > 0 ? searchResults : undefined}
                  />
                </>
              )}
              {currentPage === 'coin-detail' && selectedCoinId && (
                <CoinDetailPage
                  coinId={selectedCoinId}
                  onBack={handleBackToMarket}
                />
              )}
              {currentPage === 'portfolio' && (
                <PortfolioDashboard
                  onBack={handleBackToMarket}
                  onCoinSelect={handleCoinSelect}
                />
              )}
            </main>
            <Toaster />
          </div>
        </PortfolioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}