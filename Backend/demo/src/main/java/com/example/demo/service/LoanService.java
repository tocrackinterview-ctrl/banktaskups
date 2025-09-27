package com.example.demo.service;

import com.example.demo.model.Loan;
import com.example.demo.model.LoanApplication;
import com.example.demo.model.Repayment;
import com.example.demo.model.User;
import com.example.demo.repository.LoanRepository;
import com.example.demo.repository.RepaymentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private RepaymentRepository repaymentRepository;

    @Autowired
    private UserRepository userRepository;

    public void generateLoanAndSchedule(LoanApplication loanApplication) {
        Optional<User> userOptional = userRepository.findById(loanApplication.getUserId());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found for loan application: " + loanApplication.getId());
        }

        User user = userOptional.get();

        // 1. Create and save the Loan entity
        Loan newLoan = new Loan();
        newLoan.setCustomer(user);
        newLoan.setLoanAmount(loanApplication.getLoanAmount()); // Corrected method name
        newLoan.setInterestRate(loanApplication.getInterestRate());
        newLoan.setTenureMonths(loanApplication.getTenure());
        newLoan.setDisbursedDate(LocalDate.now());
        newLoan.setStatus("Active");
        loanRepository.save(newLoan);

        // 2. Generate and save the Repayment Schedule
        double monthlyInterestRate = (newLoan.getInterestRate() / 100) / 12;
        int tenure = newLoan.getTenureMonths()*12;
        double principal = newLoan.getLoanAmount(); // Corrected method name

        double emi = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure))
                / (Math.pow(1 + monthlyInterestRate, tenure) - 1);

        LocalDate acceptanceDate = LocalDate.now(); // Admin acceptance date

        for (int i = 0; i < tenure; i++) {
            Repayment repayment = new Repayment();
            repayment.setLoan(newLoan);
            repayment.setEmiAmount(emi);
            repayment.setDueDate(acceptanceDate.plusMonths(i)); // First EMI on acceptance date, then monthly
            repayment.setStatus("Pending"); // Default status
            repaymentRepository.save(repayment);
        }
    }
}