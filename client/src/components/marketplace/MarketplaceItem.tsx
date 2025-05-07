import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Avatar from '../common/Avatar';

interface MarketplaceItemProps {
  item: {
    id: number;
    title: string;
    description?: string;
    price: number;
    currency: string;
    imageUrl?: string;
    seller: {
      id: number;
      username: string;
      fullName: string;
      profilePic?: string;
    };
  };
}

const MarketplaceItem: React.FC<MarketplaceItemProps> = ({ item }) => {
  const formattedPrice = formatCurrency(item.price, item.currency);
  const sellerInitials = item.seller.fullName
    ? item.seller.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : item.seller.username.substring(0, 2).toUpperCase();
  
  const sellerName = item.seller.fullName || item.seller.username;
  const firstLetter = sellerName.charAt(0).toUpperCase();
  const displayName = `${firstLetter}${sellerName.slice(1).split(' ')[0]}'s ${item.title.includes('Shop') ? '' : 'Shop'}`;

  // Fallback image URL if not provided
  const imageUrl = item.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80';

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
      <img src={imageUrl} alt={item.title} className="w-full h-36 object-cover" />
      <div className="p-3">
        <div className="flex items-center mb-2">
          <Avatar 
            src={item.seller.profilePic}
            fallback={sellerInitials}
            size="sm"
            className="mr-2 bg-secondary text-white text-xs"
          />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{displayName}</span>
        </div>
        <h3 className="font-medium text-sm mb-1">{item.title}</h3>
        <p className="text-primary font-semibold text-sm mb-2">{formattedPrice}</p>
        <Button 
          variant="secondary" 
          className="w-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 text-sm py-1.5 rounded"
          asChild
        >
          <a href={`/marketplace/${item.id}`}>View Details</a>
        </Button>
      </div>
    </div>
  );
};

export default MarketplaceItem;
