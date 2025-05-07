import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a currency amount with the specified currency code
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  // Format the number
  let formatted: string;
  
  // Special case for KES (Kenyan Shilling) since it's not widely supported in Intl
  if (currencyCode === 'KES') {
    formatted = `KES ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } else {
    formatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  }
  
  return formatted;
}

/**
 * Format a date string with optional format options
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    if (options) {
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
    
    // Default format: "Jan 1, 2023"
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
}

/**
 * Format a date as a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Date error';
  }
}

/**
 * Generate a random ID (useful for temporary IDs)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
