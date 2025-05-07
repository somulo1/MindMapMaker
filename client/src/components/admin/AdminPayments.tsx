import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

async function fetchPayments() {
  const response = await fetch('/api/admin/payments');
  if (!response.ok) throw new Error('Failed to fetch payments');
  return response.json();
}

const AdminPayments: React.FC = () => {
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: fetchPayments
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive p-4">
        Error loading payments: {error.message}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.data?.map((payment: any) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono">{payment.id}</TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell>{formatDate(payment.created)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminPayments;