import { useState, useEffect } from 'react'

/**
 * Custom hook that debounces a value by the specified delay
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timer if value changes before delay is reached
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for debounced search functionality
 * @param searchTerm The search term to debounce
 * @param delay The delay in milliseconds (default: 1000ms)
 * @returns Object with debouncedSearchTerm and isSearching state
 */
export function useDebouncedSearch(searchTerm: string, delay: number = 1000) {
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  useEffect(() => {
    // Set searching state when user is typing
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }
  }, [searchTerm, debouncedSearchTerm])

  return {
    debouncedSearchTerm,
    isSearching
  }
} 