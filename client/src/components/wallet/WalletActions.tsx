import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Send, Receipt, CreditCard, ChevronsUpDown } from 'lucide-react';

interface WalletActionsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  onTransfer: () => void;
}

const WalletActions: React.FC<WalletActionsProps> = ({ 
  onDeposit, 
  onWithdraw, 
  onTransfer 
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 border-dashed"
            onClick={onDeposit}
          >
            <ArrowDown className="h-6 w-6 mb-2 text-success" />
            <span>Deposit</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 border-dashed"
            onClick={onWithdraw}
          >
            <ArrowUp className="h-6 w-6 mb-2 text-destructive" />
            <span>Withdraw</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 border-dashed"
            onClick={onTransfer}
          >
            <Send className="h-6 w-6 mb-2 text-primary" />
            <span>Transfer</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 border-dashed"
          >
            <Receipt className="h-6 w-6 mb-2 text-neutral-500" />
            <span>Statement</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button variant="secondary" className="flex items-center justify-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>Link Mobile Money</span>
          </Button>
          
          <Button variant="secondary" className="flex items-center justify-center">
            <ChevronsUpDown className="h-4 w-4 mr-2" />
            <span>Transaction Limits</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletActions;
