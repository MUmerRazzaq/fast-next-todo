"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TaskFilters, getDefaultFilters } from '@/components/dashboard/unified-sidebar';

interface FilterContextType {
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, _setFilters] = useState<TaskFilters>(() => {
    const params = new URLSearchParams(searchParams);
    const initialFilters = getDefaultFilters();
    initialFilters.isCompleted = params.get('isCompleted') === 'true' ? true : params.get('isCompleted') === 'false' ? false : false; // Default to false
    initialFilters.priorities = params.getAll('priority') as TaskFilters['priorities'];
    initialFilters.tagIds = params.getAll('tagId');
    initialFilters.dueFrom = params.get('dueFrom') || undefined;
    initialFilters.dueTo = params.get('dueTo') || undefined;
    return initialFilters;
  });

  const setFilters = useCallback((newFilters: TaskFilters) => {
    _setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.isCompleted !== undefined) {
      params.set('isCompleted', String(newFilters.isCompleted));
    }
    newFilters.priorities.forEach(p => params.append('priority', p));
    newFilters.tagIds.forEach(id => params.append('tagId', id));
    if (newFilters.dueFrom) {
      params.set('dueFrom', newFilters.dueFrom);
    }
    if (newFilters.dueTo) {
      params.set('dueTo', newFilters.dueTo);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router]);

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
