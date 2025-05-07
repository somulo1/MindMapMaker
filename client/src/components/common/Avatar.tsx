import React from 'react';
import { Avatar as UIAvatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AvatarProps {
  src?: string | null;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  online?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  fallback, 
  size = 'md',
  className = '',
  online
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  };

  return (
    <div className="relative">
      <UIAvatar className={`${sizeClasses[size]} ${className}`}>
        {src && <AvatarImage src={src} alt="Profile picture" />}
        <AvatarFallback>{fallback}</AvatarFallback>
      </UIAvatar>
      
      {online && (
        <span className={`absolute -top-1 -right-1 ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'} bg-success rounded-full border-2 border-white dark:border-neutral-800`}></span>
      )}
    </div>
  );
};

export default Avatar;
