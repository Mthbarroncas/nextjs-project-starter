package com.chat.realtime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

/**
 * Real-time Chat Application
 * 
 * A scalable chat application with WebSocket support, message queuing,
 * user presence, and file sharing capabilities.
 * 
 * Features:
 * - Real-time messaging with WebSocket
 * - User presence and status tracking
 * - File sharing and media support
 * - Message history and search
 * - Group chats and private messaging
 * - Message encryption and security
 * - Push notifications
 * - Scalable architecture with Redis and RabbitMQ
 * 
 * @author Development Team
 * @version 1.0
 */
@SpringBootApplication
@EnableWebSocket
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableTransactionManagement
public class ChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatApplication.class, args);
        System.out.println("🚀 Real-time Chat Application Started!");
        System.out.println("💬 WebSocket Endpoint: ws://localhost:8080/ws/chat");
        System.out.println("📱 Web Interface: http://localhost:8080");
        System.out.println("📊 Admin Dashboard: http://localhost:8080/admin");
        System.out.println("📖 API Documentation: http://localhost:8080/swagger-ui.html");
    }
}
