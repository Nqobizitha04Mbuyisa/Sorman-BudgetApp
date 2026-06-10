package com.budgettracker.controller;

import com.budgettracker.dto.user.UpdateProfileRequest;
import com.budgettracker.dto.user.UserResponse;
import com.budgettracker.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@Tag(name = "Users", description = "Authenticated user profile")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get the authenticated user")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(userService.currentUser());
    }
   @DeleteMapping("/me")
   public ResponseEntity<Void> deleteMyAccount() {
    userService.deleteCurrentUser();
    return ResponseEntity.noContent().build();
}

    @Operation(summary = "Update profile fields (full name)")
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(req));
    }
}
