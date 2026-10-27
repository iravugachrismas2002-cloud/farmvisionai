"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SupplierProfile = {
  id: string;
  businessName: string;
  description?: string;
  contactEmail?: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};

type MarketplaceProduct = {
  id: string;
  supplierProfileId: string;
  name: string;
  description?: string;
  price: number;
  category: "FEED" | "VETERINARY_MEDICINE" | "SEEDS" | "FERTILIZER" | "EQUIPMENT";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  stock: number;
  sku?: string;
  createdAt: string;
};

type CategoryBadge = {
  category: MarketplaceProduct["category"];
  label: string;
};

export default function MarketplacePage() {
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<MarketplaceProduct["category"] | null>(null);
  const [filterStatus, setFilterStatus] = useState<MarketplaceProduct["status"] | null>(null);

  // Category labels
  const categoryLabels: Record<MarketplaceProduct["category"], string> = {
    FEED: "Feed",
    VETERINARY_MEDICINE: "Veterinary Medicine",
    SEEDS: "Seeds",
    FERTILIZER: "Fertilizer",
    EQUIPMENT: "Equipment",
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          fetch("/api/suppliers", { credentials: "include" }),
          fetch("/api/products", { credentials: "include" }),
        ]);

        if (!suppliersRes.ok && cancelled === false) {
          if (suppliersRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load suppliers");
        }

        if (!productsRes.ok && cancelled === false) {
          if (productsRes.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to load products");
        }

        if (cancelled) return;

        const suppliersData = await suppliersRes.json();
        const productsData = await productsRes.json();

        if (cancelled) return;

        setSuppliers(suppliersData.suppliers ?? []);
        setProducts(productsData.products ?? []);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">MARKETPLACE</p>
          <h1>Marketplace</h1>
          <p>Loading marketplace data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
          <Link href="/login" className="primary-button">Back to Login</Link>
        </div>
      </main>
    );
  }

  // Get filtered products
  const filteredProducts = products.filter(
    (p) =>
      (!filterCategory || p.category === filterCategory) &&
      (!filterStatus || p.status === filterStatus)
  );

  // Compute stats from integrated data
  const totalProducts = products.length;
  const totalSuppliers = suppliers.length;
  const productsByCategory = {
    FEED: products.filter((p) => p.category === "FEED").length,
    VETERINARY_MEDICINE: products.filter((p) => p.category === "VETERINARY_MEDICINE")
      .length,
    SEEDS: products.filter((p) => p.category === "SEEDS").length,
    FERTILIZER: products.filter((p) => p.category === "FERTILIZER").length,
    EQUIPMENT: products.filter((p) => p.category === "EQUIPMENT").length,
  };
  const productsByStatus = {
    DRAFT: products.filter((p) => p.status === "DRAFT").length,
    PUBLISHED: products.filter((p) => p.status === "PUBLISHED").length,
    ARCHIVED: products.filter((p) => p.status === "ARCHIVED").length,
  };

  // Get unique categories and statuses for filter chips
  const uniqueCategories = [...new Set(products.map((p) => p.category))];
  const uniqueStatuses = [...new Set(products.map((p) => p.status))];

  return (
    <main className="auth-page">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FarmVision<span className="brand-ai"> AI</span></span>
        </Link>
        <div className="nav-actions">
          <Link className="primary-button" href="/">
            <span className="brand-mark" aria-hidden="true">F</span>
            <span>FarmVision AI</span>
          </Link>
          <Link className="nav-login" href="/api/auth/logout">Sign out</Link>
        </div>
      </nav>

      <section className="dashboard-page">
        <div className="dashboard-header">
          <h1>Marketplace</h1>
          <p className="eyebrow">Supply & Equipment Hub</p>
        </div>

        <div className="summary-section">
          <div className="integrated-stats">
            <div className="stat-card">
              <strong>{totalProducts}</strong>
              <p>Products</p>
            </div>
            <div className="stat-card">
              <strong>{totalSuppliers}</strong>
              <p>Suppliers</p>
            </div>
            <div className="stat-card">
              <strong>{productsByStatus.PUBLISHED}</strong>
              <p>Published</p>
            </div>
            <div className="stat-card">
              <strong>{productsByStatus.DRAFT}</strong>
              <p>Draft</p>
            </div>
          </div>

          <div className="filter-chips">
            <h3>Filter</h3>
            <div className="chip-group">
              {/* All categories chip */}
              <button
                className={`chip ${!filterCategory && !filterStatus ? "chip-active" : ""}`}
                onClick={() => setFilterCategory(null)}
              >
                All
              </button>

              {/* Category chips */}
              {uniqueCategories.map((category) => (
                <button
                  key={category}
                  className={`chip ${filterCategory === category ? "chip-active" : ""}`}
                  onClick={() =>
                    setFilterCategory(category as MarketplaceProduct["category"])
                  }
                >
                  {categoryLabels[category]}
                </button>
              ))}

              {/* Status chips */}
              {uniqueStatuses.map((status) => (
                <button
                  key={status}
                  className={`chip ${filterStatus === status ? "chip-active" : ""}`}
                  onClick={() =>
                    setFilterStatus(status as MarketplaceProduct["status"])
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your filters.</p>
              <p>Be the first to publish a product in the marketplace!</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-header">
                    <strong>{product.name}</strong>
                    <span className="product-category">
                      {categoryLabels[product.category]}
                    </span>
                  </div>
                  <div className="product-meta">
                    <span className="product-price">₱{product.price.toFixed(2)}</span>
                    <span className="product-stock">
                      {product.stock} in stock
                    </span>
                  </div>
                  <div className="product-actions">
                    <span className="product-status-badge">
                      {product.status}
                    </span>
                    <Link
                      href={`/product/${product.id}`}
                      className="product-link"
                    >
                      View Details
                    </Link>
                  </div>
                  <div className="product-supplier">
                    From:{" "}
                    {suppliers
                      .find((s) => s.id === product.supplierProfileId)
                      ?.businessName ||
                    "Unknown supplier"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown section */}
        <div className="category-breakdown">
          <h3>Products by Category</h3>
          <div className="breakdown-grid">
            {Object.entries(productsByCategory).map(([category, count]) => (
              <div key={category} className="breakdown-item">
                <span className="category-label">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier stats section */}
        <div className="supplier-section">
          <h3>Suppliers <span className="badge">{totalSuppliers}</span></h3>
          {totalSuppliers === 0 ? (
            <p>No suppliers registered yet. Publish your first product to get started!</p>
          ) : (
            <div className="suppliers-grid">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="supplier-card">
                  <strong>{supplier.businessName}</strong>
                  <p>{supplier.contactEmail}</p>
                  <span className="supplier-status {supplier.status}">
                    {supplier.status}
                  </span>
                  <span className="supplier-product-count">
                    {products.filter((p) => p.supplierProfileId === supplier.id).length} product{"s"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="create-supplier-btn">
            <Link href="/supplier/create" className="primary-button-small">
              Create Supplier Profile
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}