import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DownloadCloud, 
  Calendar, 
  ArrowUpRight, 
  Users, 
  Wallet, 
  Activity,
  MapPin,
  Clock
} from 'lucide-react';

// Mock data - would come from API in a real application
const userGrowthData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 140 },
  { month: 'Mar', users: 190 },
  { month: 'Apr', users: 220 },
  { month: 'May', users: 260 },
  { month: 'Jun', users: 320 },
  { month: 'Jul', users: 380 },
  { month: 'Aug', users: 450 },
  { month: 'Sep', users: 520 },
  { month: 'Oct', users: 580 },
  { month: 'Nov', users: 650 },
  { month: 'Dec', users: 720 },
];

const transactionVolumeData = [
  { month: 'Jan', volume: 150000 },
  { month: 'Feb', volume: 180000 },
  { month: 'Mar', volume: 220000 },
  { month: 'Apr', volume: 260000 },
  { month: 'May', volume: 310000 },
  { month: 'Jun', volume: 350000 },
  { month: 'Jul', volume: 400000 },
  { month: 'Aug', volume: 460000 },
  { month: 'Sep', volume: 510000 },
  { month: 'Oct', volume: 570000 },
  { month: 'Nov', volume: 620000 },
  { month: 'Dec', volume: 690000 },
];

const chamaGrowthData = [
  { month: 'Jan', chamas: 25 },
  { month: 'Feb', chamas: 35 },
  { month: 'Mar', chamas: 45 },
  { month: 'Apr', chamas: 55 },
  { month: 'May', chamas: 70 },
  { month: 'Jun', chamas: 85 },
  { month: 'Jul', chamas: 100 },
  { month: 'Aug', chamas: 115 },
  { month: 'Sep', chamas: 130 },
  { month: 'Oct', chamas: 150 },
  { month: 'Nov', chamas: 170 },
  { month: 'Dec', chamas: 190 },
];

const usersByLocationData = [
  { name: 'Nairobi', value: 45 },
  { name: 'Mombasa', value: 20 },
  { name: 'Kisumu', value: 15 },
  { name: 'Nakuru', value: 10 },
  { name: 'Other', value: 10 },
];

const timeOfDayData = [
  { name: 'Morning (6-12)', value: 30 },
  { name: 'Afternoon (12-18)', value: 40 },
  { name: 'Evening (18-24)', value: 25 },
  { name: 'Night (0-6)', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  const handleExportData = (dataType: string) => {
    toast({
      title: "Data exported",
      description: `${dataType} data has been exported to your downloads folder.`,
    });
  };

  // Card with key metric and percentage change
  const MetricCard = ({ title, value, change, icon: Icon }: { 
    title: string; 
    value: string; 
    change: number;
    icon: React.ElementType
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="rounded-full bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex items-center mt-3">
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <ArrowUpRight className={`h-4 w-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(change)}% from last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Activity className="mr-2 h-5 w-5" /> 
          Analytics Dashboard
        </CardTitle>
        <CardDescription>
          Monitor platform growth, financial metrics, and user behavior.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard 
                  title="Total Users" 
                  value="720" 
                  change={10.8} 
                  icon={Users} 
                />
                <MetricCard 
                  title="Active Chamas" 
                  value="190" 
                  change={11.8} 
                  icon={Users} 
                />
                <MetricCard 
                  title="Transaction Volume" 
                  value="KES 690,000" 
                  change={11.3} 
                  icon={Wallet} 
                />
                <MetricCard 
                  title="New Registrations" 
                  value="70" 
                  change={-5.4} 
                  icon={Activity} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Growth</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={userGrowthData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="#8884d8" 
                            strokeWidth={3} 
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction Volume (KES)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={transactionVolumeData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar 
                            dataKey="volume" 
                            fill="#0088FE" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* User Analytics Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Growth by Month</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={userGrowthData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            name="Total Users"
                            stroke="#8884d8" 
                            strokeWidth={3} 
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Users by Location</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={usersByLocationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {usersByLocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Acquisition Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 text-center">
                      <h4 className="text-lg font-semibold">Direct</h4>
                      <p className="text-3xl font-bold mt-2">45%</p>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 text-center">
                      <h4 className="text-lg font-semibold">Referral</h4>
                      <p className="text-3xl font-bold mt-2">30%</p>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 text-center">
                      <h4 className="text-lg font-semibold">Social</h4>
                      <p className="text-3xl font-bold mt-2">15%</p>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 text-center">
                      <h4 className="text-lg font-semibold">Other</h4>
                      <p className="text-3xl font-bold mt-2">10%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction Volume</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={transactionVolumeData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            dataKey="volume" 
                            name="Transaction Volume (KES)"
                            fill="#0088FE" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chama Growth</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chamaGrowthData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="chamas" 
                            name="Total Chamas"
                            stroke="#00C49F" 
                            strokeWidth={3} 
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Transaction Volume</h4>
                      <p className="text-2xl font-bold mt-1">KES 4,320,000</p>
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>11.3% from last year</span>
                      </div>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Average Chama Size</h4>
                      <p className="text-2xl font-bold mt-1">KES 227,368</p>
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>8.2% from last year</span>
                      </div>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Average Transaction</h4>
                      <p className="text-2xl font-bold mt-1">KES 5,670</p>
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>3.5% from last year</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="behavior">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Activity by Time of Day</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={timeOfDayData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {timeOfDayData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Feature Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Chama Management</span>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Financial Transactions</span>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Chat & Messaging</span>
                          <span className="text-sm font-medium">62%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '62%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Learning Hub</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Marketplace</span>
                          <span className="text-sm font-medium">38%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '38%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">30-Day Retention</h4>
                      <p className="text-2xl font-bold mt-1">78%</p>
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>5.3% from last month</span>
                      </div>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">90-Day Retention</h4>
                      <p className="text-2xl font-bold mt-1">65%</p>
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>3.8% from last quarter</span>
                      </div>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Average Session Time</h4>
                      <p className="text-2xl font-bold mt-1">12m 37s</p>
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>2.5% from last month</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-5">
        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Last updated: May 6, 2025 at 09:14 AM</span>
        </div>
        <Button onClick={() => handleExportData('analytics')} className="gap-1">
          <DownloadCloud className="h-4 w-4" /> Export Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminAnalytics;