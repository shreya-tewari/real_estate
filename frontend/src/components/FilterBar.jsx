import React, { useState, useEffect } from 'react';
import { Search, Home, RotateCcw, DollarSign, BedDouble, Layers, MapPin, ChevronDown } from 'lucide-react';

export default function FilterBar({ filters, onFilterChange, onClearFilters, activeCity, onCityChange }) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Reset local search when filters are cleared
  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  // Utility to format INR
  const formatINR = (value) => {
    if (!value) return '';
    const num = Number(value);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatINRLakh = (value) => {
    if (!value) return '';
    const num = Number(value);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Predefined budget options based on buy/rent
  const rentMinBudgets = [
    { label: 'Any Min', value: '' },
    { label: '₹10,000', value: 10000 },
    { label: '₹20,000', value: 20000 },
    { label: '₹35,000', value: 35000 },
    { label: '₹50,000', value: 50000 },
    { label: '₹80,000', value: 80000 },
    { label: '₹1.5 Lakh', value: 150000 },
  ];

  const rentMaxBudgets = [
    { label: 'Any Max', value: '' },
    { label: '₹15,000', value: 15000 },
    { label: '₹25,000', value: 25000 },
    { label: '₹40,000', value: 40000 },
    { label: '₹60,000', value: 60000 },
    { label: '₹90,000', value: 90000 },
    { label: '₹1.5 Lakh', value: 150000 },
    { label: '₹2.5 Lakh', value: 250000 },
  ];

  const buyMinBudgets = [
    { label: 'Any Min', value: '' },
    { label: '₹20 Lakh', value: 2000000 },
    { label: '₹40 Lakh', value: 4000000 },
    { label: '₹60 Lakh', value: 6000000 },
    { label: '₹80 Lakh', value: 8000000 },
    { label: '₹1.2 Cr', value: 12000000 },
    { label: '₹2 Cr', value: 20000000 },
    { label: '₹4 Cr', value: 40000000 },
    { label: '₹6 Cr', value: 60000000 },
  ];

  const buyMaxBudgets = [
    { label: 'Any Max', value: '' },
    { label: '₹40 Lakh', value: 4000000 },
    { label: '₹60 Lakh', value: 6000000 },
    { label: '₹80 Lakh', value: 8000000 },
    { label: '₹1.2 Cr', value: 12000000 },
    { label: '₹2 Cr', value: 20000000 },
    { label: '₹4 Cr', value: 40000000 },
    { label: '₹6 Cr', value: 60000000 },
    { label: '₹10 Cr', value: 100000000 },
  ];

  const minBudgetOptions = filters.type === 'rent' ? rentMinBudgets : buyMinBudgets;
  const maxBudgetOptions = filters.type === 'rent' ? rentMaxBudgets : buyMaxBudgets;

  return (
    <div className="w-full animate-fade-in-up">
      {/* Search Header Hero */}
      <div 
        className="relative overflow-hidden px-6 py-16 md:py-24 shadow-lg bg-cover bg-center w-full"
        style={{ backgroundImage: "url('/images/hero_bg.png')" }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-transparent z-0"></div>

        {/* Decorative subtle ambient lights on top of overlay */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500 rounded-full blur-[120px] opacity-15 -ml-20 -mb-20 pointer-events-none z-0"></div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-950/60 border border-gold-800/40 uppercase mb-5 backdrop-blur-sm">
            Premium Property Portal
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-sm">
            Find Your Dream Home in <span className="bg-gradient-to-r from-brand-300 to-gold-300 bg-clip-text text-transparent">India</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 mb-8 max-w-xl mx-auto drop-shadow-sm font-medium">
            Discover verified apartments, penthouses, row houses, and luxury villas in Bangalore, Mumbai, Chennai & Hyderabad.
          </p>

          {/* Search Box */}
          <div className="glass-search-box max-w-2xl mx-auto flex items-center p-2 rounded-2xl shadow-xl backdrop-blur-md bg-white/90 border border-white/20">
            <div className="flex items-center flex-1 px-3 gap-2">
              <Search className="h-5 w-5 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search by locality, building name, or keywords (e.g. Bandra, Pool, Villa)..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-sm py-2"
              />
            </div>
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2.5 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Options Panel */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20 -mt-10 md:-mt-12 mb-8">
        <div className="glass-card rounded-2xl shadow-glass p-6 border border-slate-100/80 bg-white/95 backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">

          {/* City Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> City
            </label>
            <div className="relative">
              <select
                value={activeCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full bg-slate-100 border-none outline-none py-2.5 px-3.5 rounded-xl text-xs font-semibold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-brand-500"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Rent/Buy Switch */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" /> Purpose
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  onFilterChange('type', 'buy');
                  onFilterChange('min_price', '');
                  onFilterChange('max_price', ''); // reset max price since scale changes
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${filters.type === 'buy'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => {
                  onFilterChange('type', 'rent');
                  onFilterChange('min_price', '');
                  onFilterChange('max_price', ''); // reset max price since scale changes
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${filters.type === 'rent'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Rent
              </button>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Property Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onFilterChange('property_type', '')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${!filters.property_type
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('property_type', 'flat')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${filters.property_type === 'flat'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Flat
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('property_type', 'house')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${filters.property_type === 'house'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                House
              </button>
            </div>
          </div>

          {/* BHK Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" /> BHK Setup
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full">
              <button
                type="button"
                onClick={() => onFilterChange('bhk', '')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${!filters.bhk
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                All
              </button>
              {[1, 2, 3, 4].map((bhkVal) => (
                <button
                  key={bhkVal}
                  type="button"
                  onClick={() => onFilterChange('bhk', bhkVal)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${filters.bhk === bhkVal
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {bhkVal === 4 ? '4+' : bhkVal}
                </button>
              ))}
            </div>
          </div>

          {/* Min Budget Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Min Budget
            </label>
            <div className="relative">
              <select
                value={filters.min_price || ''}
                onChange={(e) => onFilterChange('min_price', e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-100 border-none outline-none py-2.5 px-3.5 rounded-xl text-xs font-semibold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-brand-500"
              >
                {minBudgetOptions.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Max Budget Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Max Budget
            </label>
            <div className="relative">
              <select
                value={filters.max_price || ''}
                onChange={(e) => onFilterChange('max_price', e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-100 border-none outline-none py-2.5 px-3.5 rounded-xl text-xs font-semibold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-brand-500"
              >
                {maxBudgetOptions.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

        </div>

        {/* Clear Filters indicator */}
        {(filters.search || filters.property_type || filters.bhk || filters.min_price || filters.max_price || filters.type !== 'buy') && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="text-slate-500 flex items-center gap-1.5 flex-wrap">
              Active filters:
              {filters.type !== 'buy' && <span className="bg-brand-50 text-brand-600 font-medium px-2 py-0.5 rounded">Rentals</span>}
              {filters.property_type && <span className="bg-brand-50 text-brand-600 font-medium px-2 py-0.5 rounded capitalize">{filters.property_type}</span>}
              {filters.bhk && <span className="bg-brand-50 text-brand-600 font-medium px-2 py-0.5 rounded">{filters.bhk} BHK</span>}
              {filters.min_price && <span className="bg-brand-50 text-brand-600 font-medium px-2 py-0.5 rounded">Min: {formatINRLakh(filters.min_price)}</span>}
              {filters.max_price && <span className="bg-brand-50 text-brand-600 font-medium px-2 py-0.5 rounded">Max: {formatINRLakh(filters.max_price)}</span>}
            </div>
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-brand-600 font-semibold transition-colors duration-200"
            >
              <RotateCcw className="h-3 w-3" /> Reset Filters
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
