import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useMediaQuery } from '@/hooks/use-mobile';
import MobileLayout from '@/components/layouts/MobileLayout';
import DesktopLayout from '@/components/layouts/DesktopLayout';
import { useChama } from '@/hooks/useChama';
import { useWallet } from '@/context/WalletContext';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronLeft, MessageCircle, PlusCircle, Users, Wallet } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import ChamaMemberList from '@/components/chama/ChamaMemberList';
import ChamaWalletCard from '@/components/chama/ChamaWalletCard';
import ChatInterface from '@/components/messages/ChatInterface';
import TransactionHistoryList from '@/components/wallet/TransactionHistoryList';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Link } from 'wouter';

// Contribution Schema
const contributionSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  description: z.string().optional(),
});

// Add Member Schema
const addMemberSchema = z.object({
  userId: z.coerce.number().positive({ message: "User ID is required" }),
  role: z.string().optional(),
  contributionAmount: z.coerce.number().optional(),
  contributionFrequency: z.string().optional(),
});

interface ChamaDetailPageProps {
  id?: string;
}

const ChamaDetailPage: React.FC<ChamaDetailPageProps> = ({ id: propId }) => {
  const params = useParams<{ id: string }>();
  const id = propId || params.id;
  const chamaId = parseInt(id || '0');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { currentChama, chamaMembers, selectChama, addMember, isLoading } = useChama();
  const { chamaWallet, chamaTransactions, contributeToChamaFunds, setChamaId } = useWallet();
  const { currentChamaId, joinChamaChat, sendChamaMessage } = useChat();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
  const contributionForm = useForm<z.infer<typeof contributionSchema>>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { amount: 0, description: "" },
  });
  
  const addMemberForm = useForm<z.infer<typeof addMemberSchema>>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { 
      userId: 0, 
      role: "member", 
      contributionAmount: 0,
      contributionFrequency: "monthly" 
    },
  });
  
  // Set current chama when the page loads
  useEffect(() => {
    if (chamaId) {
      selectChama(chamaId);
      setChamaId(chamaId);
      
      // Join chama chat
      if (currentChamaId !== chamaId) {
        joinChamaChat(chamaId);
      }
    }
  }, [chamaId, selectChama, setChamaId, joinChamaChat, currentChamaId]);
  
  // Handle contribution submit
  const onContributeSubmit = async (values: z.infer<typeof contributionSchema>) => {
    try {
      await contributeToChamaFunds(values.amount, chamaId, values.description);
      toast({
        title: "Contribution successful",
        description: `You have contributed ${formatCurrency(values.amount, 'KES')} to this chama.`,
      });
      setIsContributeOpen(false);
      contributionForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Contribution failed",
        description: error instanceof Error ? error.message : "An error occurred during the contribution.",
      });
    }
  };
  
  // Handle add member submit
  const onAddMemberSubmit = async (values: z.infer<typeof addMemberSchema>) => {
    try {
      await addMember(values);
      toast({
        title: "Member added successfully",
        description: "The new member has been added to the chama.",
      });
      setIsAddMemberOpen(false);
      addMemberForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add member",
        description: error instanceof Error ? error.message : "An error occurred while adding the member.",
      });
    }
  };
  
  if (isLoading || !currentChama) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const content = (
    <div className={isMobile ? "p-4" : ""}>
      {isMobile && (
        <div className="flex items-center mb-4">
          <Link href="/chamas">
            <Button variant="ghost" size="sm" className="mr-2 p-0 h-8 w-8">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{currentChama.name}</h1>
        </div>
      )}
      
      <div className="mb-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
          <div className={`h-32 bg-${currentChama.iconBg} flex items-end p-4`}>
            <div className="w-20 h-20 rounded-lg bg-white dark:bg-neutral-800 shadow-md flex items-center justify-center -mb-10">
              <span className={`material-icons text-${currentChama.iconBg} text-4xl`}>
                {currentChama.icon}
              </span>
            </div>
          </div>
          <div className="p-4 pt-12">
            <h1 className="text-2xl font-bold mb-1">{currentChama.name}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              {currentChama.memberCount} members • Est. {new Date(currentChama.establishedDate).getFullYear()}
            </p>
            {currentChama.description && (
              <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                {currentChama.description}
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Group Balance</p>
                  <p className="text-xl font-bold">{formatCurrency(currentChama.balance, 'KES')}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Members</p>
                  <p className="text-xl font-bold">{currentChama.memberCount}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Next Meeting</p>
                  <p className="text-xl font-bold">{currentChama.nextMeeting ? formatDate(currentChama.nextMeeting) : 'Not scheduled'}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsContributeOpen(true)}>Contribute Funds</Button>
              <Button variant="outline" onClick={() => setActiveTab('members')}>
                <Users className="mr-2 h-4 w-4" /> View Members
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('chat')}>
                <MessageCircle className="mr-2 h-4 w-4" /> Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChamaWalletCard chama={currentChama} wallet={chamaWallet} />
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Upcoming Events</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentChama.nextMeeting ? (
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 flex items-start">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Monthly Meeting</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatDate(currentChama.nextMeeting)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">
                    No upcoming events scheduled.
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionHistoryList transactions={chamaTransactions.slice(0, 5)} />
                
                <Button 
                  variant="link" 
                  className="w-full mt-2" 
                  onClick={() => setActiveTab('transactions')}
                >
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Chama Members</span>
                <Button size="sm" onClick={() => setIsAddMemberOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChamaMemberList members={chamaMembers} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionHistoryList transactions={chamaTransactions} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Chama Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatInterface isChama={true} chamaId={chamaId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Contribute Dialog */}
      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to Chama</DialogTitle>
            <DialogDescription>
              Make a contribution to the chama funds.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...contributionForm}>
            <form onSubmit={contributionForm.handleSubmit(onContributeSubmit)} className="space-y-4">
              <FormField
                control={contributionForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={contributionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly contribution" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={contributionForm.formState.isSubmitting}>
                  {contributionForm.formState.isSubmitting ? "Processing..." : "Contribute"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Chama</DialogTitle>
            <DialogDescription>
              Add a new member to your chama.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addMemberForm}>
            <form onSubmit={addMemberForm.handleSubmit(onAddMemberSubmit)} className="space-y-4">
              <FormField
                control={addMemberForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMemberForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="member">Member</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="secretary">Secretary</option>
                        <option value="assistant">Assistant</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMemberForm.control}
                name="contributionAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Amount (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMemberForm.control}
                name="contributionFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Frequency</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={addMemberForm.formState.isSubmitting}>
                  {addMemberForm.formState.isSubmitting ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  return (
    <>
      {isMobile ? (
        <MobileLayout title={currentChama?.name || "Chama"}>
          {content}
        </MobileLayout>
      ) : (
        <DesktopLayout title={currentChama?.name || "Chama"} subtitle="Manage your chama activities and members">
          {content}
        </DesktopLayout>
      )}
    </>
  );
};

export default ChamaDetailPage;
