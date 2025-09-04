import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Filter, Star } from "lucide-react";

export function CryptoFilters() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full sm:w-auto">
          <TabsList className="grid w-full sm:w-auto grid-cols-4 sm:grid-cols-none">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Select defaultValue="market-cap">
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market-cap">Market Cap</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="change-24h">24h Change</SelectItem>
              <SelectItem value="change-7d">7d Change</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}