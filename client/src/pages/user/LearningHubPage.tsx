import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LearningCard from '@/components/learning/LearningCard';

const LearningHubPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch learning resources
  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ['/api/learning'],
  });
  
  const allResources = resourcesData?.resources || [];
  
  // Filter resources based on search term
  const filteredResources = allResources.filter(resource => 
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Categorize resources
  const basicResources = filteredResources.filter(resource => resource.category === 'basics');
  const intermediateResources = filteredResources.filter(resource => resource.category === 'intermediate');
  const advancedResources = filteredResources.filter(resource => resource.category === 'advanced');
  
  return (
    <UserLayout title="Learning Hub">
      <div className={isMobile ? "p-4" : ""}>
        {/* Header with search */}
        <div className="flex items-center mb-6">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
            <Input
              placeholder="Search learning resources..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Learning Hub content */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Learning Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                    ))}
                  </div>
                ) : filteredResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredResources.map((resource) => (
                      <LearningCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg py-10 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                      {searchTerm 
                        ? "No resources match your search criteria." 
                        : "No learning resources available at the moment."}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="basics">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                    ))}
                  </div>
                ) : basicResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {basicResources.map((resource) => (
                      <LearningCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg py-10 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No basic resources available.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="intermediate">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                    ))}
                  </div>
                ) : intermediateResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {intermediateResources.map((resource) => (
                      <LearningCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg py-10 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No intermediate resources available.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="advanced">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden h-64 skeleton"></div>
                    ))}
                  </div>
                ) : advancedResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {advancedResources.map((resource) => (
                      <LearningCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg py-10 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No advanced resources available.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Popular Topics */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Featured Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Financial Literacy</Button>
              <Button variant="outline" size="sm">Investment Strategies</Button>
              <Button variant="outline" size="sm">Budgeting</Button>
              <Button variant="outline" size="sm">Business Planning</Button>
              <Button variant="outline" size="sm">Savings</Button>
              <Button variant="outline" size="sm">Debt Management</Button>
              <Button variant="outline" size="sm">Retirement Planning</Button>
              <Button variant="outline" size="sm">Risk Management</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default LearningHubPage;
