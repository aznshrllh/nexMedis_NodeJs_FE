import { useState, useEffect } from "react";
import axios from "../configs/axiosInstance";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  PackagePlus,
  AlertCircle,
  Filter,
  SlidersHorizontal,
  Tag,
  Loader2,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { isAxiosError } from "axios";

// Define our product interface based on API response
interface Product {
  id: number;
  id_produk: string;
  nama_produk: string;
  harga: string;
  kategori_id: number;
  status_id: number;
  stok: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProductPage() {
  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State for product details and cart
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);

  // State for filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");

  // Category mapping
  const categories = {
    1: "Prescription",
    2: "Over-the-Counter",
    3: "Medical Equipment",
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Product[]>("/api/products");
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to search products
  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Product[]>(
        `/api/products?search=${encodeURIComponent(searchQuery)}`
      );
      setProducts(response.data);
    } catch (err) {
      console.error("Error searching products:", err);
      setError("Failed to search products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts();
  };

  // Function to open product detail dialog
  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
    setQuantity(1);
  };

  // Function to add product to cart
  const addToCart = async () => {
    if (!selectedProduct) return;

    if (!localStorage.getItem("accessToken")) {
      toast.error("Authentication required", {
        description: "Please login to add items to your cart",
      });
      return;
    }

    setAddingToCart(true);
    try {
      await axios.post("/api/carts", {
        productId: selectedProduct.id,
        quantity: quantity,
      });

      toast.success("Added to cart", {
        description: `${quantity} × ${selectedProduct.nama_produk} added to your cart.`,
      });

      setIsDialogOpen(false);

      // Refetch products to update stock info
      fetchProducts();
    } catch (err: unknown) {
      let errorMessage = "Failed to add item to cart";

      if (isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error("Error", { description: errorMessage });
    } finally {
      setAddingToCart(false);
    }
  };

  // Get filtered and sorted products
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.kategori_id === parseInt(categoryFilter)
      );
    }

    // Apply availability filter
    if (availabilityFilter === "in-stock") {
      filtered = filtered.filter((p) => p.stok > 0);
    } else if (availabilityFilter === "out-of-stock") {
      filtered = filtered.filter((p) => p.stok === 0);
    }

    // Apply sorting
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.nama_produk.localeCompare(b.nama_produk));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.nama_produk.localeCompare(a.nama_produk));
        break;
      case "price-asc":
        filtered.sort((a, b) => parseInt(a.harga) - parseInt(b.harga));
        break;
      case "price-desc":
        filtered.sort((a, b) => parseInt(b.harga) - parseInt(a.harga));
        break;
    }

    return filtered;
  };

  // Format currency (IDR)
  const formatCurrency = (price: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseInt(price));
  };

  const filteredProducts = getFilteredProducts();

  // Get current sort label
  const getSortLabel = () => {
    switch (sortBy) {
      case "name-asc":
        return "Name (A-Z)";
      case "name-desc":
        return "Name (Z-A)";
      case "price-asc":
        return "Price (Low-High)";
      case "price-desc":
        return "Price (High-Low)";
      default:
        return "Sort By";
    }
  };

  // Get current category label
  const getCategoryLabel = () => {
    if (categoryFilter === "all") return "All Categories";
    return categories[parseInt(categoryFilter) as keyof typeof categories];
  };

  // Get current availability label
  const getAvailabilityLabel = () => {
    switch (availabilityFilter) {
      case "in-stock":
        return "In Stock";
      case "out-of-stock":
        return "Out of Stock";
      default:
        return "All Products";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Browse our healthcare products and medical supplies
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex w-full items-center space-x-2 mb-6"
      >
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSearchQuery("");
                fetchProducts();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search
        </Button>
      </form>

      {/* Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category">
                  {getCategoryLabel()}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="1">Prescription</SelectItem>
              <SelectItem value="2">Over-the-Counter</SelectItem>
              <SelectItem value="3">Medical Equipment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={availabilityFilter}
            onValueChange={setAvailabilityFilter}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Availability">
                  {getAvailabilityLabel()}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort By">
                  {getSortLabel()}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-10" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                <div className="text-3xl font-bold text-muted-foreground">
                  {product.id_produk}
                </div>
              </div>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {product.nama_produk}
                  </CardTitle>
                </div>
                <CardDescription>
                  <Badge variant="outline" className="mr-2">
                    {categories[product.kategori_id as keyof typeof categories]}
                  </Badge>
                  {product.stok > 0 ? (
                    <Badge variant="secondary">{product.stok} in stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of stock</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">
                  {formatCurrency(product.harga)}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => openProductDetail(product)}
                >
                  Details
                </Button>
                <Button
                  disabled={product.stok === 0}
                  onClick={() => openProductDetail(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <PackagePlus className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No products found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Product Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.nama_produk}</DialogTitle>
            <DialogDescription>
              Product ID: {selectedProduct?.id_produk}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Category</div>
              <Badge variant="outline" className="mb-2">
                {selectedProduct?.kategori_id &&
                  categories[
                    selectedProduct.kategori_id as keyof typeof categories
                  ]}
              </Badge>

              <div className="text-sm font-medium mb-1 mt-3">Price</div>
              <div className="text-xl font-bold mb-2">
                {selectedProduct?.harga &&
                  formatCurrency(selectedProduct.harga)}
              </div>

              <div className="text-sm font-medium mb-1">Availability</div>
              {selectedProduct?.stok ? (
                <Badge variant="secondary">
                  {selectedProduct.stok} in stock
                </Badge>
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>

            <div>
              {selectedProduct?.stok ? (
                <>
                  <div className="text-sm font-medium mb-2">Quantity</div>
                  <div className="flex items-center mb-4">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={quantity >= selectedProduct.stok}
                      onClick={() =>
                        setQuantity(
                          Math.min(selectedProduct.stok, quantity + 1)
                        )
                      }
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Maximum: {selectedProduct.stok} units
                  </div>
                </>
              ) : (
                <div className="text-sm text-destructive mb-4">
                  This product is currently out of stock.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={addToCart}
              disabled={!selectedProduct?.stok || addingToCart}
            >
              {addingToCart ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
