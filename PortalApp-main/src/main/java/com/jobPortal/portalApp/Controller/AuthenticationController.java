package com.jobPortal.portalApp.Controller;

import com.jobPortal.portalApp.Service.AuthenticationService;
import com.jobPortal.portalApp.dto.LoginRequestDto;
import com.jobPortal.portalApp.dto.LoginResponseDto;
import com.jobPortal.portalApp.dto.RegisterRequestDto;
import com.jobPortal.portalApp.dto.RegisterResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
@PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request)
    {
        return ResponseEntity.ok(authenticationService.login(request));

    }
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(
            @Valid @RequestBody RegisterRequestDto request) {

        return ResponseEntity.ok(authenticationService.register(request));
    }
}
