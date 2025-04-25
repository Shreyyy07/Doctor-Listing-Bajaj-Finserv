'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Doctor {
  id: number;
  name: string;
  experience: number;
  fees: number;
  specialties: string[];
  mode: string;
  clinic?: string;
  location?: string;
  type?: string;
}

export default function HomePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [sortBy, setSortBy] = useState<string>('');
  const [specialty, setSpecialty] = useState<string[]>([]);
  const [consultationMode, setConsultationMode] = useState<string>('');
  const [searchSpecialty, setSearchSpecialty] = useState<string>('');
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch doctor data from the API
  useEffect(() => {
    fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json')
      .then((res) => res.json())
      .then((data) => {
        // Enhance the data with more fields to match the UI
        const enhancedData = data.map((doc: Doctor, index: number) => ({
          ...doc,
          type: index % 2 === 0 ? 'General Physician' : 'Senior Specialist',
          clinic: index % 3 === 0 ? 'Nursdoctor Clinic' : 'Yarmocoort',
          location: index % 2 === 0 ? 'Apex Multispeciality and Maternity' : 'Dada Heights Clinic',
        }));
        
        setDoctors(enhancedData);
        setFilteredDoctors(enhancedData);
        
        // Extract all unique specialties from the data
        const allSpecialties = new Set<string>();
        enhancedData.forEach(doc => {
          doc.specialties?.forEach(spec => allSpecialties.add(spec));
        });
        setAvailableSpecialties(Array.from(allSpecialties));
      })
      .catch(error => {
        console.error("Error fetching doctor data:", error);
      });
  }, []);

  // Handle booking appointment - direct to doctor details page
  const handleBookAppointment = (doctorId: number) => {
    router.push(`/doctor/${doctorId}`);
  };

  // Handle search input
  const handleSearch = (searchTerm: string) => {
    const query = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      query.set('search', searchTerm);
    } else {
      query.delete('search');
    }
    router.push(`/?${query.toString()}`);
  };

  // Filter specialties based on search term
  const getFilteredSpecialties = () => {
    if (!searchSpecialty) return availableSpecialties;
    return availableSpecialties.filter(spec => 
      spec.toLowerCase().includes(searchSpecialty.toLowerCase())
    );
  };

  // Apply filters
  const applyFilters = () => {
    if (doctors.length === 0) return;

    const search = searchParams.get('search')?.toLowerCase() || '';
    let filtered = [...doctors];

    // Filter by search term
    if (search) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(search) || 
        doc.specialties.some(spec => spec.toLowerCase().includes(search)) ||
        (doc.clinic && doc.clinic.toLowerCase().includes(search)) ||
        (doc.location && doc.location.toLowerCase().includes(search))
      );
    }

    // Filter by consultation mode
    if (consultationMode) {
      filtered = filtered.filter((doc) => doc.mode === consultationMode);
    }

    // Filter by selected specialties
    if (specialty.length > 0) {
      filtered = filtered.filter((doc) =>
        doc.specialties?.some((spec) => specialty.includes(spec))
      );
    }

    // Sort by fees or experience
    if (sortBy === 'price-low') {
      filtered = filtered.sort((a, b) => a.fees - b.fees);
    } else if (sortBy === 'price-high') {
      filtered = filtered.sort((a, b) => b.fees - a.fees);
    } else if (sortBy === 'experience') {
      filtered = filtered.sort((a, b) => b.experience - a.experience);
    }

    setFilteredDoctors(filtered);
  };

  // Update filters when URL parameters change
  useEffect(() => {
    const search = searchParams.get('search');
    const mode = searchParams.get('mode');
    const specialties = searchParams.getAll('specialty');
    const sort = searchParams.get('sort');

    if (mode) setConsultationMode(mode);
    if (specialties.length > 0) setSpecialty(specialties);
    if (sort) setSortBy(sort);

    applyFilters();
  }, [searchParams, doctors]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    const query = new URLSearchParams(searchParams.toString());
    
    if (filterType === 'mode') {
      setConsultationMode(value);
      if (value) {
        query.set('mode', value);
      } else {
        query.delete('mode');
      }
    } else if (filterType === 'sort') {
      setSortBy(value);
      if (value) {
        query.set('sort', value);
      } else {
        query.delete('sort');
      }
    }

    router.push(`/?${query.toString()}`);
  };

  // Handle specialty selection
  const handleSpecialtyChange = (spec: string, isChecked: boolean) => {
    let newSpecialties = [...specialty];
    
    if (isChecked) {
      newSpecialties.push(spec);
    } else {
      newSpecialties = newSpecialties.filter(s => s !== spec);
    }
    
    setSpecialty(newSpecialties);
    
    const query = new URLSearchParams(searchParams.toString());
    query.delete('specialty');
    newSpecialties.forEach(s => query.append('specialty', s));
    
    router.push(`/?${query.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setConsultationMode('');
    setSpecialty([]);
    setSortBy('');
    setSearchSpecialty('');
    router.push('/');
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Top Search Bar */}
      <header className="bg-blue-800 py-3 px-4">
        <div className="max-w-6xl mx-auto relative">
          <div className="flex items-center bg-gray-800 rounded-md w-full">
            <input
              type="text"
              placeholder="Search Symptoms, Doctors, Specialties, Clinics"
              className="px-4 py-3 rounded-md w-full outline-none bg-gray-800 text-white placeholder-gray-400"
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.get('search') || ''}
            />
            <button className="absolute right-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 px-4 flex">
        {/* Sidebar Filters */}
        <div className="w-72 pr-6">
          {/* Sort By */}
          <div className="mb-6 bg-gray-800 p-5 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Sort by</h3>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div>
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id="price-low"
                  name="sort"
                  className="mr-3 h-4 w-4"
                  checked={sortBy === 'price-low'}
                  onChange={() => handleFilterChange('sort', 'price-low')}
                />
                <label htmlFor="price-low" className="font-medium">Price: Low-High</label>
              </div>
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id="price-high"
                  name="sort"
                  className="mr-3 h-4 w-4"
                  checked={sortBy === 'price-high'}
                  onChange={() => handleFilterChange('sort', 'price-high')}
                />
                <label htmlFor="price-high" className="font-medium">Price: High-Low</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="experience"
                  name="sort"
                  className="mr-3 h-4 w-4"
                  checked={sortBy === 'experience'}
                  onChange={() => handleFilterChange('sort', 'experience')}
                />
                <label htmlFor="experience" className="font-medium">Experience: Most Experience first</label>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 p-5 rounded shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Filters</h3>
              <button 
                onClick={clearAllFilters} 
                className="text-blue-400 text-sm font-semibold hover:text-blue-300 transition duration-200"
              >
                Clear All
              </button>
            </div>
            {specialty.length > 0 || consultationMode || sortBy ? (
              <div className="flex flex-wrap gap-2">
                {specialty.map(spec => (
                  <div key={spec} className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    {spec}
                    <button 
                      onClick={() => handleSpecialtyChange(spec, false)}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {consultationMode && (
                  <div className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    {consultationMode === 'video' ? 'Video Consultation' : 'In-clinic Consultation'}
                    <button 
                      onClick={() => handleFilterChange('mode', '')}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {sortBy && (
                  <div className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    {sortBy === 'price-low' ? 'Price: Low-High' : 
                     sortBy === 'price-high' ? 'Price: High-Low' : 'Experience'}
                    <button 
                      onClick={() => handleFilterChange('sort', '')}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No filters applied</div>
            )}
          </div>

          {/* Specialties */}
          <div className="bg-gray-800 p-5 rounded shadow mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Specialties</h3>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search Specialties"
                className="w-full p-3 border border-gray-700 rounded text-sm bg-gray-700 text-white placeholder-gray-400"
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {getFilteredSpecialties().map((spec) => (
                <div key={spec} className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id={spec}
                    className="mr-3 h-4 w-4"
                    checked={specialty.includes(spec)}
                    onChange={(e) => handleSpecialtyChange(spec, e.target.checked)}
                  />
                  <label htmlFor={spec} className="font-medium">{spec}</label>
                </div>
              ))}
              {getFilteredSpecialties().length === 0 && (
                <p className="text-gray-400 text-sm">No specialties found</p>
              )}
            </div>
          </div>

          {/* Mode of consultation */}
          <div className="bg-gray-800 p-5 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Mode of consultation</h3>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div>
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id="video-consultation"
                  name="mode"
                  className="mr-3 h-4 w-4"
                  checked={consultationMode === 'video'}
                  onChange={() => handleFilterChange('mode', 'video')}
                />
                <label htmlFor="video-consultation" className="font-medium">Video Consultation</label>
              </div>
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id="in-clinic"
                  name="mode"
                  className="mr-3 h-4 w-4"
                  checked={consultationMode === 'in-clinic'}
                  onChange={() => handleFilterChange('mode', 'in-clinic')}
                />
                <label htmlFor="in-clinic" className="font-medium">In-clinic Consultation</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="all-modes"
                  name="mode"
                  className="mr-3 h-4 w-4"
                  checked={consultationMode === ''}
                  onChange={() => handleFilterChange('mode', '')}
                />
                <label htmlFor="all-modes" className="font-medium">All</label>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Listings */}
        <div className="flex-1">
          {filteredDoctors.length > 0 ? (
            <>
              <div className="mb-4 text-gray-300">
                Found {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} matching your criteria
              </div>
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-gray-800 p-5 rounded shadow mb-5 hover:bg-gray-700 transition duration-200">
                  <div className="flex">
                    {/* Doctor Image */}
                    <div className="mr-5">
                      <Link href={`/doctor/${doctor.id}`}>
                        <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition duration-200">
                          <span className="text-2xl font-bold">{doctor.name.charAt(0)}</span>
                        </div>
                      </Link>
                    </div>
                    
                    {/* Doctor Info */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link href={`/doctor/${doctor.id}`} className="hover:underline">
                            <h2 className="font-bold text-xl text-blue-300">Dr. {doctor.name}</h2>
                          </Link>
                          <p className="text-gray-300 font-medium">{doctor.type}</p>
                          <p className="text-gray-300">{doctor.specialties && doctor.specialties.join(', ')}</p>
                          <p className="text-gray-300 font-medium">{doctor.experience} yrs exp.</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-green-400">₹ {doctor.fees}</p>
                        </div>
                      </div>
                      
                      {/* Location & Clinic Info */}
                      <div className="mt-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-300 font-medium">{doctor.location}</span>
                      </div>
                      <div className="mt-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-300 font-medium">{doctor.clinic}</span>
                      </div>
                      
                      {/* Mode of Consultation */}
                      <div className="mt-2 flex items-center">
                        {doctor.mode === 'video' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-blue-300 font-medium">Video Consultation Available</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-green-300 font-medium">In-clinic Consultation Available</span>
                          </>
                        )}
                      </div>
                      
                      {/* Book Button */}
                      <div className="mt-4 text-right">
                        <button 
                          onClick={() => handleBookAppointment(doctor.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-6 py-2 transition duration-200 flex items-center ml-auto"
                          aria-label={`Book appointment with Dr. ${doctor.name}`}
                        >
                          <span>Book Appointment</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="bg-gray-800 p-8 rounded shadow text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-bold">No doctors found</p>
              <p className="text-gray-400 mt-2">Please try different filters or search terms</p>
              <button 
                onClick={clearAllFilters}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-6 py-2 transition duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}