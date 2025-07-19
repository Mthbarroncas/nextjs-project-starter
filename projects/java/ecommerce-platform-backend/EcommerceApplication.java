package com.ecommerce.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * E-commerce Platform Backend Application
 * 
 * A comprehensive e-commerce backend with payment processing, 
 * inventory management, and real-time analytics.
 * 
 * Features:
 * - Product catalog management
 * - Order processing with payment integration
 * - Inventory tracking with real-time updates
 * - User authentication and authorization
 * - Analytics and reporting
 * - Caching for performance optimization
 * - Async processing for heavy operations
 * 
 * @author Development Team
 * @version 1.0
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableTransactionManagement
public class EcommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
        System.out.println("🚀 E-commerce Platform Backend Started Successfully!");
        System.out.println("📊 Analytics Dashboard: http://localhost:8080/analytics");
        System.out.println("🛒 API Documentation: http://localhost:8080/swagger-ui.html");
    }
}
