'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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

export default function DoctorDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    // Fetch the specific doctor data
    fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json')
      .then((res) => res.json())
      .then((data) => {
        const doctorData = data.find((doc: Doctor) => doc.id === Number(id));
        
        if (doctorData) {
          // Enhance the data with more fields to match the UI
          const enhancedDoctor = {
            ...doctorData,
            type: doctorData.id % 2 === 0 ? 'General Physician' : 'Senior Specialist',
            clinic: doctorData.id % 3 === 0 ? 'Nursdoctor Clinic' : 'Yarmocoort',
            location: doctorData.id % 2 === 0 ? 'Apex Multispeciality and Maternity' : 'Dada Heights Clinic',
          };
          setDoctor(enhancedDoctor);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching doctor data:", error);
        setLoading(false);
      });
  }, [id]);

  const handleBooking = () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select both date and time slot');
      return;
    }

    alert(`Booking confirmed for Dr. ${doctor?.name} on ${selectedDate} at ${selectedTimeSlot}`);
    // Here you would typically submit the booking to your backend
    // For now, we'll just navigate back to the home page
    router.push('/');
  };

  // Generate next 7 days for appointment selection
  const getNextSevenDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        full: date.toISOString().split('T')[0]
      });
    }
    
    return days;
  };

  // Generate time slots
  const getTimeSlots = () => {
    const slots = [];
    const start = 9; // 9 AM
    const end = 18; // 6 PM
    
    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`);
      slots.push(`${hour % 12 || 12}:30 ${hour < 12 ? 'AM' : 'PM'}`);
    }
    
    return slots;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-xl">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Doctor Not Found</h1>
          <p className="mb-6">The doctor you are looking for does not exist or has been removed.</p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-6 py-3 transition duration-200">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-blue-800 py-3 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Doctors
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-6 px-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <div className="flex flex-col md:flex-row">
            {/* Doctor Image */}
            <div className="md:mr-6 mb-4 md:mb-0">
              <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold">{doctor.name.charAt(0)}</span>
              </div>
            </div>
            
            {/* Doctor Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-300">Dr. {doctor.name}</h1>
              <p className="text-gray-300 font-medium text-lg">{doctor.type}</p>
              <p className="text-gray-300 text-lg">{doctor.specialties.join(', ')}</p>
              <p className="text-gray-300 font-medium">{doctor.experience} years of experience</p>
              
              <div className="mt-4 flex items-center">
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
              
              <div className="mt-2 flex items-center">
                {doctor.mode === 'video' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-blue-300 font-medium">Video Consultation</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-green-300 font-medium">In-clinic Consultation</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center justify-center">
              <p className="font-bold text-3xl text-green-400">₹ {doctor.fees}</p>
              <p className="text-gray-300">Consultation Fee</p>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>
          
          {/* Date Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Date</h3>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {getNextSevenDays().map((day) => (
                <div 
                  key={day.full}
                  onClick={() => setSelectedDate(day.full)}
                  className={`flex-shrink-0 w-24 h-24 rounded-lg ${selectedDate === day.full ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 cursor-pointer transition duration-200 flex flex-col items-center justify-center`}
                >
                  <span className="font-bold">{day.day}</span>
                  <span className="text-lg font-bold">{day.date}</span>
                  <span>{day.month}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Time Slot Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Time Slot</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {getTimeSlots().map((slot) => (
                <div 
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`p-3 rounded-lg ${selectedTimeSlot === slot ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 cursor-pointer transition duration-200 text-center`}
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>
          
          {/* Booking Button */}
          <div className="text-center mt-8">
            <button 
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTimeSlot}
              className={`px-8 py-3 rounded-lg font-bold text-lg ${!selectedDate || !selectedTimeSlot ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition duration-200`}
            >
              Confirm Booking
            </button>
            <p className="mt-2 text-gray-400">
              {!selectedDate && !selectedTimeSlot ? 'Please select date and time to book' :
               !selectedDate ? 'Please select a date' :
               !selectedTimeSlot ? 'Please select a time slot' :
               `Booking for ${selectedDate} at ${selectedTimeSlot}`}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}