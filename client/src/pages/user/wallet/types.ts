import * as z from "zod";

// Transaction Schema
const TransactionSchema = z.object({
    amount: z.coerce.number().positive({message: "Amount must be greater than 0"}),
    description: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
export {TransactionSchema};
