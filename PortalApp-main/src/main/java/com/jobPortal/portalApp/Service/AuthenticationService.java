package com.jobPortal.portalApp.Service;


import com.jobPortal.portalApp.Model.User;
import com.jobPortal.portalApp.Repository.UserRepository;
import com.jobPortal.portalApp.Security.JwtService;
import com.jobPortal.portalApp.dto.LoginRequestDto;
import com.jobPortal.portalApp.dto.LoginResponseDto;
import com.jobPortal.portalApp.dto.RegisterRequestDto;
import com.jobPortal.portalApp.dto.RegisterResponseDto;
import com.jobPortal.portalApp.enums.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public RegisterResponseDto register( @Valid RegisterRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = mapToEntity(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(Role.CANDIDATE);
            }
        } else {
            user.setRole(Role.CANDIDATE);
        }

        userRepository.save(user);
        RegisterResponseDto user1 = mapToDto(user);
        return user1;
    }

    private User mapToEntity(RegisterRequestDto request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword((request.getPassword()));
        return user;
    }

    private RegisterResponseDto mapToDto(User user) {
        RegisterResponseDto dto = new RegisterResponseDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());

        return dto;
    }

    public LoginResponseDto login(LoginRequestDto req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getEmail(),
                        req.getPassword()
                )
        );
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String jwt = jwtService.generateToken(user);
        LoginResponseDto response = new LoginResponseDto();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setToken(jwt);
        return response;
    }


    }

