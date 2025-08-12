import React, { useState } from 'react';
import {
  FileText,
  Activity,
  GalleryHorizontalEnd,
  Home,
  LogIn,
  UserRoundSearch,
  Heart
} from 'lucide-react';

const Landing = () => {
  const [currentView, setCurrentView] = useState('home');

  const Navigation = () => (
    <nav className="flex flex-wrap gap-2 p-4 bg-blue-100 border-b border-blue-300">
      <button onClick={() => setCurrentView('home')}><Home className="inline-block w-4 h-4" /> Home</button>
      <button onClick={() => setCurrentView('gallery')}><GalleryHorizontalEnd className="inline-block w-4 h-4" /> Gallery</button>
      <button onClick={() => setCurrentView('milestones')}><Activity className="inline-block w-4 h-4" /> Milestones</button>
      <button onClick={() => setCurrentView('about')}><UserRoundSearch className="inline-block w-4 h-4" /> ALS</button>
      <button onClick={() => setCurrentView('admin')}><LogIn className="inline-block w-4 h-4" /> Admin Login</button>
    </nav>
  );

  const HomePage = () => (
    <>
      <section className="text-center mt-10">
        <h1 className="text-4xl font-bold mb-4">The Iron Horse Lives On</h1>
        <p className="text-lg mb-6">Celebrating the life, legacy, and enduring inspiration of Lou Gehrig</p>
        <div className="flex justify-center gap-4 mb-8">
          <button className="btn bg-blue-200"><UserRoundSearch className="inline-block w-4 h-4 mr-1" /> Join the Club</button>
          <button className="btn bg-blue-200"><Heart className="inline-block w-4 h-4 mr-1" /> Support ALS Research</button>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
          <p><strong>2,130</strong> Consecutive Games</p>
          <p><strong>493</strong> Home Runs</p>
          <p><strong>1,995</strong> RBIs</p>
          <p><strong>.340</strong> Career Average</p>
        </div>
      </section>
      <section className="mt-12 px-4">
        <h2 className="text-2xl font-semibold mb-2"><FileText className="inline-block w-5 h-5 mr-2" />Latest News</h2>
        <article className="mb-6">
          <h3 className="font-bold">Welcome to the Lou Gehrig Fan Club</h3>
          <p>Celebrating the Iron Horse’s incredible legacy...</p>
          <time dateTime="2025-01-31">2025-01-31</time>
        </article>
        <article className="mb-6">
          <h3 className="font-bold">ALS Awareness Month</h3>
          <p>Supporting ALS research in Lou's honor...</p>
          <time dateTime="2025-01-30">2025-01-30</time>
        </article>
      </section>
      <section className="mt-12 px-4">
        <h2 className="text-2xl font-semibold mb-2"><Activity className="inline-block w-5 h-5 mr-2" />Upcoming Milestones</h2>
        <ul>
          <li><strong>2025-06-02</strong><br />Lou Gehrig Day<br />Annual celebration of Lou Gehrig’s legacy</li>
          <li><strong>1923-06-15</strong><br />Yankees Debut<br />Lou Gehrig’s first game with the Yankees</li>
          <li><strong>1939-07-04</strong><br />Farewell Speech<br />The famous ‘Luckiest Man’ speech</li>
        </ul>
        <p className="mt-4 text-center italic">
          "Today I consider myself the luckiest man on the face of the earth."<br />
          – Lou Gehrig, July 4, 1939
        </p>
      </section>
    </>
  );

  const GalleryPage = () => (
    <section className="p-6 text-center">
      <h2 className="text-2xl font-bold">Gallery Coming Soon</h2>
      <p>This will feature historic photos, memorabilia, and fan contributions.</p>
    </section>
  );

  const MilestonesPage = () => (
    <section className="p-6 text-center">
      <h2 className="text-2xl font-bold">Milestones Timeline</h2>
      <p>A dynamic timeline of Lou Gehrig's life and legacy will be featured here.</p>
    </section>
  );

  const AboutPage = () => (
    <section className="p-6 text-center">
      <h2 className="text-2xl font-bold">ALS Awareness</h2>
      <p>The Lou Gehrig Fan Club supports ongoing ALS research and awareness campaigns in Lou’s memory.</p>
    </section>
  );

  const AdminLogin = () => (
    <section className="p-6 text-center">
      <h2 className="text-2xl font-bold">Admin Login</h2>
      <p>Restricted area for site administration. (Login system coming soon.)</p>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="max-w-6xl mx-auto p-6">
        {currentView === 'home' && <HomePage />}
        {currentView === 'gallery' && <GalleryPage />}
        {currentView === 'milestones' && <MilestonesPage />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'admin' && <AdminLogin />}
      </main>
      <footer className="bg-blue-900 text-white p-8 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">"Today I consider myself the luckiest man on the face of the earth."</p>
          <p className="text-blue-300">– Lou Gehrig, July 4, 1939</p>
          <div className="mt-6 pt-6 border-t border-blue-800">
            <p>&copy; 2025 Lou Gehrig Fan Club. Supporting ALS awareness and research.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;