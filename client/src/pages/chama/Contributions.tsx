import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ChamaLayout from "@/components/layout/ChamaLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Search,
  DollarSign,
  Plus,
  Filter,
  BarChart4,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { getChamaContributions, getChamaMembers, createContribution, payContribution, transferToChama, getChamaWallet } from "@/services/api";
import { Contribution, ChamaMember, ChamaMemberWithUser, Wallet, Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

// Extend the Contribution type to include member data
type EnrichedContribution = Contribution & {
  member?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    profilePic?: string;
    location?: string;
    phoneNumber?: string;
  } | null;
};

// Form schema for creating a new contribution
const contributionSchema = z.object({
  amount: z.string().min(1, { message: "Please enter an amount" })
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

// API response types
interface ContributionsResponse {
  contributions: EnrichedContribution[];
}

interface ContributionPaymentResponse {
  contribution: Contribution;
  transaction: Transaction;
}

interface MutationContext {
  previousContributions: ContributionsResponse | undefined;
}

export default function ChamaContributions() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openNewContributionDialog, setOpenNewContributionDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const { data: contributions = [], isLoading: isContributionsLoading } = useQuery<EnrichedContribution[]>({
    queryKey: [`/api/chamas/${chamaId}/contributions`],
    queryFn: async () => {
      const response = await getChamaContributions(chamaId);
      return response || [];
    },
    enabled: !isNaN(chamaId)
  });

  const { data: members = [], isLoading: isMembersLoading } = useQuery<ChamaMemberWithUser[]>({
    queryKey: [`/api/chamas/${chamaId}/members`],
    queryFn: async () => {
      const response = await getChamaMembers(chamaId);
      return response;
    },
    enabled: !isNaN(chamaId)
  });

  // Create a map of userId to member info for faster lookups
  const memberMap = new Map(members.map(member => [member.userId, member]));

  // Get chama wallet
  const { data: chamaWallet } = useQuery<Wallet>({
    queryKey: [`/api/chamas/${chamaId}/wallet`],
    queryFn: () => getChamaWallet(chamaId),
    enabled: !isNaN(chamaId)
  });

  // Format wallet balance
  const formattedBalance = chamaWallet ? 
    `${chamaWallet.currency} ${chamaWallet.balance.toLocaleString()}` : 
    "Loading...";

  const lastUpdate = chamaWallet ? 
    new Date(chamaWallet.lastUpdated).toLocaleString() : 
    "Loading...";

  // Form for adding new contribution
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: "",
    },
  });

  // Pay contribution mutation
  const payContributionMutation = useMutation<ContributionPaymentResponse, Error, number>({
    mutationFn: payContribution,
    onSuccess: () => {
      // Invalidate and refetch contributions
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/contributions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/wallets/user`] });
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/wallet`] });
      
      toast({
        title: "Payment successful",
        description: "Your contribution has been paid successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    }
  });

  const handlePayContribution = async (contributionId: number) => {
    try {
      setIsProcessingPayment(true);
      await payContributionMutation.mutateAsync(contributionId);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Filter contributions based on search query and status filter
  const filteredContributions = contributions.filter((contribution: EnrichedContribution) => {
    const memberInfo = memberMap.get(contribution.userId);
    const memberName = memberInfo?.user?.fullName || "Unknown Member";
    const memberEmail = memberInfo?.user?.email || "";
    
    const matchesSearch = 
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contribution.amount.toString().includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === "all" || 
      contribution.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort contributions by date (most recent first)
  const sortedContributions = [...filteredContributions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate contribution statistics
  const totalContributions = contributions.length;
  const paidContributions = contributions.filter((c: EnrichedContribution) => c.status === "paid").length;
  const pendingContributions = contributions.filter((c: EnrichedContribution) => c.status === "pending").length;
  const overdueContributions = contributions.filter((c: EnrichedContribution) => c.status === "overdue").length;
  
  const totalAmount = contributions.reduce((sum, c: EnrichedContribution) => sum + parseFloat(c.amount.toString()), 0);
  const paidAmount = contributions
    .filter((c: EnrichedContribution) => c.status === "paid")
    .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
  const pendingAmount = contributions
    .filter((c: EnrichedContribution) => c.status === "pending")
    .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
  const overdueAmount = contributions
    .filter((c: EnrichedContribution) => c.status === "overdue")
    .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get status badge styles
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Format contribution date
  const formatContributionDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Update the mutation type for createContributionMutation
  const createContributionMutation = useMutation<ContributionPaymentResponse, Error, ContributionFormValues, MutationContext>({
    mutationFn: async (data: ContributionFormValues) => {
      setIsProcessingPayment(true);
      try {
        // Create contribution
        const contribution = await createContribution(
          chamaId,
          parseFloat(data.amount)
        );
        
        // Immediately pay the contribution
        const result = await payContribution(contribution.id);
        return result;
      } finally {
        setIsProcessingPayment(false);
      }
    },
    onMutate: async (newContribution) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`/api/chamas/${chamaId}/contributions`] });

      // Snapshot the previous value
      const previousContributions = queryClient.getQueryData<ContributionsResponse>([`/api/chamas/${chamaId}/contributions`]);

      // Optimistically update to the new value
      if (previousContributions) {
        queryClient.setQueryData<ContributionsResponse>([`/api/chamas/${chamaId}/contributions`], old => {
          const optimisticContribution: EnrichedContribution = {
            id: Math.random(), // temporary ID
            chamaId,
            userId: (window as any).userId, // assuming you have the user ID available
            amount: parseFloat(newContribution.amount),
            status: "pending",
            dueDate: new Date(),
            paidAt: null,
            createdAt: new Date(),
            member: null // will be populated on server response
          };
          return {
            contributions: [...(old?.contributions || []), optimisticContribution]
          };
        });
      }

      return { previousContributions };
    },
    onError: (err, newContribution, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousContributions) {
        queryClient.setQueryData([`/api/chamas/${chamaId}/contributions`], context.previousContributions);
      }
      
      toast({
        title: "Failed to process contribution",
        description: err instanceof Error ? err.message : "Failed to process contribution",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/contributions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/wallets/user`] });
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/wallet`] });
      
      setOpenNewContributionDialog(false);
      form.reset();
    }
  });

  const onNewContributionSubmit = (data: ContributionFormValues) => {
    createContributionMutation.mutate(data);
  };

  return (
    <ChamaLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContributions}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalAmount)}
              </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidContributions}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(paidAmount)}
              </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingContributions}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(pendingAmount)}
              </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueContributions}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(overdueAmount)}
              </p>
          </CardContent>
        </Card>
      </div>
      
        {/* Contributions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contributions</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => setOpenNewContributionDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Contribution
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search contributions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {sortedContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={contribution.member?.profilePic} />
                      <AvatarFallback>
                        {contribution.member?.fullName
                          ? getInitials(contribution.member.fullName)
                          : "?"}
                      </AvatarFallback>
                      </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {contribution.member?.fullName || "Unknown Member"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatContributionDate(contribution.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(contribution.amount)}
                      </p>
                      <Badge className={getStatusBadgeStyles(contribution.status)}>
                        {contribution.status}
                      </Badge>
                    </div>
                    {contribution.status === "pending" && (
                        <Button 
                        variant="outline"
                          size="sm"
                        onClick={() => handlePayContribution(contribution.id)}
                        disabled={isProcessingPayment}
                        >
                          {isProcessingPayment ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                              <CreditCard className="h-4 w-4" />
                          )}
                        <span className="ml-2">Pay</span>
                        </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
        </CardContent>
        </Card>

        {/* New Contribution Dialog */}
        <Dialog open={openNewContributionDialog} onOpenChange={setOpenNewContributionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Contribution</DialogTitle>
              <DialogDescription>
                Add a new contribution to the chama. This will be marked as pending until paid.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onNewContributionSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter amount"
                          disabled={createContributionMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createContributionMutation.isPending}
                  >
                    {createContributionMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Create Contribution
            </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
          </div>
    </ChamaLayout>
  );
}
