import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Heart, MapPin, Bed, Bath, Square, Sparkles,
  ChevronRight, X, ArrowUpRight, Volume2, VolumeX, Shield,
  CheckCircle2, Calculator, Building, Sun, Layers, Check, Layers3, Compass as CompassIcon
} from 'lucide-react';

// --- Types ---
interface Property {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  sunExposure: string;
  architect: string;
  images: string[];
  description: string;
  features: string[];
}

type PropertyTab = 'overview' | 'floorplan';

// --- Web Audio API Micro-Interactions ---
class SoundManager {
  ctx: AudioContext | null = null;
  enabled = true;

  init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch (e) {}
  }

  playChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch (e) {}
  }
}

const sounds = new SoundManager();

// --- Property Mock Data ---
const PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'The Solstice Pavilion',
    category: 'Coastal',
    location: 'Big Sur, California',
    price: 14500000,
    beds: 5,
    baths: 6,
    sqft: 7800,
    yearBuilt: 2024,
    sunExposure: 'South-West Panoramic',
    architect: 'Olson Kundig Atelier',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'Cantilevered over the rugged Pacific coastline, Solstice Pavilion synthesizes raw board-formed concrete with floor-to-ceiling glass to capture dramatic ocean vistas and golden hour sunset reflections.',
    features: ['Infinite Ocean View Pool', 'Geothermal Heating', 'Private Helipad', 'Wine Cellar', 'Automated Solar Louvers']
  },
  {
    id: 'prop-2',
    title: 'Aura Desert Sanctuary',
    category: 'Desert Modernism',
    location: 'Scottsdale, Arizona',
    price: 8900000,
    beds: 4,
    baths: 4.5,
    sqft: 6200,
    yearBuilt: 2023,
    sunExposure: '360° Open Horizon',
    architect: 'Studio Kendle',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'Earthy rammed earth walls blend seamlessly into the Sonoran desert ecosystem. Features central reflective water courtyards, desert botanical gardens, and zero-edge oasis pools.',
    features: ['Rammed Earth Walls', 'Desert Courtyard', 'Solar Microgrid', 'Zen Meditation Deck', 'Reflective Plunge Pool']
  },
  {
    id: 'prop-3',
    title: 'Komorebi Forest Villa',
    category: 'Mountain Retreat',
    location: 'Aspen, Colorado',
    price: 18200000,
    beds: 6,
    baths: 7,
    sqft: 9400,
    yearBuilt: 2024,
    sunExposure: 'South-East Mountain View',
    architect: 'Kengo Kuma Associates',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'A masterpiece of Japanese cedar craftsmanship nestled within Aspen birch forest. Floor-to-ceiling glass panels slide open to integrate interior living with alpine nature.',
    features: ['Heated Driveway', 'Private Spa & Onsen', 'Ski-in / Ski-out', 'Custom Timber Joinery', 'Oxygen-Enriched Master Suite']
  },
  {
    id: 'prop-4',
    title: 'The Apex Glass Penthouse',
    category: 'Penthouse',
    location: 'TriBeCa, New York',
    price: 22500000,
    beds: 4,
    baths: 5,
    sqft: 6800,
    yearBuilt: 2023,
    sunExposure: 'East to West Skyline',
    architect: 'Foster + Partners',
    images: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'Crown of TriBeCa, this triplex penthouse features 360-degree skyline views, a private rooftop glass observatory pool, and bespoke Italian minimalist finishes throughout.',
    features: ['Rooftop Observatory Pool', 'Private High-Speed Elevator', 'Smart Glass Privacy Control', '1500 sq ft Terrace', '24/7 White-Glove Butler']
  },
  {
    id: 'prop-5',
    title: 'Vesper Minimalist Manor',
    category: 'Minimalist Villa',
    location: 'Austin, Texas',
    price: 6800000,
    beds: 4,
    baths: 4,
    sqft: 5500,
    yearBuilt: 2022,
    sunExposure: 'Direct South',
    architect: 'Bercy Chen Studio',
    images: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'Monolithic travertine forms and floating glass bridge corridors define this tranquil hill country compound surrounded by oak canopies and calm water basins.',
    features: ['Travertine Courtyard', 'Floating Glass Bridge', 'Infinity Pool', 'Native Forest Conservation', 'Art Gallery Lighting']
  },
  {
    id: 'prop-6',
    title: 'Elysian Ocean Pavilion',
    category: 'Coastal',
    location: 'Malibu, California',
    price: 16900000,
    beds: 5,
    baths: 6,
    sqft: 7200,
    yearBuilt: 2024,
    sunExposure: 'Direct Sunset Ocean Vistas',
    architect: 'SAOTA Architecture',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'Perched directly above Carbon Beach with direct private staircase access. Floor-to-ceiling automated sliding glass facades create an seamless indoor-outdoor coastal sanctuary.',
    features: ['Private Beach Access', 'Zero-Edge Horizon Pool', 'Outdoor Fire Sanctuary', 'Sub-Zero & Gaggenau Kitchen', 'Wellness Sauna']
  }
];

const CATEGORIES = [
  { id: 'All', label: 'All Sanctuaries' },
  { id: 'Coastal', label: 'Coastal Havens' },
  { id: 'Desert Modernism', label: 'Desert Modernism' },
  { id: 'Mountain Retreat', label: 'Alpine Retreats' },
  { id: 'Penthouse', label: 'Urban Penthouses' },
  { id: 'Minimalist Villa', label: 'Minimalist Villas' }
];

export default function App() {
  // --- States ---
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aurelia_favs');
      const parsed: unknown = saved ? JSON.parse(saved) : ['prop-1'];
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : ['prop-1'];
    } catch (e) {
      return ['prop-1'];
    }
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState(25000000);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activePropertyTab, setActivePropertyTab] = useState<PropertyTab>('overview');
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState('home');

  // Mouse Spotlight Coordinates State
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });

  // Calculator State
  const [calcPrice, setCalcPrice] = useState(12000000);
  const [calcDown, setCalcDown] = useState(20);
  const [calcRate, setCalcRate] = useState(6.2);
  const [calcYears, setCalcYears] = useState(30);

  // Sync Global Mouse Spotlight Trajectory
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sync Local Storage
  useEffect(() => {
    try {
      localStorage.setItem('aurelia_favs', JSON.stringify(favorites));
    } catch (e) {}
  }, [favorites]);

  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playChime();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredProperties = useMemo(() => {
    return PROPERTIES.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesLocation = searchLocation === '' || 
        p.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        p.title.toLowerCase().includes(searchLocation.toLowerCase());
      const matchesPrice = p.price <= maxPrice;
      return matchesCategory && matchesLocation && matchesPrice;
    });
  }, [activeCategory, searchLocation, maxPrice]);

  const savedPropertiesList = useMemo(() => {
    return PROPERTIES.filter(p => favorites.includes(p.id));
  }, [favorites]);

  const totalSavedValue = useMemo(() => {
    return savedPropertiesList.reduce((acc, p) => acc + p.price, 0);
  }, [savedPropertiesList]);

  // Mortgage Math
  const monthlyPayment = useMemo(() => {
    const principal = calcPrice * (1 - calcDown / 100);
    const monthlyRate = (calcRate / 100) / 12;
    const totalPayments = calcYears * 12;
    if (monthlyRate === 0) return principal / totalPayments;
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                    (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return isNaN(payment) ? 0 : Math.round(payment);
  }, [calcPrice, calcDown, calcRate, calcYears]);

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1816] font-sans antialiased selection:bg-[#C8A870] selection:text-white relative overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. GLOBAL PAGE-WIDE AMBIENT SPOTLIGHT & MAGNETIC TRAIL HOVER EFFECT */}
      {/* ========================================================================= */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(200, 168, 112, 0.14), rgba(124, 140, 126, 0.05) 40%, transparent 80%)`
        }}
      />

      {/* Subtle Architectural Blueprint Canvas Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#1A1816 1px, transparent 1px), linear-gradient(to right, #1A1816 1px, transparent 1px), linear-gradient(to bottom, #1A1816 1px, transparent 1px)`,
          backgroundSize: '48px 48px, 144px 144px, 144px 144px'
        }}
      />

      {/* ========================================================================= */}
      {/* 2. SLEEK SLEEK GLASS DOCK HEADER (REMOVED SOLID WHITE COVERS) */}
      {/* ========================================================================= */}
      <div className="sticky top-4 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="w-full backdrop-blur-xl bg-[#1A1816]/75 border border-[#1A1816]/15 rounded-full shadow-2xl transition-all duration-300 p-2 sm:p-2.5 flex items-center justify-between text-[#F8F6F0]">
          
          {/* Brand Logo: Avant-Garde Architectural Monogram */}
          <a 
            href="#home" 
            onClick={() => { sounds.playTick(); setActiveTab('home'); }}
            className="flex items-center gap-3 pl-3 pr-2 group"
          >
            <div className="relative w-9 h-9 rounded-full bg-white/10 border border-white/20 text-[#F8F6F0] flex items-center justify-center font-serif text-lg font-bold overflow-hidden transition-all duration-500 group-hover:bg-[#C8A870] group-hover:text-[#1A1816]">
              <span className="relative z-10">A</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-[0.2em] uppercase font-semibold text-[#F8F6F0] leading-none group-hover:text-[#C8A870] transition-colors">
                Aurelia
              </span>
              <span className="text-[9px] tracking-[0.25em] text-[#C8A870]/80 uppercase font-sans mt-0.5">
                Sanctuaries
              </span>
            </div>
          </a>

          {/* Gliding Glass Navigation Pill Dock */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10">
            {[
              { id: 'home', label: 'Sanctuaries', href: '#listings' },
              { id: 'lifestyle', label: 'Lifestyle', href: '#lifestyle' },
              { id: 'calculator', label: 'Capital', href: '#calculator' },
              { id: 'architects', label: 'Atelier', href: '#architects' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <a
                  key={tab.id}
                  href={tab.href}
                  onClick={() => { sounds.playTick(); setActiveTab(tab.id); }}
                  className={`relative px-5 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 ${
                    isActive ? 'text-[#1A1816] font-semibold' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {/* Glass Pill Dynamic Indicator */}
                  {isActive && (
                    <span className="absolute inset-0 bg-[#F8F6F0] rounded-full shadow-md border border-white/20 z-0 animate-fade-in" />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.label}
                    {isActive && <span className="w-1 h-1 rounded-full bg-[#BA7A50]" />}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Transparent Glass Action Triggers & Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Audio Toggle Glass Badge */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                sounds.playTick();
              }}
              title={soundEnabled ? "Mute spatial audio" : "Enable sound FX"}
              className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#C8A870]" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>

            {/* Saved Properties Glass Badge Trigger */}
            <button
              onClick={() => {
                sounds.playTick();
                setIsSavedDrawerOpen(true);
              }}
              className="relative w-9 h-9 sm:w-auto sm:px-3.5 sm:h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-[#C8A870] text-[#C8A870]' : 'text-white/80'}`} />
              <span className="text-xs font-medium tracking-wider hidden sm:inline text-stone-200">Saved</span>
              {favorites.length > 0 && (
                <span className="w-4 h-4 bg-[#C8A870] text-[#1A1816] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Glass Border Floating Action Button */}
            <button
              onClick={() => {
                sounds.playChime();
                setIsScheduleModalOpen(true);
              }}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full overflow-hidden bg-white/10 hover:bg-[#C8A870] text-white hover:text-[#1A1816] text-xs font-medium tracking-widest uppercase transition-all duration-500 shadow-lg hover:shadow-2xl border border-white/20 hover:border-[#C8A870]"
            >
              <span className="relative z-10 flex items-center gap-2 font-semibold">
                <span className="hidden sm:inline">Book Viewing</span>
                <span className="sm:hidden">Viewing</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </button>

          </div>

        </header>
      </div>


      {/* ========================================================================= */}
      {/* 3. HERO SECTION WITH CINEMATIC ARCHITECTURAL BACKGROUND */}
      {/* ========================================================================= */}
      <section id="home" className="relative min-h-[82vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden mt-2">
        
        {/* Visual Background Container */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl max-w-7xl mx-auto my-2 border border-[#1A1816]/10 shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85" 
            alt="Hero Architectural Sanctuary" 
            className="w-full h-full object-cover object-center filter brightness-[0.78] scale-105"
          />
          {/* Ambient Glass Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/90 via-[#1A1816]/30 to-[#1A1816]/50" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center pt-6 pb-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs tracking-widest uppercase mb-6 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-[#C8A870]" />
            <span>Living Monuments for Discerning Collectors</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.1] max-w-3xl drop-shadow-md">
            Find a Place That <span className="italic font-light text-[#F8F6F0]">Feels Like Yours</span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-white/80 max-w-2xl font-light leading-relaxed">
            Unrivaled coastal compounds, desert modernism, and alpine masterworks designed by world-renowned architectural ateliers.
          </p>

          {/* Floating Glass Search Interface */}
          <div className="mt-10 w-full max-w-3xl bg-black/40 backdrop-blur-2xl p-3 sm:p-4 rounded-3xl sm:rounded-full border border-white/20 shadow-2xl transition-all duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              
              {/* Location Input */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/10 rounded-2xl sm:rounded-full border border-white/10 hover:border-[#C8A870]/60 transition-colors">
                <MapPin className="w-4 h-4 text-[#C8A870] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Location or title..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder:text-white/50 focus:outline-none font-medium"
                />
              </div>

              {/* Category Selector */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/10 rounded-2xl sm:rounded-full border border-white/10 hover:border-[#C8A870]/60 transition-colors">
                <Building className="w-4 h-4 text-[#7C8C7E] flex-shrink-0" />
                <select
                  value={activeCategory}
                  onChange={(e) => { sounds.playTick(); setActiveCategory(e.target.value); }}
                  className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium border-none [&>option]:text-[#1A1816]"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Budget Range */}
              <div className="flex flex-col justify-center px-4 py-2 bg-white/10 rounded-2xl sm:rounded-full border border-white/10 hover:border-[#C8A870]/60 transition-colors">
                <div className="flex justify-between items-center text-[10px] text-white/70 font-medium mb-1">
                  <span>Max Valuation</span>
                  <span className="text-[#C8A870] font-bold">${(maxPrice / 1000000).toFixed(1)}M</span>
                </div>
                <input
                  type="range"
                  min="5000000"
                  max="30000000"
                  step="500000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#C8A870] h-1 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Action Search Button */}
              <button
                onClick={() => {
                  sounds.playChime();
                  const listingsElem = document.getElementById('listings');
                  if (listingsElem) listingsElem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full h-full min-h-[44px] bg-white/10 hover:bg-[#C8A870] text-white hover:text-[#1A1816] rounded-2xl sm:rounded-full font-medium text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 shadow-lg group"
              >
                <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Search ({filteredProperties.length})</span>
              </button>

            </div>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. FEATURED PROPERTY PORTFOLIO & FILTERING */}
      {/* ========================================================================= */}
      <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#7C8C7E] text-xs font-semibold uppercase tracking-widest mb-2">
              <CompassIcon className="w-4 h-4" />
              <span>Curated Index</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1816]">
              Architectural Sanctuaries
            </h2>
          </div>

          {/* Glass Transparent Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playTick();
                  setActiveCategory(cat.id);
                }}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider whitespace-nowrap transition-all duration-300 border ${
                  activeCategory === cat.id
                    ? 'bg-[#1A1816] text-white border-[#1A1816] shadow-md scale-105'
                    : 'bg-white/40 backdrop-blur-md text-[#1A1816]/80 border-[#1A1816]/10 hover:border-[#C8A870] hover:bg-white/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-12 text-center border border-[#1A1816]/10 shadow-sm max-w-xl mx-auto my-12">
            <Search className="w-12 h-12 text-[#C8A870] mx-auto mb-4 stroke-1" />
            <h3 className="font-serif text-xl text-[#1A1816] mb-2">No Sanctuaries Matched</h3>
            <p className="text-xs text-[#1A1816]/60 mb-6">
              Refine your location search or adjust maximum valuation budget.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchLocation('');
                setMaxPrice(30000000);
              }}
              className="px-6 py-2.5 bg-white/10 hover:bg-[#1A1816] text-[#1A1816] hover:text-white border border-[#1A1816]/20 text-xs font-medium tracking-wider rounded-full transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => {
              const isFav = favorites.includes(property.id);

              return (
                <div
                  key={property.id}
                  onClick={() => {
                    sounds.playTick();
                    setSelectedProperty(property);
                    setActivePropertyTab('overview');
                  }}
                  className="group cursor-pointer bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden border border-[#1A1816]/10 hover:border-[#C8A870]/60 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col transform hover:-translate-y-1.5"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Category & Favorite Badge */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-white tracking-wider uppercase shadow-sm">
                        {property.category}
                      </span>

                      <button
                        onClick={(e) => toggleFavorite(property.id, e)}
                        className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#1A1816] shadow-md transition-transform active:scale-125"
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-[#C8A870] text-[#C8A870]' : 'text-white'}`} />
                      </button>
                    </div>

                    {/* Valuation Price Tag */}
                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="font-serif text-2xl font-normal text-white drop-shadow-md">
                        ${(property.price / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  </div>

                  {/* Card Information */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#7C8C7E] text-xs font-medium mb-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>

                      <h3 className="font-serif text-xl font-normal text-[#1A1816] group-hover:text-[#BA7A50] transition-colors mb-2">
                        {property.title}
                      </h3>

                      <p className="text-xs text-[#1A1816]/60 font-light line-clamp-2 leading-relaxed mb-6">
                        {property.description}
                      </p>
                    </div>

                    {/* Specs Grid Bar */}
                    <div className="pt-4 border-t border-[#1A1816]/5 grid grid-cols-3 gap-2 text-center">
                      <div className="flex flex-col items-center p-2 rounded-2xl bg-white/50 border border-[#1A1816]/5">
                        <Bed className="w-3.5 h-3.5 text-[#C8A870] mb-1" />
                        <span className="text-[10px] text-[#1A1816]/50 font-medium">Beds</span>
                        <span className="text-xs font-semibold text-[#1A1816]">{property.beds}</span>
                      </div>

                      <div className="flex flex-col items-center p-2 rounded-2xl bg-white/50 border border-[#1A1816]/5">
                        <Bath className="w-3.5 h-3.5 text-[#7C8C7E] mb-1" />
                        <span className="text-[10px] text-[#1A1816]/50 font-medium">Baths</span>
                        <span className="text-xs font-semibold text-[#1A1816]">{property.baths}</span>
                      </div>

                      <div className="flex flex-col items-center p-2 rounded-2xl bg-white/50 border border-[#1A1816]/5">
                        <Square className="w-3.5 h-3.5 text-[#BA7A50] mb-1" />
                        <span className="text-[10px] text-[#1A1816]/50 font-medium">Sq Ft</span>
                        <span className="text-xs font-semibold text-[#1A1816]">{property.sqft.toLocaleString()}</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* ========================================================================= */}
      {/* 5. LIFESTYLE DOMAINS */}
      {/* ========================================================================= */}
      <section id="lifestyle" className="bg-[#1A1816] text-[#F8F6F0] py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#C8A870] text-xs font-semibold tracking-widest uppercase">
              Curated Environments
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal mt-3">
              Living Domains
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm font-light mt-4">
              Categorized by distinct natural vistas, architectural profiles, and ambient solar paths.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Coastal Havens', count: '2 Residences', img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', cat: 'Coastal' },
              { title: 'Desert Modernism', count: '1 Residence', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', cat: 'Desert Modernism' },
              { title: 'Alpine Retreats', count: '1 Residence', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', cat: 'Mountain Retreat' },
              { title: 'Urban Heights', count: '1 Residence', img: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=800&q=80', cat: 'Penthouse' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  sounds.playTick();
                  setActiveCategory(item.cat);
                  const elem = document.getElementById('listings');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#C8A870] transition-all duration-500"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all" />
                
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[10px] text-[#C8A870] font-medium tracking-widest uppercase">
                    {item.count}
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-white mt-1">
                    {item.title}
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-stone-300 group-hover:text-white font-medium transition-all">
                    <span>Explore Domain</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C8A870] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. WEALTH & MORTGAGE CALCULATOR */}
      {/* ========================================================================= */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-[#1A1816]/10 shadow-xl relative overflow-hidden">
          
          <div className="max-w-xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C8C7E]/10 text-[#7C8C7E] text-xs font-semibold uppercase tracking-wider mb-3">
              <Calculator className="w-3.5 h-3.5" />
              <span>Capital Structure Modeling</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1816]">
              Financial Sanctuary Estimator
            </h2>
            <p className="text-xs sm:text-sm text-[#1A1816]/60 font-light mt-2">
              Model bespoke mortgage allocations and capital commitments in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-[#1A1816] mb-2">
                  <span>Target Valuation</span>
                  <span className="font-serif text-base text-[#BA7A50]">${(calcPrice / 1000000).toFixed(2)}M</span>
                </div>
                <input
                  type="range"
                  min="2000000"
                  max="40000000"
                  step="500000"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value))}
                  className="w-full accent-[#C8A870] h-2 bg-stone-200/60 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-[#1A1816] mb-2">
                  <span>Down Payment Allocation</span>
                  <span className="text-[#7C8C7E] font-semibold">{calcDown}% (${((calcPrice * calcDown) / 100 / 1000000).toFixed(2)}M)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={calcDown}
                  onChange={(e) => setCalcDown(Number(e.target.value))}
                  className="w-full accent-[#7C8C7E] h-2 bg-stone-200/60 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1816] mb-2">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-[#1A1816]/10 text-xs font-semibold text-[#1A1816] focus:outline-none focus:border-[#C8A870]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1816] mb-2">Loan Duration</label>
                  <select
                    value={calcYears}
                    onChange={(e) => setCalcYears(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/50 border border-[#1A1816]/10 text-xs font-semibold text-[#1A1816] focus:outline-none focus:border-[#C8A870] cursor-pointer"
                  >
                    <option value={15}>15 Years Fixed</option>
                    <option value={20}>20 Years Fixed</option>
                    <option value={30}>30 Years Fixed</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Estimated Output */}
            <div className="lg:col-span-5 bg-[#1A1816] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
              
              <div className="relative z-10">
                <span className="text-[10px] text-[#C8A870] font-medium tracking-widest uppercase">
                  Estimated Monthly Outlay
                </span>
                <div className="font-serif text-4xl sm:text-5xl font-normal mt-2 text-white">
                  ${monthlyPayment.toLocaleString()} <span className="text-xs font-sans text-stone-400">/ mo</span>
                </div>
                <div className="mt-6 space-y-2 text-xs text-stone-300 font-light border-t border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span>Financed Principal:</span>
                    <span className="font-medium text-white">${((calcPrice * (1 - calcDown / 100)) / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equity Down:</span>
                    <span className="font-medium text-white">${((calcPrice * calcDown) / 100).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playChime();
                  setIsScheduleModalOpen(true);
                }}
                className="mt-8 w-full py-3 bg-white/10 hover:bg-[#C8A870] text-white hover:text-[#1A1816] border border-white/20 text-xs font-medium tracking-widest uppercase rounded-full transition-all duration-300 text-center shadow-lg"
              >
                Inquire Financing Structure
              </button>

            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. ARCHITECTURAL ATELIER BRIEF */}
      {/* ========================================================================= */}
      <section id="architects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#1A1816]/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-3xl bg-white/60 backdrop-blur-md border border-[#1A1816]/5 shadow-sm">
            <Shield className="w-8 h-8 text-[#C8A870] mb-4" />
            <h3 className="font-serif text-lg text-[#1A1816] mb-2">Confidential Discretion</h3>
            <p className="text-xs text-[#1A1816]/60 leading-relaxed font-light">
              White-glove private representation for family offices and discerning global buyers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/60 backdrop-blur-md border border-[#1A1816]/5 shadow-sm">
            <Layers className="w-8 h-8 text-[#7C8C7E] mb-4" />
            <h3 className="font-serif text-lg text-[#1A1816] mb-2">Sustainable Modernism</h3>
            <p className="text-xs text-[#1A1816]/60 leading-relaxed font-light">
              Integrated zero-carbon thermal insulation, geothermal wells, and automated solar louvers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/60 backdrop-blur-md border border-[#1A1816]/5 shadow-sm">
            <Sun className="w-8 h-8 text-[#BA7A50] mb-4" />
            <h3 className="font-serif text-lg text-[#1A1816] mb-2">Solar Vectoring</h3>
            <p className="text-xs text-[#1A1816]/60 leading-relaxed font-light">
              Oriented precisely to optimize natural daylight throughout seasonal solstice paths.
            </p>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#1A1816] text-[#F8F6F0] pt-16 pb-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-[#C8A870] flex items-center justify-center font-serif text-lg font-bold">
                  A
                </div>
                <span className="font-serif text-2xl tracking-widest uppercase">Aurelia</span>
              </div>
              <p className="text-xs text-stone-400 font-light max-w-sm leading-relaxed">
                Aurelia represents the world’s most distinguished architectural residences. Seamlessly bridging visionary design and transcendent living.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#C8A870] tracking-widest uppercase mb-4">Navigation</h4>
              <ul className="space-y-2 text-xs text-stone-300 font-light">
                <li><a href="#home" className="hover:text-white transition-colors">Sanctuaries</a></li>
                <li><a href="#lifestyle" className="hover:text-white transition-colors">Domains</a></li>
                <li><a href="#calculator" className="hover:text-white transition-colors">Capital Modeling</a></li>
                <li><a href="#architects" className="hover:text-white transition-colors">Atelier Index</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#C8A870] tracking-widest uppercase mb-4">Private Advisory</h4>
              <p className="text-xs text-stone-300 font-light mb-2">concierge@aurelia.com</p>
              <p className="text-xs text-stone-300 font-light">+1 (800) 405-AURELIA</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 font-light gap-4">
            <p>© {new Date().getFullYear()} AURELIA Sanctuaries. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-stone-300 transition-colors">Terms of Representation</a>
            </div>
          </div>

        </div>
      </footer>


      {/* ========================================================================= */}
      {/* MODAL 1: PROPERTY QUICK VIEW MODAL WITH FLOOR PLAN TOGGLE */}
      {/* ========================================================================= */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            onClick={() => setSelectedProperty(null)} 
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          />

          <div className="relative bg-[#F8F6F0] text-[#1A1816] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 z-10 my-auto">
            
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Gallery */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
              <img
                src={selectedProperty.images[0]}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816] via-transparent to-transparent opacity-90" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-semibold tracking-wider uppercase mb-2 inline-block">
                  {selectedProperty.category}
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-normal">
                  {selectedProperty.title}
                </h2>
                <p className="text-xs text-stone-300 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C8A870]" />
                  <span>{selectedProperty.location}</span>
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="px-6 sm:px-8 pt-6 flex items-center justify-between border-b border-[#1A1816]/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActivePropertyTab('overview')}
                  className={`pb-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors ${
                    activePropertyTab === 'overview'
                      ? 'border-[#BA7A50] text-[#1A1816]'
                      : 'border-transparent text-[#1A1816]/50 hover:text-[#1A1816]'
                  }`}
                >
                  Overview & Amenities
                </button>
                <button
                  onClick={() => setActivePropertyTab('floorplan')}
                  className={`pb-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-1.5 ${
                    activePropertyTab === 'floorplan'
                      ? 'border-[#BA7A50] text-[#1A1816]'
                      : 'border-transparent text-[#1A1816]/50 hover:text-[#1A1816]'
                  }`}
                >
                  <Layers3 className="w-3.5 h-3.5" />
                  <span>Architectural Floor Plan</span>
                </button>
              </div>

              <span className="font-serif text-xl font-normal text-[#1A1816] pb-3 hidden sm:inline">
                ${(selectedProperty.price / 1000000).toFixed(2)}M
              </span>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-8">
              
              {activePropertyTab === 'overview' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="font-serif text-xl text-[#1A1816]">Architectural Philosophy</h3>
                      <p className="text-xs sm:text-sm text-[#1A1816]/70 font-light leading-relaxed">
                        {selectedProperty.description}
                      </p>

                      <h4 className="font-serif text-lg text-[#1A1816] pt-4">Bespoke Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProperty.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#1A1816]/80">
                            <CheckCircle2 className="w-4 h-4 text-[#7C8C7E] flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-[#1A1816]/10 space-y-4 text-xs">
                      <h4 className="font-serif text-base text-[#1A1816] border-b pb-2">Technical Index</h4>
                      
                      <div>
                        <span className="text-[#1A1816]/50 block">Lead Atelier</span>
                        <span className="font-semibold text-[#1A1816]">{selectedProperty.architect}</span>
                      </div>

                      <div>
                        <span className="text-[#1A1816]/50 block">Completion Year</span>
                        <span className="font-semibold text-[#1A1816]">{selectedProperty.yearBuilt}</span>
                      </div>

                      <div>
                        <span className="text-[#1A1816]/50 block">Solar Exposure</span>
                        <span className="font-semibold text-[#1A1816]">{selectedProperty.sunExposure}</span>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playChime();
                          setSelectedProperty(null);
                          setIsScheduleModalOpen(true);
                        }}
                        className="w-full mt-4 py-3 bg-[#1A1816] hover:bg-[#BA7A50] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors text-center shadow-md"
                      >
                        Request Private Viewing
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Floor Plan Blueprint Vector View */
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-[#1A1816]/10 text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-[#1A1816]/10 text-[#BA7A50] text-xs font-semibold uppercase">
                    <Layers3 className="w-3.5 h-3.5" />
                    <span>Level 01 & Solstice Deck Blueprint</span>
                  </div>

                  {/* SVG Blueprint Mockup */}
                  <div className="aspect-[16/9] w-full bg-[#1A1816] rounded-2xl p-6 relative flex items-center justify-center text-white/40 overflow-hidden border border-white/10">
                    <div 
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }}
                    />
                    <div className="border border-dashed border-[#C8A870]/60 w-3/4 h-3/4 rounded-xl flex flex-col justify-between p-4 relative">
                      <span className="text-[10px] uppercase font-mono text-[#C8A870]">Glass Pavilion Living Room (1,200 sq ft)</span>
                      <div className="grid grid-cols-2 gap-4 h-1/2">
                        <div className="border border-stone-600 rounded p-2 text-[9px] font-mono">Master Wing</div>
                        <div className="border border-stone-600 rounded p-2 text-[9px] font-mono">Infiniti Pool Terrace</div>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-stone-400">Scale: 1:100 | Architectural Blueprint</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#1A1816]/60 font-light max-w-lg mx-auto">
                    Complete CAD/BIM architectural floor plans and structural engineering blueprints are available under non-disclosure agreement.
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* DRAWER: SAVED SANCTUARIES */}
      {/* ========================================================================= */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setIsSavedDrawerOpen(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#F8F6F0] shadow-2xl flex flex-col border-l border-[#1A1816]/10">
              
              <div className="p-6 bg-white/80 backdrop-blur-md border-b border-[#1A1816]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#BA7A50] fill-[#BA7A50]" />
                  <h2 className="font-serif text-xl font-normal text-[#1A1816]">Saved Sanctuaries ({favorites.length})</h2>
                </div>
                <button
                  onClick={() => setIsSavedDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {savedPropertiesList.length === 0 ? (
                  <div className="text-center py-16 text-stone-400">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-1" />
                    <p className="text-xs font-light text-stone-500">Your private collection is currently empty.</p>
                  </div>
                ) : (
                  savedPropertiesList.map((prop) => (
                    <div 
                      key={prop.id}
                      className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-[#1A1816]/10 flex gap-4 items-center group relative"
                    >
                      <img 
                        src={prop.images[0]} 
                        alt={prop.title} 
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-semibold text-[#1A1816] truncate">{prop.title}</h4>
                        <p className="text-[10px] text-[#7C8C7E] truncate">{prop.location}</p>
                        <p className="font-serif text-sm font-normal text-[#BA7A50] mt-1">${(prop.price / 1000000).toFixed(2)}M</p>
                      </div>
                      <button
                        onClick={(e) => toggleFavorite(prop.id, e)}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {savedPropertiesList.length > 0 && (
                <div className="p-6 bg-white/80 backdrop-blur-md border-t border-[#1A1816]/10 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#1A1816]/60 font-medium">Portfolio Valuation:</span>
                    <span className="font-serif text-lg font-semibold text-[#1A1816]">
                      ${(totalSavedValue / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playChime();
                      setIsSavedDrawerOpen(false);
                      setIsScheduleModalOpen(true);
                    }}
                    className="w-full py-3 bg-[#1A1816] hover:bg-[#BA7A50] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors text-center shadow-md"
                  >
                    Request Portfolio Consultation
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* MODAL 2: SCHEDULER */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            onClick={() => { setIsScheduleModalOpen(false); setScheduleSuccess(false); }} 
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          <div className="relative bg-[#F8F6F0] text-[#1A1816] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20 z-10 my-auto">
            
            <button
              onClick={() => { setIsScheduleModalOpen(false); setScheduleSuccess(false); }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-200 text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            {scheduleSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#7C8C7E]/20 text-[#7C8C7E] mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="font-serif text-2xl text-[#1A1816]">Private Viewing Requested</h3>
                <p className="text-xs text-[#1A1816]/70 font-light leading-relaxed">
                  Your dedicated Aurelia executive director will contact you within 2 hours to arrange private access.
                </p>
                <button
                  onClick={() => { setIsScheduleModalOpen(false); setScheduleSuccess(false); }}
                  className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-[#1A1816] text-[#1A1816] hover:text-white border border-[#1A1816]/20 text-xs font-semibold rounded-full transition-colors"
                >
                  Return to Sanctuaries
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <span className="text-[10px] text-[#C8A870] font-semibold tracking-widest uppercase">
                    Confidential Appointment
                  </span>
                  <h3 className="font-serif text-2xl text-[#1A1816] mt-1">Book Private Viewing</h3>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    sounds.playChime();
                    setScheduleSuccess(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-[#1A1816]/70 font-medium mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Lord / Lady / Mr. / Ms..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-[#1A1816]/10 focus:outline-none focus:border-[#C8A870]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#1A1816]/70 font-medium mb-1">Direct Email</label>
                    <input
                      required
                      type="email"
                      placeholder="client@familyoffice.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-[#1A1816]/10 focus:outline-none focus:border-[#C8A870]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#1A1816]/70 font-medium mb-1">Preferred Date</label>
                      <input
                        required
                        type="date"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-[#1A1816]/10 focus:outline-none focus:border-[#C8A870]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1816]/70 font-medium mb-1">Access Method</label>
                      <select className="w-full px-3 py-2.5 rounded-xl bg-white/80 border border-[#1A1816]/10 focus:outline-none focus:border-[#C8A870] cursor-pointer">
                        <option>In-Person Onsite</option>
                        <option>Helicopter Transfer</option>
                        <option>Virtual Live Tour</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#1A1816]/70 font-medium mb-1">Target Residence</label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-[#1A1816]/10 focus:outline-none focus:border-[#C8A870] cursor-pointer">
                      {PROPERTIES.map(p => (
                        <option key={p.id}>{p.title} ({p.location})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 py-3 bg-[#1A1816] hover:bg-[#BA7A50] text-white font-medium uppercase tracking-widest text-xs rounded-full transition-colors shadow-lg"
                  >
                    Confirm Confidential Request
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}