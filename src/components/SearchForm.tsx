
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchFormProps {
  onSearch: (searchTerms: string[]) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const handleAddTerm = () => {
    if (searchInput.trim() && !searchTerms.includes(searchInput.trim())) {
      const newTerms = [...searchTerms, searchInput.trim()];
      setSearchTerms(newTerms);
      setSearchInput('');
    }
  };

  const handleRemoveTerm = (term: string) => {
    setSearchTerms(searchTerms.filter((t) => t !== term));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerms.length > 0) {
      onSearch(searchTerms);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTerm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center bg-[#1c2131] rounded-md px-2 border border-gray-700">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        
        {searchTerms.length > 0 && (
          <div className="flex flex-wrap gap-1 py-2">
            {searchTerms.map((term, index) => (
              <div
                key={term}
                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
                ${['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'][index % 5]}`}
              >
                <span>{term}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(term)}
                  className="hover:text-white/90"
                  disabled={isLoading}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <Input
          type="text"
          placeholder="Add search term..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
          disabled={isLoading}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAddTerm}
          disabled={!searchInput.trim() || isLoading}
          className="text-gray-300"
        >
          Add
        </Button>
        
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          disabled={searchTerms.length === 0 || isLoading}
          className="text-gray-300"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchForm;
