import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../configs/axiosInstance";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAxiosError } from "axios";

interface Product {
  id: number;
  nama_produk: string;
  harga: string;
  id_produk: string;
}

interface OrderDetail {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  Product: Product;
}

interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  payment_token: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface Transaction {
  id: number;
  user_id: number;
  total: number;
  status: string;
  order_date: string;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetail[];
  payment: Payment | null;
  User?: User;
}

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const navigate = useNavigate();

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Function to fetch all transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Transaction[]>("/api/transactions");
      setTransactions(response.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch transaction details
  const fetchTransactionDetails = async (id: number) => {
    setDetailLoading(true);
    try {
      const response = await axios.get<Transaction>(`/api/transactions/${id}`);
      setSelectedTransaction(response.data);
    } catch (err) {
      let errorMessage = "Failed to load transaction details";

      if (isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error("Error", { description: errorMessage });
    } finally {
      setDetailLoading(false);
    }
  };

  // Function to get filtered transactions by status
  const getFilteredTransactions = () => {
    if (activeTab === "all") {
      return transactions;
    }
    return transactions.filter(
      (transaction) => transaction.status === activeTab
    );
  };

  // Format currency (IDR)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="flex items-center">
            <RefreshCw className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center">
            <Truck className="h-3 w-3 mr-1" />
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="default" className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "success":
        return (
          <Badge variant="default" className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "failure":
        return (
          <Badge variant="destructive" className="flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "challenge":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 flex items-center"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Challenge
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // If not logged in
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login", { replace: true });
      toast.error("Please login to view your transactions");
    }
  }, [navigate]);

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground mt-1">
            View and track your order history
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4 md:mt-0"
          onClick={fetchTransactions}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs for filtering */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{transaction.id}
                    </CardTitle>
                    <CardDescription>
                      Placed on {formatDate(transaction.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="mt-2 md:mt-0">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {transaction.orderDetails.length} items
                    </p>
                    <p className="font-medium">
                      Total: {formatCurrency(transaction.total)}
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <p className="text-sm text-muted-foreground mb-1">
                      Payment Status
                    </p>
                    {transaction.payment ? (
                      getPaymentStatusBadge(transaction.payment.payment_status)
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50">
                <Dialog key={transaction.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchTransactionDetails(transaction.id)}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Order Details</DialogTitle>
                      <DialogDescription>
                        Order #{selectedTransaction?.id}
                        {selectedTransaction?.createdAt &&
                          ` - ${formatDate(selectedTransaction.createdAt)}`}
                      </DialogDescription>
                    </DialogHeader>

                    {detailLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : selectedTransaction ? (
                      <div className="space-y-6">
                        {/* Order Status */}
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Status
                            </p>
                            <div className="mt-1">
                              {getStatusBadge(selectedTransaction.status)}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Payment
                            </p>
                            <div className="mt-1">
                              {selectedTransaction.payment ? (
                                getPaymentStatusBadge(
                                  selectedTransaction.payment.payment_status
                                )
                              ) : (
                                <Badge variant="outline">Not Paid</Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Order Date
                            </p>
                            <p className="mt-1 font-medium">
                              {formatDate(selectedTransaction.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Amount
                            </p>
                            <p className="mt-1 font-bold">
                              {formatCurrency(selectedTransaction.total)}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Order Items
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">
                                  Price
                                </TableHead>
                                <TableHead className="text-right">
                                  Quantity
                                </TableHead>
                                <TableHead className="text-right">
                                  Subtotal
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedTransaction.orderDetails.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {item.Product?.nama_produk}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        ID: {item.Product?.id_produk}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(item.price)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(item.price * item.quantity)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  className="text-right font-medium"
                                >
                                  Total
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                  {formatCurrency(selectedTransaction.total)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        {/* Payment Details */}
                        {selectedTransaction.payment && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Payment Details
                            </h4>
                            <Card>
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Payment Method
                                    </p>
                                    <p className="font-medium capitalize">
                                      {
                                        selectedTransaction.payment
                                          .payment_method
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Payment Status
                                    </p>
                                    <div>
                                      {getPaymentStatusBadge(
                                        selectedTransaction.payment
                                          .payment_status
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Payment Date
                                    </p>
                                    <p className="font-medium">
                                      {formatDate(
                                        selectedTransaction.payment.updatedAt
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Amount Paid
                                    </p>
                                    <p className="font-bold">
                                      {formatCurrency(
                                        selectedTransaction.payment.amount
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p>Transaction details not available.</p>
                      </div>
                    )}

                    <DialogFooter>
                      {selectedTransaction?.payment?.payment_status ===
                        "pending" && (
                        <Button
                          onClick={() => {
                            if (selectedTransaction?.payment?.payment_token) {
                              window.open(
                                `https://app.sandbox.midtrans.com/snap/v2/vtweb/${selectedTransaction.payment.payment_token}`,
                                "_blank"
                              );
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Complete Payment
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No transactions found</h3>
          <p className="mt-2 text-muted-foreground">
            You haven't made any purchases yet
          </p>
          <Button className="mt-6" onClick={() => navigate("/products")}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
}
