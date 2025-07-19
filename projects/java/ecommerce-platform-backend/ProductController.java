package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.ProductDTO;
import com.ecommerce.platform.dto.ProductSearchCriteria;
import com.ecommerce.platform.model.Product;
import com.ecommerce.platform.service.ProductService;
import com.ecommerce.platform.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Product Management Controller
 * 
 * Handles all product-related operations including:
 * - Product CRUD operations
 * - Product search and filtering
 * - Inventory management
 * - Price management
 * - Product analytics
 */
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Product Management", description = "Product catalog and inventory operations")
@Validated
public class ProductController {

    private final ProductService productService;
    private final AnalyticsService analyticsService;

    /**
     * Get all products with pagination and filtering
     */
    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieve paginated list of products with optional filtering")
    @Cacheable(value = "products", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #criteria.hashCode()")
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @Parameter(description = "Pagination information") Pageable pageable,
            @Parameter(description = "Search criteria") ProductSearchCriteria criteria) {
        
        log.info("Fetching products with criteria: {}", criteria);
        
        Page<ProductDTO> products = productService.findAllProducts(pageable, criteria);
        
        // Track analytics asynchronously
        CompletableFuture.runAsync(() -> 
            analyticsService.trackProductListView(criteria, products.getTotalElements())
        );
        
        return ResponseEntity.ok(products);
    }

    /**
     * Get product by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve a specific product by its ID")
    @Cacheable(value = "product", key = "#id")
    public ResponseEntity<ProductDTO> getProductById(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id) {
        
        log.info("Fetching product with ID: {}", id);
        
        ProductDTO product = productService.findProductById(id);
        
        // Track product view analytics
        CompletableFuture.runAsync(() -> 
            analyticsService.trackProductView(id)
        );
        
        return ResponseEntity.ok(product);
    }

    /**
     * Create new product (Admin only)
     */
    @PostMapping
    @Operation(summary = "Create new product", description = "Create a new product in the catalog")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> createProduct(
            @Parameter(description = "Product information") @Valid @RequestBody ProductDTO productDTO) {
        
        log.info("Creating new product: {}", productDTO.getName());
        
        ProductDTO createdProduct = productService.createProduct(productDTO);
        
        // Track product creation analytics
        analyticsService.trackProductCreation(createdProduct.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    /**
     * Update existing product (Admin only)
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Update an existing product")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id,
            @Parameter(description = "Updated product information") @Valid @RequestBody ProductDTO productDTO) {
        
        log.info("Updating product with ID: {}", id);
        
        ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
        
        // Track product update analytics
        analyticsService.trackProductUpdate(id);
        
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * Delete product (Admin only)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product", description = "Delete a product from the catalog")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id) {
        
        log.info("Deleting product with ID: {}", id);
        
        productService.deleteProduct(id);
        
        // Track product deletion analytics
        analyticsService.trackProductDeletion(id);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * Search products by name or description
     */
    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Search products by name or description")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Pagination information") Pageable pageable) {
        
        log.info("Searching products with query: {}", query);
        
        Page<ProductDTO> products = productService.searchProducts(query, pageable);
        
        // Track search analytics
        CompletableFuture.runAsync(() -> 
            analyticsService.trackProductSearch(query, products.getTotalElements())
        );
        
        return ResponseEntity.ok(products);
    }

    /**
     * Get products by category
     */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category", description = "Retrieve products in a specific category")
    @Cacheable(value = "productsByCategory", key = "#categoryId + '-' + #pageable.pageNumber")
    public ResponseEntity<Page<ProductDTO>> getProductsByCategory(
            @Parameter(description = "Category ID") @PathVariable @Min(1) Long categoryId,
            @Parameter(description = "Pagination information") Pageable pageable) {
        
        log.info("Fetching products for category: {}", categoryId);
        
        Page<ProductDTO> products = productService.findProductsByCategory(categoryId, pageable);
        
        return ResponseEntity.ok(products);
    }

    /**
     * Update product inventory
     */
    @PatchMapping("/{id}/inventory")
    @Operation(summary = "Update inventory", description = "Update product inventory quantity")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INVENTORY_MANAGER')")
    public ResponseEntity<ProductDTO> updateInventory(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id,
            @Parameter(description = "New quantity") @RequestParam @Min(0) Integer quantity) {
        
        log.info("Updating inventory for product {}: new quantity = {}", id, quantity);
        
        ProductDTO updatedProduct = productService.updateInventory(id, quantity);
        
        // Track inventory update analytics
        analyticsService.trackInventoryUpdate(id, quantity);
        
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * Update product price
     */
    @PatchMapping("/{id}/price")
    @Operation(summary = "Update price", description = "Update product price")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRICING_MANAGER')")
    public ResponseEntity<ProductDTO> updatePrice(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id,
            @Parameter(description = "New price") @RequestParam @Min(0) BigDecimal price) {
        
        log.info("Updating price for product {}: new price = {}", id, price);
        
        ProductDTO updatedProduct = productService.updatePrice(id, price);
        
        // Track price update analytics
        analyticsService.trackPriceUpdate(id, price);
        
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * Get low stock products
     */
    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock products", description = "Retrieve products with low inventory")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INVENTORY_MANAGER')")
    public ResponseEntity<List<ProductDTO>> getLowStockProducts(
            @Parameter(description = "Threshold quantity") @RequestParam(defaultValue = "10") @Min(0) Integer threshold) {
        
        log.info("Fetching low stock products with threshold: {}", threshold);
        
        List<ProductDTO> lowStockProducts = productService.findLowStockProducts(threshold);
        
        return ResponseEntity.ok(lowStockProducts);
    }

    /**
     * Get featured products
     */
    @GetMapping("/featured")
    @Operation(summary = "Get featured products", description = "Retrieve featured products for homepage")
    @Cacheable(value = "featuredProducts", key = "'featured'")
    public ResponseEntity<List<ProductDTO>> getFeaturedProducts() {
        
        log.info("Fetching featured products");
        
        List<ProductDTO> featuredProducts = productService.findFeaturedProducts();
        
        return ResponseEntity.ok(featuredProducts);
    }

    /**
     * Get product recommendations
     */
    @GetMapping("/{id}/recommendations")
    @Operation(summary = "Get product recommendations", description = "Get recommended products based on the given product")
    public ResponseEntity<List<ProductDTO>> getProductRecommendations(
            @Parameter(description = "Product ID") @PathVariable @Min(1) Long id,
            @Parameter(description = "Number of recommendations") @RequestParam(defaultValue = "5") @Min(1) Integer limit) {
        
        log.info("Fetching recommendations for product: {}", id);
        
        List<ProductDTO> recommendations = productService.getRecommendations(id, limit);
        
        // Track recommendation view analytics
        CompletableFuture.runAsync(() -> 
            analyticsService.trackRecommendationView(id, recommendations.size())
        );
        
        return ResponseEntity.ok(recommendations);
    }

    /**
     * Bulk update products
     */
    @PatchMapping("/bulk-update")
    @Operation(summary = "Bulk update products", description = "Update multiple products at once")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDTO>> bulkUpdateProducts(
            @Parameter(description = "List of product updates") @Valid @RequestBody List<ProductDTO> products) {
        
        log.info("Bulk updating {} products", products.size());
        
        List<ProductDTO> updatedProducts = productService.bulkUpdateProducts(products);
        
        // Track bulk update analytics
        analyticsService.trackBulkProductUpdate(products.size());
        
        return ResponseEntity.ok(updatedProducts);
    }
}
