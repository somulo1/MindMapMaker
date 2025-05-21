import React, {useCallback, useEffect, useState} from 'react';
import {useMediaQuery} from '@/hooks/use-mobile';
import UserLayout from '@/components/layout/UserLayout';
import {useWallet} from '@/hooks/useWallet';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import WalletHeader from '@/components/wallet/WalletHeader';
import WalletActions from '@/components/wallet/WalletActions';
import TransactionHistoryList from '@/components/wallet/TransactionHistoryList';
import {useToast} from '@/hooks/use-toast';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import {User as AutocompleteUser} from "@/components/ui/UserAutocompleteInput";
import {fetchUser} from "@/sdk/api/auth/users";
import {DepositDialog, TransferDialog, WithdrawDialog} from "@/pages/user/wallet/Wallet";
import {TransactionSchema} from "@/pages/user/wallet/types";

// Transaction Schema
const transactionSchema = TransactionSchema;

const WalletPage: React.FC = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const {wallet, transactions, deposit, withdraw, transfer, transferByUsernameOrEmail, isLoading,} = useWallet();
    const {toast} = useToast();
    const [showBalance, setShowBalance] = useState(true);

    // Dialog states
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    /// Track `window.location.hash` for /#deposit, /#withdraw, /#transfer
    const updateFlags = useCallback(() => {
        const hash = window.location.hash.replace(/^#/, "");
        // "deposit" | "withdraw" | "transfer"
        setIsDepositOpen(hash === "deposit");
        setIsWithdrawOpen(hash === "withdraw");
        setIsTransferOpen(hash === "transfer");
    }, []);

    useEffect(() => {
        // run once on mount
        updateFlags();

        // keep listening for future changes
        window.addEventListener("hashchange", updateFlags);
        return () => window.removeEventListener("hashchange", updateFlags);
    }, [updateFlags]);

    /// Fetch user by username/email for autocompletion
    const fetchUsers = async (email: string): Promise<AutocompleteUser[]> => {
        const user = await fetchUser({email});
        if (user) {
            return [user as AutocompleteUser];
        }
        return [];
    };

    /// Forms
    const depositForm = useForm<z.infer<typeof transactionSchema>>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {amount: 0, description: ""},
    });

    const withdrawForm = useForm<z.infer<typeof transactionSchema>>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {amount: 0, description: ""},
    });

    const transferForm = useForm<z.infer<typeof transactionSchema> & { receiverId: string }>({
        resolver: zodResolver(transactionSchema.extend({
            // receiverId: z.coerce.number().positive({message: "Recipient ID is required"}),
            receiverId: z.coerce.string(),
        })),
        defaultValues: {amount: 0, description: "", receiverId: ""},
    });

    const toggleBalanceVisibility = () => {
        setShowBalance(prev => !prev);
    };

    // Handle deposit submit
    const onDepositSubmit = async (values: z.infer<typeof transactionSchema>) => {
        try {
            await deposit(values.amount, values.description);
            toast({
                title: "Deposit successful",
                description: `KES ${values.amount} has been added to your wallet.`,
            });
            setIsDepositOpen(false);
            depositForm.reset();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Deposit failed",
                description: error?.message || "An error occurred during the deposit.",
            });
        }
    };

    // Handle withdraw submit
    const onWithdrawSubmit = async (values: z.infer<typeof transactionSchema>) => {
        try {
            await withdraw(values.amount, values.description);
            toast({
                title: "Withdrawal successful",
                description: `KES ${values.amount} has been withdrawn from your wallet.`,
            });
            setIsWithdrawOpen(false);
            withdrawForm.reset();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Withdrawal failed",
                description: error?.message || "An error occurred during the withdrawal.",
            });
        }
    };

    // Handle transfer submit
    const onTransferSubmit = async (values: z.infer<typeof transactionSchema> & { receiverId: string }) => {
        try {
            await transferByUsernameOrEmail(values.amount, values.receiverId, values.description);
            toast({
                title: "Transfer successful",
                description: `KES ${values.amount} has been transferred.`,
            });
            setIsTransferOpen(false);
            transferForm.reset();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Transfer failed",
                description: error?.message || "An error occurred during the transfer.",
            });
        }
    };

    const content = (
        <div className={isMobile ? "p-4" : ""}>
            {/* Wallet Header */}
            <WalletHeader
                balance={wallet?.balance || 0}
                currency={wallet?.currency || 'KES'}
                showBalance={showBalance}
                onToggleVisibility={toggleBalanceVisibility}
            />

            {/* Quick Actions */}
            <WalletActions
                onDeposit={() => setIsDepositOpen(true)}
                onWithdraw={() => setIsWithdrawOpen(true)}
                onTransfer={() => setIsTransferOpen(true)}
            />

            {/* Transactions */}
            <Card className="mb-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="incoming">Incoming</TabsTrigger>
                            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <TransactionHistoryList transactions={transactions}/>
                        </TabsContent>

                        <TabsContent value="incoming">
                            <TransactionHistoryList
                                transactions={transactions.filter(t => 
                                    t.type === 'deposit' || 
                                    (t.type === 'transfer' && t.destinationWallet === wallet?.id && t.sourceWallet !== wallet?.id)
                                )}
                            />
                        </TabsContent>

                        <TabsContent value="outgoing">
                            <TransactionHistoryList
                                transactions={transactions.filter(t =>
                                    t.type === 'withdrawal' || 
                                    t.type === 'contribution' ||
                                    (t.type === 'transfer' && t.sourceWallet === wallet?.id && t.destinationWallet !== wallet?.id)
                                )}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Deposit */}
            <DepositDialog depositForm={depositForm}
                           isDepositOpen={isDepositOpen}
                           onDepositSubmit={onDepositSubmit}
                           setIsDepositOpen={setIsDepositOpen}
            />

            {/* Withdraw */}
            <WithdrawDialog withdrawForm={withdrawForm}
                            isWithdrawOpen={isWithdrawOpen}
                            onWithdrawSubmit={onWithdrawSubmit}
                            setIsWithdrawOpen={setIsWithdrawOpen}/>

            {/* Transfer */}
            <TransferDialog transferForm={transferForm}
                            isTransferOpen={isTransferOpen}
                            onTransferSubmit={onTransferSubmit}
                            setIsTransferOpen={setIsTransferOpen}
                            fetchUsers={fetchUsers}/>
        </div>
    );

    return (
        <UserLayout title="Wallet">
            <div className="max-w-7xl mx-auto">
                {content}
            </div>

            {/* Deposit */}
            <DepositDialog depositForm={depositForm}
                           isDepositOpen={isDepositOpen}
                           onDepositSubmit={onDepositSubmit}
                           setIsDepositOpen={setIsDepositOpen}
            />

            {/* Withdraw */}
            <WithdrawDialog withdrawForm={withdrawForm}
                            isWithdrawOpen={isWithdrawOpen}
                            onWithdrawSubmit={onWithdrawSubmit}
                            setIsWithdrawOpen={setIsWithdrawOpen}
            />

            {/* Transfer */}
            <TransferDialog transferForm={transferForm}
                            isTransferOpen={isTransferOpen}
                            onTransferSubmit={onTransferSubmit}
                            setIsTransferOpen={setIsTransferOpen}
                            fetchUsers={fetchUsers}
            />
        </UserLayout>
    );
};

export default WalletPage;
