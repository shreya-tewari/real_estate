import React from 'react';
import { X, BedDouble, Bath, Maximize, MapPin, Phone, Mail, User, ShieldCheck } from 'lucide-react';

export default function PropertyModal({ property, onClose }) {
  if (!property) return null;

  const {
    title,
    city,
    locality,
    price,
    type,
    property_type,
    bhk,
    bathrooms,
    area,
    image_filename,
    image_url,
    description,
    amenities,
    agent_name,
    agent_phone,
    agent_email,
  } = property;

  // Split comma separated amenities into list
  const amenitiesList = amenities ? amenities.split(',').map((a) => a.trim()) : [];

  const formatPrice = (priceVal, typeVal) => {
    const num = Number(priceVal);
    let displayPrice = '';
    
    if (num >= 10000000) {
      displayPrice = `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`;
    } else if (num >= 100000) {
      displayPrice = `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
    } else {
      displayPrice = `₹${num.toLocaleString('en-IN')}`;
    }

    return typeVal === 'rent' ? `${displayPrice} / month` : displayPrice;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh] animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/95 text-slate-700 hover:text-slate-950 shadow-md hover:scale-105 transition-all z-20"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Property Image */}
        <div className="relative w-full md:w-1/2 bg-slate-100 aspect-[4/3] md:aspect-auto md:min-h-[500px] overflow-hidden">
          <img
            src={image_url || `/images/${image_filename}`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";
            }}
          />
          {/* Badges */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider text-white shadow-sm ${
              type === 'rent' ? 'bg-slate-900/90' : 'bg-brand-700/90'
            } backdrop-blur-xs`}>
              For {type === 'rent' ? 'Rent' : 'Sale'}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-700 bg-white/95 backdrop-blur-xs border border-slate-200/60 shadow-sm">
              {property_type === 'flat' ? 'Flat' : 'House'}
            </span>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="text-brand-700 font-bold">{locality}</span>
              <span>•</span>
              <span>{city}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2 leading-snug">
              {title}
            </h2>

            {/* Price */}
            <div className="mb-6">
              <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
                Asking Price
              </span>
              <span className="text-2xl font-extrabold text-slate-900">
                {formatPrice(price, type)}
              </span>
            </div>

            {/* Params Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl mb-6">
              <div className="text-center">
                <BedDouble className="h-5 w-5 text-brand-500 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-slate-800">{bhk} BHK</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Bedrooms</span>
              </div>
              <div className="text-center border-x border-slate-200">
                <Bath className="h-5 w-5 text-brand-500 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-slate-800">{bathrooms}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Bathrooms</span>
              </div>
              <div className="text-center">
                <Maximize className="h-5 w-5 text-brand-500 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-slate-800">{area} sqft</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Super Area</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Property Description
              </h4>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Key Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200/50"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Information Panel */}
          <div className="mt-4 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">
              Contact Listed Agent
            </h4>
            <div className="bg-brand-50/50 border border-brand-100/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-800">{agent_name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Relationship Manager</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${agent_phone}`}
                  className="flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-600 transition-colors shadow-sm"
                  title="Call Agent"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${agent_email}?subject=Inquiry regarding ${title}`}
                  className="flex items-center justify-center px-4 py-2 gap-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Email Agent
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
