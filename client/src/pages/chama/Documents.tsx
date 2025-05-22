import { useState, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ChamaLayout from "@/components/layout/ChamaLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, MoreVertical, Download, Trash2, File, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadChamaDocument, getChamaDocuments, downloadChamaDocument, deleteChamaDocument, ChamaDocument } from "@/services/api";

interface UploadFormData {
  file: File | null;
  category: string;
  description?: string;
}

// Predefined document categories
const DOCUMENT_CATEGORIES = {
  legal: "Legal Documents",
  financial: "Financial Reports",
  minutes: "Meeting Minutes",
  constitution: "Constitution",
  policies: "Policies & Guidelines",
  contracts: "Contracts & Agreements",
  other: "Other Documents"
} as const;

type DocumentCategory = keyof typeof DOCUMENT_CATEGORIES;

export default function ChamaDocuments() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id || '');
  const isValidChamaId = !isNaN(chamaId) && chamaId > 0;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadData, setUploadData] = useState<UploadFormData>({
    file: null,
    category: "",
    description: ""
  });

  // Fetch documents
  const { data: documents = [], isLoading, error } = useQuery<ChamaDocument[]>({
    queryKey: ["chamaDocuments", chamaId],
    queryFn: async () => {
      if (!isValidChamaId) {
        throw new Error("Invalid Chama ID");
      }
      try {
        const response = await getChamaDocuments(chamaId);
        return response;
      } catch (error) {
        // Enhanced error logging
        console.error('Error loading documents:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
        });

        // Handle specific error cases
        if (error instanceof Response && error.status === 401) {
          throw new Error("Please log in to view documents");
        } else if (error instanceof Response && error.status === 403) {
          throw new Error("You don't have permission to view these documents");
        }
        
        throw error;
      }
    },
    enabled: true,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && 
         (error.message.includes("log in") || error.message.includes("permission"))) {
        return false;
      }
      return failureCount < 1;
    }
  });

  // All state hooks must be declared before any conditional returns
  const [errorState, setErrorState] = useState<Error | null>(error instanceof Error ? error : null);

  // Render error state if present
  if (errorState || error) {
    const errorMessage = ((errorState || error) instanceof Error 
      ? (errorState || error)?.message || "Unknown error"
      : "Unknown error");
    const isAuthError = typeof errorMessage === 'string' && 
      (errorMessage.includes("log in") || errorMessage.includes("permission"));

    return (
      <ChamaLayout>
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Documents</h2>
          <p className="text-gray-600 mb-4">
            {errorMessage}
          </p>
          {!isAuthError && (
            <Button 
              onClick={() => {
                setErrorState(null);
                queryClient.invalidateQueries({ queryKey: ["chamaDocuments", chamaId] });
              }}
            >
              Try Again
            </Button>
          )}
        </div>
      </ChamaLayout>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <ChamaLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ChamaLayout>
    );
  }
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      if (!data.file) throw new Error("No file selected");
      
      // Validate file type based on category
      const fileExtension = data.file.name.split('.').pop()?.toLowerCase() || '';
      const isValidFileType = validateFileType(fileExtension, data.category);
      
      if (!isValidFileType) {
        throw new Error(`Invalid file type for ${data.category} category`);
      }
      
      return uploadChamaDocument(chamaId, data.file, {
        category: data.category,
        description: data.description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chamaDocuments", chamaId] });
      toast({
        title: "Document uploaded",
        description: "The document has been uploaded successfully."
      });
      setIsUploadDialogOpen(false);
      setUploadData({ file: null, category: "", description: "" });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive"
      });
    }
  });

  // Validate file type based on category
  const validateFileType = (extension: string, category: string): boolean => {
    const allowedTypes: Record<string, string[]> = {
      legal: ['pdf', 'doc', 'docx'],
      financial: ['pdf', 'xls', 'xlsx', 'csv'],
      minutes: ['pdf', 'doc', 'docx'],
      constitution: ['pdf', 'doc', 'docx'],
      policies: ['pdf', 'doc', 'docx'],
      contracts: ['pdf', 'doc', 'docx'],
      other: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt']
    };

    return allowedTypes[category]?.includes(extension) || false;
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: number) => deleteChamaDocument(chamaId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chamaDocuments", chamaId] });
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive"
      });
    }
  });

  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate(uploadData);
  };

  // Handle file download
  const handleDownload = async (document: ChamaDocument) => {
    try {
      const blob = await downloadChamaDocument(chamaId, document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download document",
        variant: "destructive"
      });
    }
  };

  // Filter documents based on category and search
  const filterDocuments = (docs: ChamaDocument[], category: string) => {
    let filtered = docs;
    
    // Filter by category
    if (category !== "all") {
      filtered = docs.filter(doc => doc.category.toLowerCase() === category.toLowerCase());
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  return (
    <ChamaLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Documents</h2>
          <p className="text-muted-foreground">Manage important chama documents and files</p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Upload a document to share with chama members.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFileUpload}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={uploadData.category}
                    onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOCUMENT_CATEGORIES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadData.category && (
                      <>Allowed file types: {getAllowedFileTypes(uploadData.category)}</>
                    )}
                  </p>
                </div>

                <div>
                  <Label htmlFor="file">File</Label>
                  <Input 
                    id="file"
                    type="file"
                    className="mt-1"
                    accept={getAcceptedFileTypes(uploadData.category)}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setUploadData(prev => ({ ...prev, file: file || null }));
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description"
                    placeholder="Brief description of the document"
                    className="mt-1"
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={uploadMutation.isPending || !uploadData.file || !uploadData.category}
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center border-b mb-4 pb-2">
              <TabsList>
                <TabsTrigger value="all">All Documents</TabsTrigger>
                {Object.entries(DOCUMENT_CATEGORIES).map(([value, label]) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Input 
                placeholder="Search documents..." 
                className="max-w-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <TabsContent value="all">
              <DocumentTable 
                documents={filterDocuments(documents, "all")}
                onDownload={handleDownload}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            </TabsContent>
            
            {Object.keys(DOCUMENT_CATEGORIES).map((category) => (
              <TabsContent key={category} value={category}>
                <DocumentTable 
                  documents={filterDocuments(documents, category)}
                  onDownload={handleDownload}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
            </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </ChamaLayout>
  );
}

interface DocumentTableProps {
  documents: ChamaDocument[];
  onDownload: (document: ChamaDocument) => void;
  onDelete: (documentId: number) => void;
}

function DocumentTable({ documents, onDownload, onDelete }: DocumentTableProps) {
  // Get file icon based on type
  const getFileIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-6 w-6 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileText className="h-6 w-6 text-green-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Size</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {documents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No documents found
            </TableCell>
          </TableRow>
        ) : (
          documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                  {getFileIcon(doc.fileType)}
                  {doc.name}
                  </div>
                </TableCell>
              <TableCell>{doc.category}</TableCell>
              <TableCell>{doc.uploadedBy}</TableCell>
              <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
              <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDownload(doc)}>
                      <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(doc.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
  );
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Helper functions for file types
function getAllowedFileTypes(category: string): string {
  const typeMap: Record<string, string> = {
    legal: 'PDF, DOC, DOCX',
    financial: 'PDF, XLS, XLSX, CSV',
    minutes: 'PDF, DOC, DOCX',
    constitution: 'PDF, DOC, DOCX',
    policies: 'PDF, DOC, DOCX',
    contracts: 'PDF, DOC, DOCX',
    other: 'PDF, DOC, DOCX, XLS, XLSX, CSV, TXT'
  };
  return typeMap[category] || '';
}

function getAcceptedFileTypes(category: string): string {
  const typeMap: Record<string, string> = {
    legal: '.pdf,.doc,.docx',
    financial: '.pdf,.xls,.xlsx,.csv',
    minutes: '.pdf,.doc,.docx',
    constitution: '.pdf,.doc,.docx',
    policies: '.pdf,.doc,.docx',
    contracts: '.pdf,.doc,.docx',
    other: '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt'
  };
  return typeMap[category] || '';
}