package com.hostel.authz.controller;

import com.hostel.authz.entity.AiChatHistory;
import com.hostel.authz.dto.ApiResponse;
import com.hostel.authz.service.AuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<ApiResponse<AiChatHistory>> saveChatHistory(@RequestBody AiChatHistory chat, Authentication authentication) {
        if (authentication != null) {
            chat.setUsername(authentication.getName());
        }
        return ResponseEntity.ok(ApiResponse.success("AI Chat history saved", authorizationService.saveAiChat(chat)));
    }

    @GetMapping("/{username}")
    @Operation(summary = "Get AI Chat history for a specific user")
    public ResponseEntity<ApiResponse<List<AiChatHistory>>> getChatHistoryByUser(@PathVariable String username, Authentication authentication) {
        String targetUser = username;
        if (authentication != null && isStudentOnly(authentication)) {
            targetUser = authentication.getName();
        }
        return ResponseEntity.ok(ApiResponse.success("User AI Chat history retrieved", authorizationService.getAiChatHistory(targetUser)));
    }

    private boolean isStudentOnly(Authentication authentication) {
        return authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT")) &&
               authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_WARDEN"));
    }
}
