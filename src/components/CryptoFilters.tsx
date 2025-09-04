import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Star } from "lucide-react";

export type FilterCategory = 'all' | 'favorites' | 'gainers' | 'losers';
export type SortOption = 'market_cap_desc' | 'market_cap_asc' | 'price_desc' | 'price_asc' | 'volume_desc' | 'volume_asc' | 'percent_change_24h_desc' | 'percent_change_24h_asc' | 'percent_change_7d_desc' | 'percent_change_7d_asc';

interface CryptoFiltersProps {
  selectedCategory: FilterCategory;
  selectedSort: SortOption;
  onCategoryChange: (category: FilterCategory) => void;
  onSortChange: (sort: SortOption) => void;
}

export function CryptoFilters({ 
  selectedCategory, 
  selectedSort, 
  onCategoryChange, 
  onSortChange 
}: CryptoFiltersProps) {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">

      </div>
    </div>
  );
}