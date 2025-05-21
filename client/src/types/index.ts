export interface Meeting {
  id: number;
  chamaId: number;
  title: string;
  description?: string;
  scheduledFor: string;
  location?: string;
  agenda?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  minutes?: {
    content: string;
    fileUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
} 