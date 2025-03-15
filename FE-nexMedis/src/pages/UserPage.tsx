import { useState, useEffect } from "react";
import axios from "../configs/axiosInstance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, User, DollarSign, ShoppingBag } from "lucide-react";

// Define types for our data
interface TopCustomer {
  customer_id: number;
  username: string;
  email: string;
  order_count: number;
  total_spent: number;
}

interface TopCustomersResponse {
  message: string;
  period: string;
  customers: TopCustomer[];
}

export default function UserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("1 month");
  const [customers, setCustomers] = useState<TopCustomer[]>([]);

  // Available time periods
  const periods = [
    "7 days",
    "14 days",
    "1 month",
    "3 months",
    "6 months",
    "1 year",
  ];

  useEffect(() => {
    const fetchTopCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<TopCustomersResponse>(
          `/api/user/toptransactions?period=${encodeURIComponent(period)}`
        );
        setCustomers(response.data.customers);
      } catch (err) {
        console.error("Error fetching top customers:", err);
        setError("Failed to load top customers data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCustomers();
  }, [period]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Top Customers</h1>
          <p className="text-muted-foreground mt-1">
            View your highest spending customers over time
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p} value={p}>
                  Last {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <User className="mr-2 h-5 w-5 text-muted-foreground" />
                  {customers.length}
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-5 w-5 text-muted-foreground" />
                  {customers.reduce(
                    (acc, customer) => acc + customer.order_count,
                    0
                  )}
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                  {formatCurrency(
                    customers.reduce(
                      (acc, customer) => acc + customer.total_spent,
                      0
                    )
                  )}
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Spending</CardTitle>
          <CardDescription>
            Showing the top {customers.length} customers in the last {period}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer, index) => (
                  <TableRow key={customer.customer_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {index === 0 ? (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600 mr-2">
                            <ArrowUp className="h-3 w-3" />
                          </Badge>
                        ) : null}
                        #{index + 1}
                      </div>
                    </TableCell>
                    <TableCell>{customer.username}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell className="text-right">
                      {customer.order_count}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(customer.total_spent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No customers found for this time period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
