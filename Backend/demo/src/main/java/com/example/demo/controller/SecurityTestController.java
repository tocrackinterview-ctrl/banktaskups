package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class SecurityTestController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/encode/{password}")
    public String testEncoding(@PathVariable String password) {
        String encoded = passwordEncoder.encode(password);
        return "Original: " + password + "\nEncoded: " + encoded;
    }

    @PostMapping("/verify")
    public String testVerification(@RequestParam String raw, @RequestParam String encoded) {
        boolean matches = passwordEncoder.matches(raw, encoded);
        return "Password matches: " + matches;
    }
}