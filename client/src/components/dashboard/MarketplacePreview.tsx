import React from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import MarketplaceItem from '../marketplace/MarketplaceItem';

interface MarketplacePreviewProps {
  limit?: number;
}

const MarketplacePreview: React.FC<MarketplacePreviewProps> = ({ limit = 4 }) => {
  const { data: marketplaceData, isLoading } = useQuery({
    queryKey: ['/api/marketplace'],
  });

  const items = marketplaceData?.items || [];
  const limitedItems = items.slice(0, limit);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Marketplace</h2>
        <Button variant="link" className="text-primary text-sm font-medium flex items-center" asChild>
          <a href="/marketplace">
            Visit Marketplace <span className="ml-1">→</span>
          </a>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Skeleton loading
          <>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
            {limit > 2 && (
              <>
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
              </>
            )}
          </>
        ) : limitedItems.length > 0 ? (
          // Display items
          limitedItems.map((item: any) => (
            <MarketplaceItem key={item.id} item={item} />
          ))
        ) : (
          // If no items, display message
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-5 col-span-full">
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              No marketplace items available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePreview;
