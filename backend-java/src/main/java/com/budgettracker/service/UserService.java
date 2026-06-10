package com.budgettracker.service;

import com.budgettracker.dto.user.UpdateProfileRequest;
import com.budgettracker.dto.user.UserResponse;
import com.budgettracker.entity.User;
import com.budgettracker.mapper.FinovaMapper;
import com.budgettracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final FinovaMapper mapper;

    @Transactional(readOnly = true)
    public UserResponse currentUser() {
        return mapper.toUserResponse(currentUserService.get());
    }
    @Transactional
    public void deleteCurrentUser() {
      User user = currentUserService.get();
       userRepository.delete(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest req) {
        User u = currentUserService.get();
        if (StringUtils.hasText(req.fullName())) {
            u.setFullName(req.fullName().trim());
        }
        return mapper.toUserResponse(userRepository.save(u));
    }
}
