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
  ShoppingBag,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";

export default function AdminMarketplace() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch marketplace items data
  const { data: marketplaceData, isLoading } = useQuery({
    queryKey: ['/api/admin/marketplace'],
  });

  const items = marketplaceData?.items || [];

  // Filter items based on search term
  const filteredItems = items.filter((item: any) => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.seller.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Marketplace Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Marketplace Management</h2>
          <p className="text-muted-foreground">Monitor and manage marketplace listings</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketplace Listings</CardTitle>
          <CardDescription>View and manage all items listed in the marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listed At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.seller.fullName}</TableCell>
                    <TableCell>KES {item.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'active' ? 'success' :
                        item.status === 'pending' ? 'warning' :
                        'destructive'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">No marketplace listings found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 