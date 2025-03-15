import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../configs/axiosInstance";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { isAxiosError } from "axios";

interface Product {
  id: number;
  nama_produk: string;
  harga: string;
  id_produk: string;
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
  subtotal: number;
}

interface CartResponse {
  items: CartItem[];
  total: number;
  count: number;
}

export default function CartPage() {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
  const [processingCheckout, setProcessingCheckout] = useState<boolean>(false);
  const navigate = useNavigate();

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Function to fetch cart items
  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<CartResponse>("/api/carts");
      setCartData(response.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to update cart item quantity
  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;

    setUpdatingItem(id);
    try {
      await axios.put(`/api/carts/${id}`, { quantity });
      fetchCartItems(); // Refresh cart after update
      toast.success("Cart updated");
    } catch (err: unknown) {
      let errorMessage = "Failed to update item";

      if (isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }

      toast.error("Error", { description: errorMessage });
    } finally {
      setUpdatingItem(null);
    }
  };

  // Function to remove item from cart
  const removeItem = async (id: number) => {
    setUpdatingItem(id);
    try {
      await axios.delete(`/api/carts/${id}`);
      fetchCartItems(); // Refresh cart after deletion
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("Error removing item");
    } finally {
      setUpdatingItem(null);
    }
  };

  // Function to clear entire cart
  const clearCart = async () => {
    setLoading(true);
    try {
      await axios.delete("/api/carts");
      setCartData({ items: [], total: 0, count: 0 });
      toast.success("Cart cleared");
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("Error clearing cart");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle checkout
  const handleCheckout = async () => {
    setProcessingCheckout(true);
    try {
      const response = await axios.post("/api/transactions");

      toast.success("Order placed successfully!");

      // Redirect to success page or show payment info
      if (response.data.payment && response.data.payment.redirect_url) {
        // Option 1: Redirect to Midtrans payment page
        window.location.href = response.data.payment.redirect_url;

        // Option 2: Show success and navigate to transactions
        // setTimeout(() => {
        //   navigate("/transactions");
        // }, 1500);
      }
    } catch (err: Error | unknown) {
      let errorMessage = "Checkout failed. Please try again.";

      if (isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }

      toast.error("Error", { description: errorMessage });
    } finally {
      setProcessingCheckout(false);
    }
  };

  // Format currency (IDR)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // If not logged in
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login", { replace: true });
      toast.error("Please login to view your cart");
    }
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">
            Review and modify your selected products
          </p>
        </div>

        {!loading && cartData && cartData.count > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-4 md:mt-0">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Your Cart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all items from your shopping cart. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearCart}>
                  Clear Cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      ) : cartData && cartData.items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Items ({cartData.count})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartData.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{item.product.nama_produk}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {item.product.id_produk}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(item.product.harga))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              disabled={
                                updatingItem === item.id || item.quantity <= 1
                              }
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              disabled={updatingItem === item.id}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            disabled={updatingItem === item.id}
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(cartData.total)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(cartData.total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={processingCheckout}
                  onClick={handleCheckout}
                >
                  {processingCheckout ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
          <p className="mt-2 text-muted-foreground">
            Start shopping to add items to your cart
          </p>
          <Button className="mt-6" onClick={() => navigate("/products")}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
}
