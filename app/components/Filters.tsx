'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
interface FiltersProps {
  onFilterChange: (filters: any) => void;
  allSpecialties: string[];
}

export default function Filters({ onFilterChange, allSpecialties }: FiltersProps) {
  const router = useRouter();
  const [mode, setMode] = useState<string>('all');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('fees');

  // Handle filter changes and update URL params
  const updateFilters = (key: string, value: string | string[]) => {
    const query = new URLSearchParams(window.location.search);

    if (key === 'mode') {
      setMode(value as string);
      query.set('mode', value as string);
    }

    if (key === 'specialties') {
      setSpecialties(value as string[]);
      query.delete('specialty');
      (value as string[]).forEach((v) => query.append('specialty', v));
    }

    if (key === 'sort') {
      setSortBy(value as string);
      query.set('sort', value as string);
    }

    router.push(`/?${query.toString()}`);
    onFilterChange({
      mode: key === 'mode' ? value : mode,
      specialties: key === 'specialties' ? value : specialties,
      sort: key === 'sort' ? value : sortBy,
    });
  };

  return (
    <div className="border p-4 rounded-md shadow-sm mb-6">
      <h3 className="font-semibold mb-2">Filters</h3>

      {/* Specialties */}
      <div>
        <h4 className="font-medium mb-1">Specialties</h4>
        <div className="max-h-40 overflow-y-auto">
          {allSpecialties.map((spec) => (
            <label key={spec} className="block text-sm">
              <input
                type="checkbox"
                checked={specialties.includes(spec)}
                onChange={() => {
                  const updated = specialties.includes(spec)
                    ? specialties.filter((s) => s !== spec)
                    : [...specialties, spec];
                  updateFilters('specialties', updated);
                }}
              />
              {spec}
            </label>
          ))}
        </div>
      </div>

      {/* Mode of Consultation */}
      <div>
        <h4 className="font-medium mt-4">Mode of Consultation</h4>
        <div>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'video'}
              onChange={() => updateFilters('mode', 'video')}
            />
            Video Consultation
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'in-clinic'}
              onChange={() => updateFilters('mode', 'in-clinic')}
            />
            In-clinic Consultation
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'all'}
              onChange={() => updateFilters('mode', 'all')}
            />
            All
          </label>
        </div>
      </div>

      {/* Sort by */}
      <div>
        <h4 className="font-medium mt-4">Sort By</h4>
        <div>
          <label>
            <input
              type="radio"
              name="sort"
              checked={sortBy === 'fees'}
              onChange={() => updateFilters('sort', 'fees')}
            />
            Price: Low to High
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              checked={sortBy === 'experience'}
              onChange={() => updateFilters('sort', 'experience')}
            />
            Experience: Most Experienced First
          </label>
        </div>
      </div>
    </div>
  );
}
