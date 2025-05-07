import React from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import LearningCard from '../learning/LearningCard';

interface LearningHubProps {
  limit?: number;
  showTitle?: boolean;
}

const LearningHub: React.FC<LearningHubProps> = ({ 
  limit = 3,
  showTitle = true 
}) => {
  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/learning'],
  });

  const limitedResources = resources?.resources?.slice(0, limit) || [];

  return (
    <div className="mb-8">
      {showTitle && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Learning Hub</h2>
          <Button variant="link" className="text-primary text-sm font-medium flex items-center" asChild>
            <a href="/learning">
              View All <span className="ml-1">→</span>
            </a>
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton loading cards
          <>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
          </>
        ) : limitedResources.length > 0 ? (
          // Display resources
          limitedResources.map((resource: any) => (
            <LearningCard key={resource.id} resource={resource} />
          ))
        ) : (
          // If no resources, display message
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-5 col-span-full">
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              No learning resources available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningHub;
