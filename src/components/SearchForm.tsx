
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter a word or phrase to search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          type="button"
          onClick={handleAddTerm}
          variant="outline"
          disabled={!searchInput.trim() || isLoading}
        >
          Add
        </Button>
      </div>

      {searchTerms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerms.map((term) => (
            <div
              key={term}
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              <span>{term}</span>
              <button
                type="button"
                onClick={() => handleRemoveTerm(term)}
                className="text-secondary-foreground/70 hover:text-secondary-foreground"
                disabled={isLoading}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={searchTerms.length === 0 || isLoading}
      >
        <Search className="w-4 h-4 mr-2" />
        Search PDF
      </Button>
    </form>
  );
};

export default SearchForm;
