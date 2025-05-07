import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook to check if the screen size matches a mobile device
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * Hook to check if the screen size matches a given media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query);
      
      // Set initial value
      setMatches(mediaQuery.matches);
      
      // Create listener function
      const handler = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Add listener for changes
      mediaQuery.addEventListener("change", handler);
      
      // Clean up
      return () => {
        mediaQuery.removeEventListener("change", handler);
      };
    }
    
    return undefined;
  }, [query]);

  return matches;
}
