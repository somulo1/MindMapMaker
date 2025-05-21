import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Search, 
  MessageSquare,
  Users,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Eye
} from "lucide-react";

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch messages data
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['/api/admin/messages'],
  });

  const messages = messagesData?.messages || [];

  // Filter messages based on search term
  const filteredMessages = messages.filter((message: any) => 
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.receiver.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Message Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Message Management</h2>
          <p className="text-muted-foreground">Monitor and manage user messages</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages Overview</CardTitle>
          <CardDescription>View and manage all messages in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMessages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message: any) => (
                  <TableRow key={message.id}>
                    <TableCell>{message.sender.fullName}</TableCell>
                    <TableCell>{message.receiver.fullName}</TableCell>
                    <TableCell className="max-w-xs truncate">{message.content}</TableCell>
                    <TableCell>
                      <Badge variant={message.type === 'chama' ? 'secondary' : 'default'}>
                        {message.type === 'chama' ? 'Chama' : 'Direct'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        message.status === 'delivered' ? 'default' :
                        message.status === 'read' ? 'success' :
                        'destructive'
                      }>
                        {message.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(message.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">No messages found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 