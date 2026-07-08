package com.ibs.airbook.auth;

public record LoginResponse(
        String token,
        String email,
        String fullName,
        String role
) {}
