import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import * as z from "zod";
import {TransactionSchema} from "./types";
import UserAutocompleteInput, {User} from "@/components/ui/UserAutocompleteInput.tsx";
import {UseFormReturn} from "react-hook-form";

// Re-use the schema you already have
export type DepositFormValues = z.infer<typeof TransactionSchema>;
export type WithdrawFormValues = z.infer<typeof TransactionSchema>;
export type TransferFormValues = DepositFormValues & { receiverId: string };

export type DepositFormReturn = UseFormReturn<DepositFormValues>;
export type WithdrawFormReturn = UseFormReturn<WithdrawFormValues>;
export type TransferFormReturn = UseFormReturn<TransferFormValues>;

// const depositForm = useForm<z.infer<typeof TransactionSchema>>({
//     resolver: zodResolver(TransactionSchema),
//     defaultValues: {amount: 0, description: ""},
// });
//
// const withdrawForm = useForm<z.infer<typeof TransactionSchema>>({
//     resolver: zodResolver(TransactionSchema),
//     defaultValues: {amount: 0, description: ""},
// });
//
// const transferForm = useForm<z.infer<typeof TransactionSchema> & { receiverId: string }>({
//     resolver: zodResolver(TransactionSchema.extend({
//         // receiverId: z.coerce.number().positive({message: "Recipient ID is required"}),
//         receiverId: z.coerce.string(),
//     })),
//     defaultValues: {amount: 0, description: "", receiverId: ""},
// });

export type DepositDialogProps = {
    isDepositOpen: boolean;
    setIsDepositOpen: (bool: boolean) => void;
    depositForm: DepositFormReturn;
    onDepositSubmit: (value: z.infer<typeof TransactionSchema>) => Promise<void>;
};

function DepositDialog({
                           isDepositOpen,
                           setIsDepositOpen,
                           depositForm,
                           onDepositSubmit,
                       }: DepositDialogProps) {
    return (
        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>
                        Add funds to your wallet. This simulates an M-Pesa deposit.
                    </DialogDescription>
                </DialogHeader>

                <Form {...depositForm}>
                    <form onSubmit={depositForm.handleSubmit(onDepositSubmit)} className="space-y-4">
                        <FormField
                            control={depositForm.control}
                            name="amount"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Amount (KES)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" step="any" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={depositForm.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Savings deposit" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={depositForm.formState.isSubmitting}>
                                {depositForm.formState.isSubmitting ? "Processing..." : "Deposit"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

    );
}

export type WithdrawDialogProps = {
    isWithdrawOpen: boolean;
    setIsWithdrawOpen: (bool: boolean) => void;
    withdrawForm: WithdrawFormReturn;
    onWithdrawSubmit: (value: z.infer<typeof TransactionSchema>) => Promise<void>;
}

function WithdrawDialog({
                            isWithdrawOpen,
                            setIsWithdrawOpen,
                            withdrawForm,
                            onWithdrawSubmit,
                        }: WithdrawDialogProps) {
    return (
        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                        Withdraw funds from your wallet. This simulates an M-Pesa withdrawal.
                    </DialogDescription>
                </DialogHeader>

                <Form {...withdrawForm}>
                    <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
                        <FormField
                            control={withdrawForm.control}
                            name="amount"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Amount (KES)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" step="any" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={withdrawForm.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Personal expenses" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={withdrawForm.formState.isSubmitting}>
                                {withdrawForm.formState.isSubmitting ? "Processing..." : "Withdraw"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export type TransferDialogProps = {
    isTransferOpen: boolean;
    setIsTransferOpen: (bool: boolean) => void;
    transferForm: TransferFormReturn;
    onTransferSubmit: (values: z.infer<typeof TransactionSchema>
        & { receiverId: string }) => Promise<void>;
    fetchUsers: (email: string) => Promise<User[]>;
}

function TransferDialog({
                            isTransferOpen,
                            setIsTransferOpen,
                            transferForm,
                            onTransferSubmit,
                            fetchUsers
                        }: TransferDialogProps) {
    return (
        <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transfer Funds</DialogTitle>
                    <DialogDescription>
                        Send money to another user
                    </DialogDescription>
                </DialogHeader>

                <Form {...transferForm}>
                    <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-4">
                        <FormField
                            control={transferForm.control}
                            name="amount"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Amount (KES)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" step="any" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={transferForm.control}
                            name="receiverId"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Recipient Username/Email</FormLabel>
                                    <FormControl>
                                        {/*<Input type="number" min="1" {...field} />*/}
                                        <UserAutocompleteInput
                                            type="text"
                                            placeholder="username/email"
                                            fetchUsers={fetchUsers}
                                            // TODO: add functionality
                                            // onUserSelect={(user) => {
                                            //     setSelectedUser(user);
                                            //     console.log('Selected user:', user);
                                            // }}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the username/email of the user you want to send funds to.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={transferForm.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Payment for services" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={transferForm.formState.isSubmitting}>
                                {transferForm.formState.isSubmitting ? "Processing..." : "Transfer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export {DepositDialog, WithdrawDialog, TransferDialog};
