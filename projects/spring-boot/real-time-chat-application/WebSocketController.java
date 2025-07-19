package com.chat.realtime.controller;

import com.chat.realtime.dto.ChatMessage;
import com.chat.realtime.dto.UserPresence;
import com.chat.realtime.service.ChatService;
import com.chat.realtime.service.PresenceService;
import com.chat.realtime.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * WebSocket Controller for Real-time Chat
 * 
 * Handles WebSocket connections and real-time messaging operations:
 * - Message sending and receiving
 * - User presence tracking
 * - Typing indicators
 * - File sharing
 * - Group chat management
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final ChatService chatService;
    private final PresenceService presenceService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Handle private messages between users
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage, Principal principal) {
        log.info("Received message from {}: {}", principal.getName(), chatMessage.getContent());
        
        // Set sender information
        chatMessage.setSender(principal.getName());
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setMessageId(generateMessageId());
        
        // Process message asynchronously
        CompletableFuture.runAsync(() -> {
            try {
                // Save message to database
                chatService.saveMessage(chatMessage);
                
                // Send push notifications to offline users
                notificationService.sendPushNotification(chatMessage);
                
                // Update message analytics
                chatService.updateMessageAnalytics(chatMessage);
                
            } catch (Exception e) {
                log.error("Error processing message: {}", e.getMessage(), e);
            }
        });
        
        return chatMessage;
    }

    /**
     * Handle private messages between specific users
     */
    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage, Principal principal) {
        log.info("Private message from {} to {}", principal.getName(), chatMessage.getRecipient());
        
        chatMessage.setSender(principal.getName());
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setMessageId(generateMessageId());
        chatMessage.setPrivateMessage(true);
        
        // Save private message
        CompletableFuture.runAsync(() -> {
            try {
                chatService.saveMessage(chatMessage);
                notificationService.sendPrivateNotification(chatMessage);
            } catch (Exception e) {
                log.error("Error processing private message: {}", e.getMessage(), e);
            }
        });
        
        // Send to specific user
        messagingTemplate.convertAndSendToUser(
            chatMessage.getRecipient(),
            "/queue/messages",
            chatMessage
        );
        
        // Send confirmation to sender
        messagingTemplate.convertAndSendToUser(
            principal.getName(),
            "/queue/messages",
            chatMessage
        );
    }

    /**
     * Handle group chat messages
     */
    @MessageMapping("/chat.sendGroupMessage/{groupId}")
    public void sendGroupMessage(
            @DestinationVariable String groupId,
            @Payload ChatMessage chatMessage,
            Principal principal) {
        
        log.info("Group message from {} to group {}", principal.getName(), groupId);
        
        chatMessage.setSender(principal.getName());
        chatMessage.setGroupId(groupId);
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setMessageId(generateMessageId());
        
        // Validate user is member of group
        if (!chatService.isUserInGroup(principal.getName(), groupId)) {
            log.warn("User {} attempted to send message to group {} without membership", 
                    principal.getName(), groupId);
            return;
        }
        
        // Save group message
        CompletableFuture.runAsync(() -> {
            try {
                chatService.saveMessage(chatMessage);
                notificationService.sendGroupNotification(chatMessage);
            } catch (Exception e) {
                log.error("Error processing group message: {}", e.getMessage(), e);
            }
        });
        
        // Broadcast to group members
        messagingTemplate.convertAndSend("/topic/group/" + groupId, chatMessage);
    }

    /**
     * Handle typing indicators
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, Object> typingData, Principal principal) {
        String recipient = (String) typingData.get("recipient");
        String groupId = (String) typingData.get("groupId");
        boolean isTyping = (Boolean) typingData.get("isTyping");
        
        Map<String, Object> typingIndicator = Map.of(
            "sender", principal.getName(),
            "isTyping", isTyping,
            "timestamp", LocalDateTime.now()
        );
        
        if (recipient != null) {
            // Private typing indicator
            messagingTemplate.convertAndSendToUser(
                recipient,
                "/queue/typing",
                typingIndicator
            );
        } else if (groupId != null) {
            // Group typing indicator
            messagingTemplate.convertAndSend(
                "/topic/group/" + groupId + "/typing",
                typingIndicator
            );
        }
    }

    /**
     * Handle user presence updates
     */
    @MessageMapping("/presence.update")
    public void updatePresence(@Payload UserPresence presence, Principal principal) {
        log.info("Presence update from {}: {}", principal.getName(), presence.getStatus());
        
        presence.setUsername(principal.getName());
        presence.setLastSeen(LocalDateTime.now());
        
        // Update presence in service
        presenceService.updateUserPresence(presence);
        
        // Broadcast presence update
        messagingTemplate.convertAndSend("/topic/presence", presence);
    }

    /**
     * Handle file sharing
     */
    @MessageMapping("/chat.shareFile")
    public void shareFile(@Payload ChatMessage fileMessage, Principal principal) {
        log.info("File shared by {}: {}", principal.getName(), fileMessage.getFileName());
        
        fileMessage.setSender(principal.getName());
        fileMessage.setTimestamp(LocalDateTime.now());
        fileMessage.setMessageId(generateMessageId());
        fileMessage.setFileMessage(true);
        
        // Validate file
        if (!chatService.validateFile(fileMessage)) {
            log.warn("Invalid file shared by {}", principal.getName());
            return;
        }
        
        // Process file asynchronously
        CompletableFuture.runAsync(() -> {
            try {
                // Save file metadata
                chatService.saveFileMessage(fileMessage);
                
                // Generate thumbnail if image
                if (fileMessage.getFileType().startsWith("image/")) {
                    chatService.generateThumbnail(fileMessage);
                }
                
                // Scan for viruses
                chatService.scanFile(fileMessage);
                
            } catch (Exception e) {
                log.error("Error processing file: {}", e.getMessage(), e);
            }
        });
        
        // Send file message
        if (fileMessage.getRecipient() != null) {
            messagingTemplate.convertAndSendToUser(
                fileMessage.getRecipient(),
                "/queue/messages",
                fileMessage
            );
        } else if (fileMessage.getGroupId() != null) {
            messagingTemplate.convertAndSend(
                "/topic/group/" + fileMessage.getGroupId(),
                fileMessage
            );
        } else {
            messagingTemplate.convertAndSend("/topic/public", fileMessage);
        }
    }

    /**
     * Handle message reactions (like, love, etc.)
     */
    @MessageMapping("/chat.react")
    public void reactToMessage(@Payload Map<String, Object> reactionData, Principal principal) {
        String messageId = (String) reactionData.get("messageId");
        String reaction = (String) reactionData.get("reaction");
        String groupId = (String) reactionData.get("groupId");
        
        log.info("User {} reacted with {} to message {}", principal.getName(), reaction, messageId);
        
        // Save reaction
        CompletableFuture.runAsync(() -> {
            try {
                chatService.saveReaction(messageId, principal.getName(), reaction);
            } catch (Exception e) {
                log.error("Error saving reaction: {}", e.getMessage(), e);
            }
        });
        
        Map<String, Object> reactionUpdate = Map.of(
            "messageId", messageId,
            "user", principal.getName(),
            "reaction", reaction,
            "timestamp", LocalDateTime.now()
        );
        
        // Broadcast reaction
        if (groupId != null) {
            messagingTemplate.convertAndSend(
                "/topic/group/" + groupId + "/reactions",
                reactionUpdate
            );
        } else {
            messagingTemplate.convertAndSend("/topic/reactions", reactionUpdate);
        }
    }

    /**
     * Handle message deletion
     */
    @MessageMapping("/chat.deleteMessage")
    public void deleteMessage(@Payload Map<String, Object> deleteData, Principal principal) {
        String messageId = (String) deleteData.get("messageId");
        String groupId = (String) deleteData.get("groupId");
        
        log.info("User {} deleting message {}", principal.getName(), messageId);
        
        // Validate user can delete message
        if (!chatService.canUserDeleteMessage(principal.getName(), messageId)) {
            log.warn("User {} attempted to delete message {} without permission", 
                    principal.getName(), messageId);
            return;
        }
        
        // Soft delete message
        CompletableFuture.runAsync(() -> {
            try {
                chatService.deleteMessage(messageId, principal.getName());
            } catch (Exception e) {
                log.error("Error deleting message: {}", e.getMessage(), e);
            }
        });
        
        Map<String, Object> deleteUpdate = Map.of(
            "messageId", messageId,
            "deletedBy", principal.getName(),
            "timestamp", LocalDateTime.now()
        );
        
        // Broadcast deletion
        if (groupId != null) {
            messagingTemplate.convertAndSend(
                "/topic/group/" + groupId + "/deletions",
                deleteUpdate
            );
        } else {
            messagingTemplate.convertAndSend("/topic/deletions", deleteUpdate);
        }
    }

    /**
     * Subscribe to user's private message queue
     */
    @SubscribeMapping("/user/queue/messages")
    public List<ChatMessage> subscribeToPrivateMessages(Principal principal) {
        log.info("User {} subscribed to private messages", principal.getName());
        
        // Update user presence to online
        presenceService.setUserOnline(principal.getName());
        
        // Return recent unread messages
        return chatService.getUnreadMessages(principal.getName());
    }

    /**
     * Subscribe to group messages
     */
    @SubscribeMapping("/topic/group/{groupId}")
    public List<ChatMessage> subscribeToGroup(
            @DestinationVariable String groupId,
            Principal principal) {
        
        log.info("User {} subscribed to group {}", principal.getName(), groupId);
        
        // Validate user is member of group
        if (!chatService.isUserInGroup(principal.getName(), groupId)) {
            log.warn("User {} attempted to subscribe to group {} without membership", 
                    principal.getName(), groupId);
            return List.of();
        }
        
        // Return recent group messages
        return chatService.getRecentGroupMessages(groupId, 50);
    }

    /**
     * Subscribe to presence updates
     */
    @SubscribeMapping("/topic/presence")
    public List<UserPresence> subscribeToPresence(Principal principal) {
        log.info("User {} subscribed to presence updates", principal.getName());
        
        // Return current online users
        return presenceService.getOnlineUsers();
    }

    /**
     * Handle user connection
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/presence")
    public UserPresence addUser(@Payload UserPresence userPresence, 
                               SimpMessageHeaderAccessor headerAccessor,
                               Principal principal) {
        
        String username = principal.getName();
        userPresence.setUsername(username);
        userPresence.setStatus("ONLINE");
        userPresence.setLastSeen(LocalDateTime.now());
        
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", username);
        
        log.info("User {} connected", username);
        
        // Update presence
        presenceService.setUserOnline(username);
        
        return userPresence;
    }

    /**
     * Generate unique message ID
     */
    private String generateMessageId() {
        return "msg_" + System.currentTimeMillis() + "_" + 
               (int)(Math.random() * 10000);
    }
}
