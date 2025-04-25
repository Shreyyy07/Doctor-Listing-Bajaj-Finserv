'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  doctorNames: string[];
}

export default function SearchBar({ doctorNames }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const term = searchParams.get('search') || '';
    setInput(term);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const matches = doctorNames
      .filter((name) =>
        name.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 3); // top 3 suggestions
    setSuggestions(matches);
  };

  const applySearch = (value: string) => {
    setInput(value);
    setSuggestions([]);

    const query = new URLSearchParams(window.location.search);
    query.set('search', value);
    router.push(`/?${query.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applySearch(input);
    }
  };

  return (
    <div className="relative w-full max-w-lg mb-6">
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search Doctors, Specialists, Clinics..."
        className="w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        data-testid="autocomplete-input"
      />
      {suggestions.length > 0 && (
        <ul className="absolute w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => applySearch(suggestion)}
              data-testid="suggestion-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
