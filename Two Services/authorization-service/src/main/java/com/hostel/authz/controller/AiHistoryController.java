package com.hostel.authz.controller;

import com.hostel.authz.entity.AiChatHistory;
import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.service.AuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/authz/ai-history")
@Tag(name = "AI History Controller", description = "Store and query AI assistant chat history in MongoDB")
public class AiHistoryController {

    private final AuthorizationService authorizationService;

    public AiHistoryController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @PostMapping
    @Operation(summary = "Save AI Chat query & response history")
    public ResponseEntity<ApiResponse<AiChatHistory>> saveChatHistory(@RequestBody AiChatHistory chat) {
        return ResponseEntity.ok(ApiResponse.success("AI Chat history saved", authorizationService.saveAiChat(chat)));
    }

    @GetMapping("/{username}")
    @Operation(summary = "Get AI Chat history for a specific user")
    public ResponseEntity<ApiResponse<List<AiChatHistory>>> getChatHistoryByUser(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.success("User AI Chat history retrieved", authorizationService.getAiChatHistory(username)));
    }
}
