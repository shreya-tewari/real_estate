import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import PropertyCard from './components/PropertyCard';
import PropertyModal from './components/PropertyModal';
import ChatPanel from './components/ChatPanel';
import AuthModal from './components/AuthModal';
import AgentsModal from './components/AgentsModal';
import PropertyFormModal from './components/PropertyFormModal';
import MyPropertiesModal from './components/MyPropertiesModal';
import { useAuth } from './context/AuthContext';
import { Compass, Building2 } from 'lucide-react';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function App() {
  const { user, token, logout } = useAuth();
  const listingsRef = useRef(null);

  const [activeCity, setActiveCity] = useState('Bangalore');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [showMyProperties, setShowMyProperties] = useState(false);
  const [propertyForEdit, setPropertyForEdit] = useState(null); // null = closed, object = edit

  const [filters, setFilters] = useState({
    type: 'buy', property_type: '', bhk: '', min_price: '', max_price: '', search: '',
  });

  // Handle individual filter updates
  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const handleClearFilters = () => setFilters({
    type: 'buy', property_type: '', bhk: '', min_price: '', max_price: '', search: '',
  });

  const scrollToListings = () => {
    listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBuyClick = () => {
    handleFilterChange('type', 'buy');
    scrollToListings();
  };

  const handleRentClick = () => {
    handleFilterChange('type', 'rent');
    scrollToListings();
  };

  // Fetch properties from backend API
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('city', activeCity);
      if (filters.type) params.append('type', filters.type);
      if (filters.property_type) params.append('property_type', filters.property_type);
      if (filters.bhk) params.append('bhk', filters.bhk);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/properties?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch properties from server');
      setProperties(await response.json());
    } catch (err) {
      console.error(err);
      setError('Could not load properties. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };
  // Trigger fetch when active city or filters update
  useEffect(() => {
    fetchProperties();
  }, [activeCity, filters.type, filters.property_type, filters.bhk, filters.min_price, filters.max_price, filters.search]);

  const handleEditProperty = (property) => setPropertyForEdit(property);

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Delete this property? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
      fetchProperties();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={logout}
        onBuyClick={handleBuyClick}
        onRentClick={handleRentClick}
        onFindAgentClick={() => setShowAgentsModal(true)}
        onMyPropertiesClick={() => setShowMyProperties(true)}
      />

      <main className="flex-1 w-full pb-8">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          activeCity={activeCity}
          onCityChange={setActiveCity}
        />

        <div ref={listingsRef} className="mt-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-600" />
                Featured Listings in {activeCity}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Showing {properties.length} properties matching your filters
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                  <div className="bg-slate-200 aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3.5">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                    <div className="h-8 bg-slate-200 rounded-xl w-full" />
                    <div className="h-6 bg-slate-200 rounded-md w-1/3 pt-3 border-t border-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto border border-rose-100 bg-rose-50/20">
              <div className="text-rose-500 font-extrabold text-lg mb-2">Connection Error</div>
              <p className="text-slate-600 text-xs md:text-sm mb-6 leading-relaxed">{error}</p>
              <button onClick={fetchProperties}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-200">
                Retry Connecting
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-200/60 bg-white">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-extrabold text-slate-800 text-base mb-1">No Matching Properties</h3>
              <p className="text-slate-500 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                We couldn't find any listings matching your search parameters in {activeCity}. Try adjusting your budget or search text.
              </p>
              <button onClick={handleClearFilters}
                className="px-6 py-2.5 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                Reset Filter Settings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="h-full">
                  <PropertyCard
                    property={property}
                    onSelect={setSelectedProperty}
                    onEdit={handleEditProperty}
                    onDelete={handleDeleteProperty}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showAgentsModal && (
        <AgentsModal properties={properties} city={activeCity} onClose={() => setShowAgentsModal(false)} />
      )}

      {propertyForEdit && (
        <PropertyFormModal
          property={propertyForEdit}
          onClose={() => setPropertyForEdit(null)}
          onSaved={() => fetchProperties()}
        />
      )}

      {showMyProperties && (
        <MyPropertiesModal
          onClose={() => setShowMyProperties(false)}
          onEdit={(p) => { setShowMyProperties(false); setPropertyForEdit(p); }}
          onDeleted={() => fetchProperties()}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-lg font-bold text-white">MagicProperty <span className="text-gold-500 text-sm font-semibold uppercase tracking-widest ml-0.5">Elite</span></span>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed max-w-xs">
                Luxury real estate search for discerning buyers and renters. Discover high-quality flats and bungalows in India's leading metro cities.
              </p>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3.5">Cities Covered</h4>
              <ul className="text-xs space-y-2 font-medium">
                <li><button onClick={() => { setActiveCity('Bangalore'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Bangalore (Silicon Valley)</button></li>
                <li><button onClick={() => { setActiveCity('Mumbai'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Mumbai (Financial Capital)</button></li>
                <li><button onClick={() => { setActiveCity('Chennai'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Chennai (Gateway to South)</button></li>
                <li><button onClick={() => { setActiveCity('Hyderabad'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Hyderabad (City of Pearls)</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3.5">Disclaimer</h4>
              <p className="text-[10px] text-slate-600 leading-normal">
                This is a mock real estate portal built for demonstration purposes. All property details, pricing, pictures, and agent information are simulated.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-600">
            © {new Date().getFullYear()} MagicProperty Elite. Designed and built with React, FastAPI, SQLite & Tailwind CSS.
          </div>
        </div>
      </footer>

      {/* AI Chat Panel (floating) */}
      <ChatPanel onSelectProperty={setSelectedProperty} />
    </div>
  );
}
