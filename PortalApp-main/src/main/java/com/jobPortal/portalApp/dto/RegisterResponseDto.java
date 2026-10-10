package com.jobPortal.portalApp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterResponseDto {

    private Long id;
    private String name;
    private String email;
    private String Role;

}
