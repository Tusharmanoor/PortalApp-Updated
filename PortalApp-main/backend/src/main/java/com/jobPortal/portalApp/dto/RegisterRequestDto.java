package com.jobPortal.portalApp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {

    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Please enter a Valid email")

    private String email;
    @NotBlank(message = "Please Enter Password")
    @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
    private String password;

    private String role;
}
