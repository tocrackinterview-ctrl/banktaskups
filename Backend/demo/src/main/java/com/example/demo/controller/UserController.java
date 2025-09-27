package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class UserController {

    private final UserRepository userRepo;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public UserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // Create a new user
    @PostMapping
    public User createUser(@RequestBody User user) {
        if (user.getName() == null || user.getEmail() == null) {
            throw new IllegalArgumentException("Name and Email are required");
        }
        User savedUser = userRepo.save(user);

        System.out.println("Saved user: " + savedUser);
        return savedUser;
    }

    // Update user profile
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setName(userDetails.getName());
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            user.setPhone(userDetails.getPhone());
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }
            return userRepo.save(user);
        } else {
            throw new RuntimeException("User not found with id: " + id);
        }
    }

}
