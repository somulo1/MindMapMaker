import React from 'react';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LearningCardProps {
  resource: {
    id: number;
    title: string;
    description?: string;
    category: string;
    type: string;
    duration?: number;
    imageUrl?: string;
  };
  horizontal?: boolean;
}

const LearningCard: React.FC<LearningCardProps> = ({ resource, horizontal = false }) => {
  const getCategoryStyles = () => {
    switch (resource.category) {
      case 'basics':
        return 'bg-primary/10 text-primary';
      case 'intermediate':
        return 'bg-secondary/10 text-secondary';
      case 'advanced':
        return 'bg-accent/10 text-accent-dark';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const getCategoryLabel = () => {
    switch (resource.category) {
      case 'basics':
        return 'Basics';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return resource.category;
    }
  };

  const getDurationLabel = () => {
    if (!resource.duration) return '';
    
    switch (resource.type) {
      case 'article':
        return `${resource.duration} min read`;
      case 'video':
        return `${resource.duration} min video`;
      case 'tutorial':
        return `${resource.duration} min tutorial`;
      default:
        return `${resource.duration} min`;
    }
  };

  // Fallback image URL if not provided
  const imageUrl = resource.imageUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80';

  if (horizontal) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden flex">
        <img src={imageUrl} alt={resource.title} className="w-20 h-20 object-cover" />
        <div className="p-3 flex-1">
          <span className={`inline-block px-1.5 py-0.5 ${getCategoryStyles()} text-xs rounded-full mb-1`}>
            {getCategoryLabel()}
          </span>
          <h3 className="font-medium text-sm mb-1">{resource.title}</h3>
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{getDurationLabel()}</span>
            <Button variant="ghost" size="sm" className="text-primary p-0 h-6 w-6">
              <Play className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
      <img src={imageUrl} alt={resource.title} className="w-full h-36 object-cover" />
      <div className="p-4">
        <span className={`inline-block px-2 py-1 ${getCategoryStyles()} text-xs rounded-full mb-2`}>
          {getCategoryLabel()}
        </span>
        <h3 className="font-semibold mb-1">{resource.title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
          {resource.description || 'Learn more about this topic'}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{getDurationLabel()}</span>
          <Button variant="ghost" size="sm" className="text-primary p-1 h-8 w-8">
            <Play className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearningCard;
