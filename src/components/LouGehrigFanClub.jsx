import React, { useState } from 'react';
import { Calendar, Users, Heart, Award, Settings, Home, Image } from 'lucide-react';

const LouGehrigFanClub = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);

  const Navigation = () => (
    <nav className="bg-blue-900 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Award className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Lou Gehrig Fan Club</h1>
        </div>
        <div className="flex space-x-6">
          <button onClick={() => setCurrentView('home')} className={`flex items-center space-x-1 px-3 py-2 rounded ${currentView === 'home' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>
          <button onClick={() => setCurrentView('gallery')} className={`flex items-center space-x-1 px-3 py-2 rounded ${currentView === 'gallery' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
            <Image className="h-4 w-4" />
            <span>Gallery</span>
          </button>
          <button onClick={() => setCurrentView('milestones')} className={`flex items-center space-x-1 px-3 py-2 rounded ${currentView === 'milestones' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
            <Calendar className="h-4 w-4" />
            <span>Milestones</span>
          </button>
          <button onClick={() => setCurrentView('als')} className={`flex items-center space-x-1 px-3 py-2 rounded ${currentView === 'als' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
            <Heart className="h-4 w-4" />
            <span>ALS Support</span>
          </button>
          {isAdmin && (
            <button onClick={() => setCurrentView('admin')} className={`flex items-center space-x-1 px-3 py-2 rounded ${currentView === 'admin' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </button>
          )}
          <button onClick={() => setIsAdmin(!isAdmin)} className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700">
            {isAdmin ? 'Exit Admin' : 'Admin Login'}
          </button>
        </div>
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-12 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">The Iron Horse Lives On</h1>
          <p className="text-xl mb-6">Celebrating the life, legacy, and enduring inspiration of Lou Gehrig</p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Join the Club</span>
            </button>
            <button onClick={() => setCurrentView('als')} className="bg-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Support ALS Research</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="max-w-6xl mx-auto p-6">
        {currentView === 'home' && <HomePage />}
      </main>
    </div>
  );
};

export default LouGehrigFanClub;