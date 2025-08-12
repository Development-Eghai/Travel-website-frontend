import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuotePreview from './QuotePreview';
import { generateSimplePDF, generateModernPDF, generateElegantPDF, generateMinimalistPDF, generateTravelMagazinePDF, generateProfessionalPDF, exportQuoteToPDF_html2pdf } from '../../utils/pdfExport';
import { CreateQuote, GetAllDestination, GetAllTourType } from '../../common/api/ApiService';
import { successMsg, errorMsg } from '../../common/Toastify';
import axios from 'axios';

// Helper: get HTML for preview for each template
const getQuoteTemplateHTML = (template, quoteData) => {
  if (template === 'modern') {
    return generateModernPDF(quoteData, true); // true = return HTML string
  } else if (template === 'elegant') {
    return generateElegantPDF(quoteData, true);
  } else if (template === 'minimalist') {
    return generateMinimalistPDF(quoteData, true);
  } else if (template === 'travelmagazine') {
    return generateTravelMagazinePDF(quoteData, true);
  } else if (template === 'bold') {
    return generateBoldPDF(quoteData, true);
  } else if (template === 'professional') {
    return generateProfessionalPDF(quoteData, true);
  } else {
    return generateSimplePDF(quoteData, true);
  }
};

// --- Widget Data for Quote Builder ---
const widgetData = [
  { label: 'Total Quotes', value: 189, change: '+15.2%', icon: <i className="fa-solid fa-file-invoice"></i>, color: '#1976d2', status: '' },
  { label: 'Pending Quotes', value: 45, change: '+8.7%', icon: <i className="fa-solid fa-clock"></i>, color: '#fbc02d', status: '' },
  { label: 'Approved Quotes', value: 89, change: '+22.1%', icon: <i className="fa-solid fa-check-circle"></i>, color: '#43a047', status: '' },
  { label: 'Rejected Quotes', value: 12, change: '-5.3%', icon: <i className="fa-solid fa-times-circle"></i>, color: '#e53935', status: '' },
  { label: 'This Month', value: 67, change: '', icon: <i className="fa-solid fa-calendar-alt"></i>, color: '#8e24aa', status: 'Generated' },
  { label: 'Avg. Quote Value', value: '$2,450', change: '+12.8%', icon: <i className="fa-solid fa-dollar-sign"></i>, color: '#00bcd4', status: '' },
  { label: 'Conversion Rate', value: '73%', change: '+5.2%', icon: <i className="fa-solid fa-chart-pie"></i>, color: '#ff9800', status: '' },
];

// --- Sample Quotes Data ---
const sampleQuotes = [

  
];

const QuoteBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quotes, setQuotes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeTab, setActiveTab] = useState('quotes'); // 'quotes', 'builder', 'itinerary', 'pricing'

  
  // Check if lead data was passed from Lead Management
  React.useEffect(() => {
    if (location.state?.leadData) {
      const leadData = location.state.leadData;
      setNewQuote(prev => ({
        ...prev,
        leadName: leadData.name || '',
        leadPhone: leadData.phone || '',
        destination: leadData.destination || '',
        tripType: leadData.tripType || ''
      }));
      setActiveTab('builder');
      setFormErrors({}); // Clear any existing form errors
      // Clear the state to prevent re-triggering on subsequent renders
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    destination: '',
    tripType: '',
    dateFrom: '',
    dateTo: ''
  });
  const [newQuote, setNewQuote] = useState({
    leadName: '',
    leadPhone: '',
    destination: '',
    tripType: '',
    items: [{ name: '', description: '', amount: '' }], // RESTORED
    notes: '',
    validUntil: '',
    days: [
      {
        dayNumber: 1,
        destination: '',
        date: '',
        activities: '',
        overnightStay: 'Yes'
      }
    ],
    pricing: {
      perAdultPrice: '',
      adultCount: 1,
      adultTotal: 0,
      cwobPrice: '',
      cwobCount: 0,
      cwobTotal: 0,
      cwbPrice: '',
      cwbCount: 0,
      cwbTotal: 0,
      totalPrice: 0,
      discountPercent: '',
      discountAmount: 0,
      payablePrice: 0
    }
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuote, setPreviewQuote] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [pdfTemplate, setPdfTemplate] = useState('professional');
  const [previewHTML, setPreviewHTML] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [destinationList, setDestinationList] = useState([]);
  const [tripTypeList, setTripTypeList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [destinationNames, setDestinationNames] = useState({}); // Store destination names by ID

  // Fetch destinations and trip types on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [destinationResponse, tripTypeResponse] = await Promise.all([
          GetAllDestination(),
          GetAllTourType()
        ]);

        if (destinationResponse && destinationResponse.statusCode === 200) {
          setDestinationList(destinationResponse.data || []);
        } else if (destinationResponse && destinationResponse.data) {
          // Fallback: if response has data but no statusCode
          setDestinationList(destinationResponse.data || []);
        } else {
          // Error fetching destinations
          // Temporary fallback data for debugging
          setDestinationList([
            { _id: '64a99d2f5c1b2d001f123abc', name: 'Dubai' },
            { _id: '64a99d2f5c1b2d001f123abd', name: 'Switzerland' },
            { _id: '64a99d2f5c1b2d001f123abe', name: 'Paris' }
          ]);
        }

        if (tripTypeResponse && tripTypeResponse.statusCode === 200) {
          setTripTypeList(tripTypeResponse.data || []);
        } else if (tripTypeResponse && tripTypeResponse.data) {
          // Fallback: if response has data but no statusCode
          setTripTypeList(tripTypeResponse.data || []);
        } else {
          // Error fetching trip types
          // Temporary fallback data for debugging
          setTripTypeList([
            { _id: '64a99d5e7c8f3c001f456def', name: 'Honeymoon' },
            { _id: '64a99d5e7c8f3c001f456deg', name: 'Family' },
            { _id: '64a99d5e7c8f3c001f456deh', name: 'Solo' }
          ]);
        }
      } catch (error) {
        // Error fetching data
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Expired'];

  const handleSelectAll = (e) => {
    setSelected(e.target.checked ? filteredQuotes.map(q => q._id) : []);
  };

  const handleSelect = (id) => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const filteredQuotes = quotes.filter(quote => {
    const statusOk = !filters.status || quote.status === filters.status;
    const destinationId = quote.destination || quote.destination_id || quote.destinationId || quote.destination_name;
    const destOk = !filters.destination || 
                   (destinationNames[destinationId] && 
                    destinationNames[destinationId].toLowerCase().includes(filters.destination.toLowerCase()));
    const tripTypeOk = !filters.tripType || (quote.trip_type || quote.tripType) === filters.tripType;
    const dateOk = (!filters.dateFrom || (quote.created && quote.created >= filters.dateFrom)) && 
                   (!filters.dateTo || (quote.created && quote.created <= filters.dateTo));
    return statusOk && destOk && tripTypeOk && dateOk;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: '', destination: '', tripType: '', dateFrom: '', dateTo: ''
    });
  };

  const addItineraryDay = () => {
    const newDay = {
      dayNumber: newQuote.days.length + 1,
      destination: '',
      date: '',
      activities: '',
      overnightStay: 'Yes'
    };
    setNewQuote(prev => ({
      ...prev,
      days: [...prev.days, newDay]
    }));
  };

  const handleDayChange = (dayIndex, field, value) => {
    const updatedDays = newQuote.days.map((day, index) => {
      if (index === dayIndex) {
        return { ...day, [field]: value };
      }
      return day;
    });
    setNewQuote(prev => ({ ...prev, days: updatedDays }));
    
    // Clear the specific error for this day field when user starts typing
    const errorKey = `day${field.charAt(0).toUpperCase() + field.slice(1)}${dayIndex}`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Add Quote Item
  const addQuoteItem = () => {
    setNewQuote(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', amount: '' }]
    }));
  };

  // Remove Quote Item
  const removeQuoteItem = (index) => {
    setNewQuote(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update Quote Item
  const updateQuoteItem = (index, field, value) => {
    setNewQuote(prev => {
      const updatedItems = prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      // Recalculate pricing totals when quote items change
      const quoteItemsTotal = updatedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const newPricing = { ...prev.pricing };
      newPricing.totalPrice = newPricing.adultTotal + newPricing.cwobTotal + newPricing.cwbTotal + quoteItemsTotal;
      newPricing.discountAmount = (newPricing.totalPrice * newPricing.discountPercent) / 100;
      newPricing.payablePrice = newPricing.totalPrice - newPricing.discountAmount;
      return {
        ...prev,
        items: updatedItems,
        pricing: newPricing
      };
    });
  };

  // Calculate pricing totals
  const calculatePricing = () => {
    const adultTotal = (Number(newQuote.pricing.perAdultPrice) || 0) * (Number(newQuote.pricing.adultCount) || 0);
    const cwobTotal = (Number(newQuote.pricing.cwobPrice) || 0) * (Number(newQuote.pricing.cwobCount) || 0);
    const cwbTotal = (Number(newQuote.pricing.cwbPrice) || 0) * (Number(newQuote.pricing.cwbCount) || 0);
    const quoteItemsTotal = newQuote.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalPrice = adultTotal + cwobTotal + cwbTotal + quoteItemsTotal;
    const discountAmount = (totalPrice * (Number(newQuote.pricing.discountPercent) || 0)) / 100;
    const payablePrice = totalPrice - discountAmount;

    setNewQuote(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        adultTotal,
        cwobTotal,
        cwbTotal,
        totalPrice,
        discountAmount,
        payablePrice
      }
    }));
  };

  // Update pricing when relevant fields change
  React.useEffect(() => {
    calculatePricing();
  }, [newQuote.pricing.perAdultPrice, newQuote.pricing.adultCount, newQuote.pricing.cwobPrice, newQuote.pricing.cwobCount, newQuote.pricing.cwbPrice, newQuote.pricing.cwbCount, newQuote.items]);

  const validateQuoteForm = (quoteData) => {
    const errors = {};
    
    if (!quoteData.leadName?.trim()) errors.leadName = 'Lead name is required';
    if (!quoteData.leadPhone?.trim()) errors.leadPhone = 'Lead phone is required';
    if (!quoteData.destination?.trim()) errors.destination = 'Destination is required';
    if (!quoteData.tripType?.trim()) errors.tripType = 'Trip type is required';
    if (!quoteData.validUntil?.trim()) errors.validUntil = 'Valid until date is required';
    
    // Validate days
    quoteData.days.forEach((day, index) => {
      if (!day.destination?.trim()) errors[`dayDestination${index}`] = 'Day destination is required';
      if (!day.date?.trim()) errors[`dayDate${index}`] = 'Day date is required';
      if (!day.activities?.trim()) errors[`dayActivities${index}`] = 'Day activities are required';
    });
    
    // Validate pricing
    if (!quoteData.pricing.perAdultPrice) errors.perAdultPrice = 'Per adult price is required';
    if (!quoteData.pricing.adultCount || quoteData.pricing.adultCount < 1) errors.adultCount = 'Adult count must be at least 1';
    
    return errors;
  };

  const currentErrors = validateQuoteForm(newQuote);
  const hasErrors = Object.keys(currentErrors).length > 0;

  // Function to fetch destination name by ID
  const fetchDestinationName = useCallback(async (destinationId) => {
    if (!destinationId) {
      return null;
    }
    
    // If we already have this destination name, return it
    if (destinationNames[destinationId]) {
      return destinationNames[destinationId];
    }
    
    try {
      const response = await axios.get(`http://localhost:8006/api/destinations/get_specific?_id=${destinationId}`);
      

      
      if (response.status === 200 && response.data && response.data.data) {
        const destinationName = response.data.data.destination_name || response.data.data.name || response.data.data.title || 'Unknown Destination';
        
        // Update the state with the new destination name
        setDestinationNames(prev => ({
          ...prev,
          [destinationId]: destinationName
        }));
        

        
        return destinationName;
      } else {
        // Set a fallback name to prevent infinite loading
        setDestinationNames(prev => ({
          ...prev,
          [destinationId]: 'Unknown Destination'
        }));

        return 'Unknown Destination';
      }
    } catch (error) {
      console.error('Error fetching destination name for ID', destinationId, ':', error);
      // Set a fallback name to prevent infinite loading
      setDestinationNames(prev => ({
        ...prev,
        [destinationId]: 'Error Loading'
      }));
      
      return 'Error Loading';
    }
  }, [destinationNames]);

  // Function to fetch all destination names for quotations
  const fetchAllDestinationNames = useCallback(async (quotations) => {
    if (!quotations || quotations.length === 0) {
      return;
    }
    
    const destinationIds = quotations
      .map(quote => {
        const id = quote.destination || quote.destination_id || quote.destinationId || quote.destination_name;
        return id;
      })
      .filter(id => id && id !== undefined)
      .filter(id => !destinationNames[id]); // Only fetch if we don't already have it
    
    if (destinationIds.length === 0) {
      return;
    }
    
    // Fetch destination names sequentially to avoid overwhelming the API
    for (const id of destinationIds) {
      try {
        await fetchDestinationName(id);
      } catch (error) {
        console.error(`Error fetching destination name for ID ${id}:`, error);
      }
    }
  }, [fetchDestinationName, destinationNames]);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await axios.get('http://localhost:8006/api/quotations');
        
        if (response.status === 200 && response.data && response.data.success && Array.isArray(response.data.data)) {
          setQuotes(response.data.data);
        } else {
          // Invalid API response
          setQuotes([]); // Fallback to an empty array
        }
      } catch (error) {
        // Error fetching quotations
        setQuotes([]); // Fallback to an empty array
      }
    };

    fetchQuotations();
  }, []); // Remove fetchAllDestinationNames dependency

  // Fetch destination names when quotes change
  useEffect(() => {
    // Only fetch destination names if we have quotes and they're different from what we've already processed
    if (quotes.length > 0) {
      const hasNewDestinations = quotes.some(quote => {
        const destinationId = quote.destination || quote.destination_id || quote.destinationId || quote.destination_name;
        return destinationId && !destinationNames[destinationId];
      });
      
      if (hasNewDestinations) {
        fetchAllDestinationNames(quotes);
      }
    }
  }, [quotes, fetchAllDestinationNames, destinationNames]);

  return (
    <div className="quote-builder-page" style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Tab Bar for LD and QB */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: 0, background: '#fff', borderRadius: '8px', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: 'fit-content' }}>
          <button
            onClick={() => navigate('/admin/lead-management')}
            style={{
              background: location.pathname === '/admin/lead-management' ? '#1976d2' : 'transparent',
              color: location.pathname === '/admin/lead-management' ? '#fff' : '#666',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 16,
              letterSpacing: 1
            }}
          >
            Lead Management
          </button>
          <button
            onClick={() => navigate('/admin/quote-builder')}
            style={{
              background: location.pathname === '/admin/quote-builder' ? '#1976d2' : 'transparent',
              color: location.pathname === '/admin/quote-builder' ? '#fff' : '#666',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 16,
              letterSpacing: 1
            }}
          >
            Quote Builder
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
          {activeTab === 'quotes' ? 'Quote Builder' : 'Create New Quote'}
        </h1>
        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
          {activeTab === 'quotes' 
            ? 'Manage and track all quotes, from creation to approval.' 
            : 'Build detailed quotes for your leads with customizable packages.'
          }
        </p>
        

        

      </div>

      {activeTab === 'quotes' ? (
        <>
          {/* Enhanced Top Widgets Section */}
          <div className="quote-widgets-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}>
            {widgetData.map((w, idx) => (
              <div
                key={w.label}
                className="quote-widget-card"
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  padding: '1.5rem',
                  border: '1px solid #f0f0f0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '2rem', color: w.color }}>{w.icon}</div>
                  <div style={{ textAlign: 'right' }}>
                    {w.change && <div style={{ fontSize: '14px', color: w.change.startsWith('+') ? '#43a047' : '#e53935', fontWeight: 600 }}>{w.change}</div>}
                    {w.status && <div style={{ fontSize: '12px', color: '#666' }}>{w.status}</div>}
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>{w.value}</div>
                <div style={{ color: '#666', fontWeight: 500, fontSize: '14px' }}>{w.label}</div>
              </div>
            ))}
          </div>

          {/* Main Content Section */}
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {/* Section Header with Action Bar */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>All Quotes</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  style={{ 
                    background: '#f5f5f5', 
                    border: '1px solid #ddd',
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#666'
                  }}
                >
                  <i className="fa-solid fa-filter"></i>
                  Filters
                </button>
                <button 
                  onClick={() => setActiveTab('builder')}
                  style={{ 
                    background: '#1976d2', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <i className="fa-solid fa-plus"></i>
                  Create Quote
                </button>
              </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Status</label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                  </select>
                </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Destination</label>
                    <select
                      name="destination"
                      value={filters.destination}
                      onChange={handleFilterChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">All Destinations</option>
                      {Array.from(new Set(Object.values(destinationNames))).map(destName => (
                        <option key={destName} value={destName}>{destName}</option>
                      ))}
                  </select>
                </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Trip Type</label>
                    <select
                      name="tripType"
                      value={filters.tripType}
                      onChange={handleFilterChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">All Trip Types</option>
                      {Array.from(new Set(quotes.map(q => q.trip_type || q.tripType).filter(Boolean))).map(tripType => (
                        <option key={tripType} value={tripType}>{tripType}</option>
                      ))}
                  </select>
                </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Date From</label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Date To</label>
                    <input
                      type="date"
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleResetFilters}
                    style={{
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#666'
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}

            {/* Table Section */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={selected.length === filteredQuotes.length && filteredQuotes.length > 0}
                        onChange={handleSelectAll}
                        style={{ marginRight: '8px' }}
                      />
                      ID
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#495057', fontSize: '14px' }}>Lead Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#495057', fontSize: '14px' }}>Destination</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#495057', fontSize: '14px' }}>Trip Type</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#495057', fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#495057', fontSize: '14px' }}>Created</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#495057', fontSize: '14px' }}>Valid Until</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#495057', fontSize: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote, index) => (
                    <tr key={quote._id} style={{ 
                        borderBottom: '1px solid #f0f0f0',
                      background: index % 2 === 0 ? '#fff' : '#fafafa'
                    }}>
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(quote._id);
                            successMsg('Quote ID copied to clipboard!');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#1976d2',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            textDecoration: 'underline',
                            padding: '0'
                          }}
                          title="Click to copy ID"
                        >
                          {quote._id}
                        </button>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                          {quote.lead_name || quote.leadName || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px' }}>
                        {(() => {
                          const destinationId = quote.destination || quote.destination_id || quote.destinationId || quote.destination_name;
                          const destinationName = destinationNames[destinationId];
                          
                          return destinationId ? (
                            destinationName ? (
                              <span style={{ color: '#1a1a1a', fontWeight: '500' }}>
                                {destinationName}
                              </span>
                            ) : (
                              <span style={{ color: '#999', fontStyle: 'italic' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>
                                Loading...
                              </span>
                            )
                          ) : (
                            'N/A'
                          );
                        })()}
                      </td>
                      <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px' }}>
                        {quote.trip_type || quote.tripType || 'N/A'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 12,
                            background: {
                              'Pending': '#fffde7',
                              'Approved': '#e8f5e9',
                              'Rejected': '#ffebee',
                              'Expired': '#f5f5f5'
                            }[quote.status] || '#f5f5f5',
                            color: {
                              'Pending': '#fbc02d',
                              'Approved': '#43a047',
                              'Rejected': '#e53935',
                              'Expired': '#666'
                            }[quote.status] || '#555',
                            fontWeight: 600,
                            fontSize: 12
                          }}
                        >
                          {quote.status || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#666', fontSize: '12px' }}>
                        {quote.created ? new Date(quote.created).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', color: '#666', fontSize: '12px' }}>
                        {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', position: 'relative' }}>
                        {/* Actions Dropdown */}
                        <div className="dropdown-container" style={{ position: 'relative' }}>
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === quote._id ? null : quote._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#666',
                              fontSize: 16,
                              padding: '4px 8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Actions"
                          >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </button>
                          
                          {dropdownOpen === quote._id && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              background: '#fff',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              zIndex: 1000,
                              minWidth: '120px',
                              overflow: 'hidden'
                            }}>
                              <button
                                onClick={() => {
                                  setEditingQuote(quote);
                                  setEditModalOpen(true);
                                  setDropdownOpen(null);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  fontSize: '14px',
                                  color: '#333',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <i className="fa-solid fa-edit" style={{ color: '#1976d2' }}></i>
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this quote?')) {
                                    setQuotes(quotes.filter(q => q._id !== quote._id));
                                    setDropdownOpen(null);
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  fontSize: '14px',
                                  color: '#e53935',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#ffebee'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <i className="fa-solid fa-trash" style={{ color: '#e53935' }}></i>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Quote Builder Form */
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Create New Quote</h2>
            <button 
              onClick={() => setActiveTab('quotes')}
              style={{ 
                background: '#f5f5f5', 
                color: '#666', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '6px', 
                fontWeight: 500, 
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Back to Quotes
            </button>
          </div>

          <form onSubmit={e => { e.preventDefault(); createQuote(); }}>
            {/* Lead Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1976d2', marginBottom: '1rem' }}>Lead Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>Lead Name</label>
                  <input
                    type="text"
                    name="leadName"
                    value={newQuote.leadName}
                    onChange={handleNewQuoteChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: formErrors.leadName ? '1px solid #e57373' : '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.leadName && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors.leadName}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>Phone Number</label>
                  <input
                    type="tel"
                    name="leadPhone"
                    value={newQuote.leadPhone}
                    onChange={handleNewQuoteChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.leadPhone && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors.leadPhone}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>Destination</label>
                  <select
                    name="destination"
                    value={newQuote.destination}
                    onChange={handleNewQuoteChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: formErrors.destination ? '1px solid #e57373' : '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Destination</option>
                    {isLoadingData ? (
                      <option value="" disabled>Loading destinations...</option>
                    ) : (
                      (() => {
                        
                        return destinationList.map(d => {
                          const id = d._id || d.id || d.destination_id;
                          const name = d.name || d.destination_name || d.title || d.destination;
                          
                          return <option key={id} value={id}>{name}</option>;
                        });
                      })()
                    )}
                  </select>
                  {formErrors.destination && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors.destination}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>Trip Type</label>
                  <select
                    name="tripType"
                    value={newQuote.tripType}
                    onChange={handleNewQuoteChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: formErrors.tripType ? '1px solid #e57373' : '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Trip Type</option>
                                        {isLoadingData ? (
                      <option value="" disabled>Loading trip types...</option>
                    ) : (
                      tripTypeList.map((t, index) => {
                        
                        const id = t._id || t.id || t.trip_type_id;
                        const name = t.tour_name;
                        return <option key={id || index} value={id}>{name || 'Unnamed Trip Type'}</option>;
                      })
                    )}
                  </select>
                  {formErrors.tripType && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors.tripType}</div>}
                </div>
              </div>
            </div>

{/* Quote Items Section (restored) */}
<div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1976d2', margin: 0 }}>Quote Items</h3>
                <button
                  type="button"
                  onClick={addQuoteItem}
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  <i className="fa-solid fa-plus" style={{ marginRight: '4px' }}></i>
                  Add Item
                </button>
              </div>
              {newQuote.items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', gap: '1rem', alignItems: 'end', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updateQuoteItem(index, 'name', e.target.value)}
                      placeholder="e.g., Flight Tickets, Hotel Booking"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: formErrors[`itemName${index}`] ? '1px solid #e57373' : '1px solid #ccc',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {formErrors[`itemName${index}`] && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors[`itemName${index}`]}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateQuoteItem(index, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: formErrors[`itemDescription${index}`] ? '1px solid #e57373' : '1px solid #ccc',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {formErrors[`itemDescription${index}`] && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors[`itemDescription${index}`]}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>Amount (₹)</label>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={e => updateQuoteItem(index, 'amount', e.target.value)}
                      placeholder="0"
                      style={{
                        width: '90%',
                        padding: '10px 12px',
                        border: formErrors[`itemAmount${index}`] ? '1px solid #e57373' : '1px solid #ccc',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {formErrors[`itemAmount${index}`] && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors[`itemAmount${index}`]}</div>}
                  </div>
                  <div>
                    {newQuote.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuoteItem(index)}
                        style={{
                          background: '#e53935',
                          color: '#fff',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Remove Item"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {/* Total Calculation for Quote Items */}
              <div style={{ 
                background: '#f8fafc', 
                padding: '1rem', 
                borderRadius: '6px', 
                marginTop: '1rem',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>Quote Items Total:</span>
                  <span style={{ fontWeight: 700, fontSize: '18px', color: '#1976d2' }}>
                    ₹{newQuote.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            {/* Itinerary Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1976d2', margin: 0 }}>Day Wise Itinerary</h3>
                <button
                  type="button"
                  onClick={addItineraryDay}
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  <i className="fa-solid fa-plus" style={{ marginRight: '4px' }}></i>
                  Add Day
                </button>
              </div>

              {newQuote.days.map((day, dayIndex) => (
                <div key={dayIndex} style={{
                  background: '#fafbfc',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      background: '#1976d2',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '14px',
                      marginRight: '1rem'
                    }}>
                      Day {day.dayNumber}
                    </div>
                    <input
                      type="text"
                      value={day.destination}
                      onChange={e => handleDayChange(dayIndex, 'destination', e.target.value)}
                      placeholder="Destination"
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        border: formErrors[`dayDestination${dayIndex}`] ? '1px solid #e57373' : '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px',
                        marginRight: '1rem'
                      }}
                    />
                    {formErrors[`dayDestination${dayIndex}`] && (
                      <div style={{ color: '#e57373', fontSize: 12, marginTop: 2, width: '100%' }}>
                        {formErrors[`dayDestination${dayIndex}`]}
                      </div>
                    )}
                    <input
                      type="date"
                      value={day.date}
                      onChange={e => handleDayChange(dayIndex, 'date', e.target.value)}
                      style={{
                        padding: '6px 12px',
                        border: formErrors[`dayDate${dayIndex}`] ? '1px solid #e57373' : '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    {formErrors[`dayDate${dayIndex}`] && (
                      <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>
                        {formErrors[`dayDate${dayIndex}`]}
                      </div>
                    )}
                  </div>

                  <textarea
                    value={day.activities}
                    onChange={e => handleDayChange(dayIndex, 'activities', e.target.value)}
                    placeholder="Describe the day's activities..."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: formErrors[`dayActivities${dayIndex}`] ? '1px solid #e57373' : '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                      marginBottom: '1rem',
                      resize: 'vertical'
                    }}
                  />
                  {formErrors[`dayActivities${dayIndex}`] && (
                    <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>
                      {formErrors[`dayActivities${dayIndex}`]}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, marginRight: '0.5rem' }}>Overnight Stay:</span>
                    <select
                      value={day.overnightStay}
                      onChange={e => handleDayChange(dayIndex, 'overnightStay', e.target.value)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1976d2', marginBottom: '1rem' }}>Quotation Pricing</h3>
              
              {/* Per Adult Price */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                  Per Adult Price (₹)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={newQuote.pricing.perAdultPrice}
                    onChange={e => handlePricingChange('perAdultPrice', Number(e.target.value))}
                    placeholder="0"
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      border: formErrors.perAdultPrice ? '1px solid #e57373' : '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.perAdultPrice && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors.perAdultPrice}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handlePricingChange('adultCount', Math.max(0, newQuote.pricing.adultCount - 1))}
                      style={{
                        background: '#f5f5f5',
                        border: '1px solid #ccc',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 600 }}>
                      {newQuote.pricing.adultCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePricingChange('adultCount', newQuote.pricing.adultCount + 1)}
                      style={{
                        background: '#f5f5f5',
                        border: '1px solid #ccc',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="number"
                    value={newQuote.pricing.adultTotal}
                    readOnly
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                      background: '#f8f9fa'
                    }}
                  />
                </div>
              </div>

              {/* CWOB Price */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                  CWOB (₹) - Child Without Bed
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={newQuote.pricing.cwobPrice}
                    onChange={e => handlePricingChange('cwobPrice', Number(e.target.value))}
                    placeholder="0"
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      border: formErrors.cwobPrice ? '1px solid #e57373' : '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.cwobPrice && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors.cwobPrice}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handlePricingChange('cwobCount', Math.max(0, newQuote.pricing.cwobCount - 1))}
                      style={{
                        background: '#f5f5f5',
                        border: '1px solid #ccc',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 600 }}>
                      {newQuote.pricing.cwobCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePricingChange('cwobCount', newQuote.pricing.cwobCount + 1)}
                      style={{
                        background: '#f5f5f5',
                        border: '1px solid #ccc',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="number"
                    value={newQuote.pricing.cwobTotal}
                    readOnly
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                      background: '#f8f9fa'
                    }}
                  />
                </div>
              </div>

              {/* CWB Price */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>
                  CWB (₹) - Child With Bed
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={newQuote.pricing.cwbPrice}
                    onChange={e => handlePricingChange('cwbPrice', Number(e.target.value))}
                    placeholder="0"
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      border: formErrors.cwbPrice ? '1px solid #e57373' : '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.cwbPrice && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors.cwbPrice}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handlePricingChange('cwbCount', Math.max(0, newQuote.pricing.cwbCount - 1))}
                      style={{
                        background: '#f5f5f5',
                        border: '1px solid #ccc',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 600 }}>
                      {newQuote.pricing.cwbCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePricingChange('cwbCount', newQuote.pricing.cwbCount + 1)}
                      style={{
                        background: '#f5f5f5',
                        border: '1px solid #ccc',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="number"
                    value={newQuote.pricing.cwbTotal}
                    readOnly
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                      background: '#f8f9fa'
                    }}
                  />
                </div>
              </div>

              {/* Total and Discount */}
              <div style={{ 
                padding: '1rem', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>Total Quotation Price (₹)</span>
                  <span style={{ fontWeight: 700, fontSize: '18px', color: '#1976d2' }}>
                    ₹{newQuote.pricing.totalPrice.toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Discount(-) (₹)</span>
                  <input
                    type="number"
                    value={newQuote.pricing.discountPercent}
                    onChange={e => handlePricingChange('discountPercent', Number(e.target.value))}
                    placeholder="0"
                    style={{
                      width: '80px',
                      padding: '6px 10px',
                      border: formErrors.discountPercent ? '1px solid #e57373' : '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <span style={{ fontSize: '14px' }}>%</span>
                  <input
                    type="number"
                    value={newQuote.pricing.discountAmount}
                    readOnly
                    style={{
                      width: '120px',
                      padding: '6px 10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                      background: '#f8f9fa'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>Payable Price (₹)</span>
                  <span style={{ fontWeight: 700, fontSize: '20px', color: '#43a047' }}>
                    ₹{newQuote.pricing.payablePrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            

            {/* Additional Details */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1976d2', marginBottom: '1rem' }}>Additional Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>Valid Until</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={newQuote.validUntil}
                    onChange={handleNewQuoteChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: formErrors.validUntil ? '1px solid #e57373' : '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formErrors.validUntil && <div style={{ color: '#e57373', fontSize: 12, marginTop: 2 }}>{formErrors.validUntil}</div>}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '14px' }}>Notes</label>
                <textarea
                  name="notes"
                  value={newQuote.notes}
                  onChange={handleNewQuoteChange}
                  rows="3"
                  placeholder="Additional notes or special requirements..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: formErrors.notes ? '1px solid #e57373' : '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="button"
                onClick={handlePreviewCurrent}
                style={{
                  background: '#fff',
                  color: '#1976d2',
                  border: '1.5px solid #1976d2',
                  borderRadius: 6,
                  padding: '10px 28px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16,
                  minWidth: 120,
                  maxWidth: 180
                }}
                disabled={hasErrors}
              >
                Preview Quote
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select value={pdfTemplate} onChange={e => setPdfTemplate(e.target.value)} style={{ marginRight: 12, padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontWeight: 600 }}>
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="elegant">Elegant</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="travelmagazine">Travel Magazine</option>
                  <option value="professional">Professional</option>
                </select>
                <button
                  type="button"
                  onClick={handleDownloadPDFCurrent}
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 28px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 16,
                    minWidth: 120,
                    maxWidth: 180
                  }}
                  disabled={hasErrors}
                >
                  Download PDF
                </button>
              </div>
              <button
                type="submit"
                disabled={isCreatingQuote}
                style={{
                  background: isCreatingQuote ? '#ccc' : '#43a047',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 28px',
                  fontWeight: 600,
                  cursor: isCreatingQuote ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                  minWidth: 120,
                  maxWidth: 180,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isCreatingQuote && <i className="fa-solid fa-spinner fa-spin"></i>}
                {isCreatingQuote ? 'Creating...' : 'Create Quote'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quote Preview Modal */}
      {showPreview && previewHTML && (
        <div className="modal-backdrop" onClick={() => setShowPreview(false)}>
          <div className="modal-content" style={{ maxWidth: 900, width: '100%', borderRadius: 18, boxShadow: '0 8px 32px rgba(25,118,210,0.12)', padding: '2.2rem 1.2rem', position: 'relative', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
            <button onClick={() => setShowPreview(false)} style={{ marginTop: 24, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Edit Quote Modal */}
      {editModalOpen && editingQuote && (
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: 480,
              width: '100%',
              borderRadius: 18,
              boxShadow: '0 8px 32px rgba(25,118,210,0.12)',
              padding: '2.2rem 1.2rem',
              position: 'relative',
              margin: '0 auto',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{
              marginBottom: 24,
              textAlign: 'center',
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: 22
            }}>Edit Quote: {editingQuote._id}</h2>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Lead Name</label>
              <input
                value={editingQuote.leadName}
                onChange={(e) => setEditingQuote({...editingQuote, leadName: e.target.value})}
                style={{
                  width: '100%',
                  borderRadius: 6,
                  padding: '10px 12px',
                  border: '1px solid #ccc',
                  fontSize: 15
                }}
              />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Destination</label>
              <select
                value={editingQuote.destinationId || editingQuote.destination}
                onChange={(e) => setEditingQuote({...editingQuote, destination: e.target.value})}
                style={{
                  width: '100%',
                  borderRadius: 6,
                  padding: '10px 12px',
                  border: '1px solid #ccc',
                  fontSize: 15
                }}
              >
                {isLoadingData ? (
                  <option value="" disabled>Loading...</option>
                ) : (
                  destinationList.map(opt => {
                    const id = opt._id || opt.id || opt.destination_id;
                    const name = opt.name || opt.destination_name || opt.title || opt.destination;
                    return <option key={id} value={id}>{name}</option>;
                  })
                )}
              </select>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Trip Type</label>
              <select
                value={editingQuote.tripTypeId || editingQuote.tripType}
                onChange={(e) => setEditingQuote({...editingQuote, tripType: e.target.value})}
                style={{
                  width: '100%',
                  borderRadius: 6,
                  padding: '10px 12px',
                  border: '1px solid #ccc',
                  fontSize: 15
                }}
              >
                {isLoadingData ? (
                  <option value="" disabled>Loading...</option>
                ) : (
                  tripTypeList.map(opt => {
                    const id = opt._id || opt.id || opt.trip_type_id;
                    const name = opt.name || opt.trip_type_name || opt.title || opt.trip_type;
                    return <option key={id} value={id}>{name}</option>;
                  })
                )}
              </select>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Status</label>
              <select
                value={editingQuote.status}
                onChange={(e) => setEditingQuote({...editingQuote, status: e.target.value})}
                style={{
                  width: '100%',
                  borderRadius: 6,
                  padding: '10px 12px',
                  border: '1px solid #ccc',
                  fontSize: 15
                }}
              >
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Total Amount</label>
              <input
                type="number"
                value={editingQuote.totalAmount}
                onChange={(e) => setEditingQuote({...editingQuote, totalAmount: Number(e.target.value)})}
                style={{
                  width: '100%',
                  borderRadius: 6,
                  padding: '10px 12px',
                  border: '1px solid #ccc',
                  fontSize: 15
                }}
              />
            </div>

            <div className="modal-buttons" style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{
                  background: '#fff',
                  color: '#1976d2',
                  border: '1.5px solid #1976d2',
                  borderRadius: 6,
                  padding: '10px 28px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 28px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteBuilder;