import React, { createContext, useContext, useState, useCallback } from 'react';

const BrowseFiltersContext = createContext(null);

export const BrowseFiltersProvider = ({ children }) => {
  const [filters, setFilters] = useState({ search: '', city: '', gender: '' });
  const [triggerSearch, setTriggerSearch] = useState(0);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = useCallback(() => {
    setTriggerSearch(n => n + 1);
  }, []);

  const resetFilters = () => {
    setFilters({ search: '', city: '', gender: '' });
    setTriggerSearch(n => n + 1);
  };

  return (
    <BrowseFiltersContext.Provider value={{ filters, handleFilterChange, applyFilters, resetFilters, triggerSearch }}>
      {children}
    </BrowseFiltersContext.Provider>
  );
};

export const useBrowseFilters = () => useContext(BrowseFiltersContext);
