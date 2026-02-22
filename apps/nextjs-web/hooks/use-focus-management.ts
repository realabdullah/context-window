'use client'

import { useEffect } from 'react'

/**
 * Hook to announce page changes to screen readers
 * for better accessibility in single-page applications
 */
export function useFocusManagement(title: string) {
  useEffect(() => {
    // Set the page title for screen readers
    document.title = `${title} | Context Window`
    
    // Find the main content area and focus it
    const mainContent = document.querySelector('main')
    if (mainContent) {
      // Add tabindex to make it focusable
      if (!mainContent.getAttribute('tabindex')) {
        mainContent.setAttribute('tabindex', '-1')
      }
      // Focus for screen reader announcements
      mainContent.focus()
    }
  }, [title])
}
