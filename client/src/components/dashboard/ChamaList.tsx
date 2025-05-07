import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ChamaCard from '../chama/ChamaCard';
import { useChama } from '@/hooks/useChama';

interface ChamaListProps {
  onCreateChama: () => void;
}

const ChamaList: React.FC<ChamaListProps> = ({ onCreateChama }) => {
  const { chamas, isLoading } = useChama();
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">My Chamas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton loading cards
          <>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
          </>
        ) : chamas.length > 0 ? (
          // Display chamas
          chamas.map(chama => (
            <ChamaCard key={chama.id} chama={chama} />
          ))
        ) : (
          // If no chamas, display message
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-5 col-span-full">
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              You don't have any chamas yet. Create one to get started!
            </p>
          </div>
        )}
        
        {/* Create New Chama Card */}
        <div 
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center p-8"
          onClick={onCreateChama}
        >
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <h3 className="font-medium text-lg mb-2">Create New Chama</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-4">
            Start a new savings or investment group with friends and family
          </p>
          <Button 
            variant="outline" 
            className="bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-medium"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChamaList;
