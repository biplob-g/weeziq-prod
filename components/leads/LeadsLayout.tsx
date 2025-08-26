"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Search,
  Eye,
  Mail,
  Phone,
  User,
  Calendar,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import { onGetDomainChatRooms } from "@/actions/conversation";
import { toast } from "sonner";
import ExportModal from "./ExportModal";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
  createdAt: Date;
  chatRoomId: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  messageCount: number;
}

interface Domain {
  name: string;
  id: string;
  icon: string;
}

interface LeadsLayoutProps {
  domains?: Domain[];
}

const LeadsLayout = ({ domains }: LeadsLayoutProps) => {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "createdAt">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Check Google Sheets connection status
  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const { onCheckGoogleIntegration } = await import(
        "@/actions/integration"
      );
      const result = await onCheckGoogleIntegration();
      setIsGoogleConnected(result.isConnected);
    } catch (error) {
      console.error("Error checking Google connection:", error);
      setIsGoogleConnected(false);
    }
  };

  // Fetch leads data
  useEffect(() => {
    const fetchLeads = async () => {
      if (!domains || domains.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const domainId = selectedDomain || domains[0].id;
        const domainData = await onGetDomainChatRooms(domainId);

        if (domainData?.customer) {
          const leadsData: Lead[] = domainData.customer
            .filter(
              (customer) => customer.chatRoom && customer.chatRoom.length > 0
            )
            .map((customer) => {
              const chatRoom = customer.chatRoom[0];
              const messages = chatRoom.message || [];
              const lastMessage = messages[0];

              return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                countryCode: customer.countryCode,
                createdAt: chatRoom.createdAt,
                chatRoomId: chatRoom.id,
                lastMessage: lastMessage?.message,
                lastMessageDate: lastMessage?.createdAt,
                messageCount: messages.length,
              };
            });

          setLeads(leadsData);
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
        toast.error("Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [domains, selectedDomain]);

  // Filter and sort leads
  useEffect(() => {
    let filtered = [...leads];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      if (sortField === "name") {
        aValue = a.name || "";
        bValue = b.name || "";
      } else {
        aValue = a.createdAt;
        bValue = b.createdAt;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [leads, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (field: "name" | "createdAt") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle view conversation
  const handleViewConversation = (chatRoomId: string) => {
    router.push(`/conversation?room=${chatRoomId}`);
  };

  // Handle export to Google Sheets
  const handleExportToGoogleSheets = () => {
    if (!isGoogleConnected) {
      toast.error("Please connect Google Sheets first");
      router.push("/integration");
      return;
    }

    setIsExportModalOpen(true);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4 lg:space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 py-4">
            {/* Domain Selector */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Domain</label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains?.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Stats and Export */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                Total Leads: {leads.length}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Showing: {filteredLeads.length}
              </Badge>
            </div>

            <Button
              onClick={handleExportToGoogleSheets}
              disabled={!isGoogleConnected || filteredLeads.length === 0}
              className="flex items-center gap-2"
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export to Google Sheets
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="flex-1">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === "name" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {sortField === "createdAt" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLeads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchQuery
                        ? "No leads found matching your search."
                        : "No leads found for this domain."}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        {lead.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {lead.name || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {lead.email || "No email"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {lead.countryCode} {lead.phone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No phone
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <div>{formatDate(lead.createdAt)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(lead.createdAt)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="truncate max-w-32">
                            {lead.lastMessage || "No messages"}
                          </div>
                          {lead.lastMessageDate && (
                            <div className="text-xs text-muted-foreground">
                              {formatDate(lead.lastMessageDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleViewConversation(lead.chatRoomId)
                          }
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredLeads.length)} of{" "}
                {filteredLeads.length} leads
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        leads={currentLeads}
      />
    </div>
  );
};

export default LeadsLayout;
