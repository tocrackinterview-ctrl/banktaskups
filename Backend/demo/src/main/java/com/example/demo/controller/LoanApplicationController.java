package com.example.demo.controller;

import com.example.demo.model.LoanApplication;

import com.example.demo.repository.LoanApplicationRepository;
import com.example.demo.repository.LoanRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.LoanAcceptanceService;
import com.example.demo.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/loan-applications")
public class LoanApplicationController {

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    @Autowired
    private LoanService loanService;

    

    @GetMapping
    public List<LoanApplication> getAllLoanApplications() {
        return loanApplicationRepository.findAll();
    }


    @GetMapping("/{id}")
    public ResponseEntity<LoanApplication> getLoanApplicationByCustomerId(@PathVariable Long id) {
        Optional<LoanApplication> loanApplication = loanApplicationRepository.findById(id);

        if (loanApplication.isPresent()) {
            return ResponseEntity.ok(loanApplication.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // NEW ENDPOINT: Check application status for a specific user
    @GetMapping("/check-status/{userId}")
    public ResponseEntity<Map<String, Boolean>> checkApplicationStatus(@PathVariable Long userId) {
        List<LoanApplication> applications = loanApplicationRepository.findByUserId(userId);
        boolean hasPending = applications.stream()
                .anyMatch(app -> "Pending".equals(app.getStatus()) || "Accepted".equals(app.getStatus()));

        Map<String, Boolean> response = new HashMap<>();
        response.put("hasPending", hasPending);
        return ResponseEntity.ok(response);
    }

    // Get loan application by userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<LoanApplication> getLoanApplicationByUserId(@PathVariable Long userId) {
        Optional<LoanApplication> application = loanApplicationRepository.findTopByUserIdOrderByIdDesc(userId);
        if (application.isPresent()) {
            return ResponseEntity.ok(application.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public LoanApplication createLoanApplication(@RequestBody LoanApplication loanApplication) {
        if (loanApplication.getCibilScore() != null) {
            if (loanApplication.getCibilScore() > 700) {
                loanApplication.setInterestRate(7.4);
            } else {
                loanApplication.setInterestRate(9.0);
            }
        } else {
            loanApplication.setInterestRate(9.0);
        }
        return loanApplicationRepository.save(loanApplication);
    }

    @PostMapping("/{id}/accept")
    @Transactional
    public ResponseEntity<Void> acceptLoanApplication(@PathVariable Long id) {
        Optional<LoanApplication> optionalLoanApplication = loanApplicationRepository.findById(id);

        if (optionalLoanApplication.isPresent()) {
            LoanApplication loanApplication = optionalLoanApplication.get();

            // Mark the application as accepted
            loanApplication.setStatus("Accepted");
            loanApplicationRepository.save(loanApplication);

            // Generate the loan and repayment schedule
            loanService.generateLoanAndSchedule(loanApplication);

            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectLoanApplication(@PathVariable Long id, @RequestBody(required = false) Map<String, String> requestBody) {
        Optional<LoanApplication> optionalLoanApplication = loanApplicationRepository.findById(id);

        if (optionalLoanApplication.isPresent()) {
            LoanApplication loanApplication = optionalLoanApplication.get();
            loanApplication.setStatus("Rejected");
            if (requestBody != null && requestBody.containsKey("feedback")) {
                loanApplication.setRejectionReason(requestBody.get("feedback"));
            }
            loanApplicationRepository.save(loanApplication);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoanApplication(@PathVariable Long id) {
        if (loanApplicationRepository.existsById(id)) {
            loanApplicationRepository.deleteById(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}