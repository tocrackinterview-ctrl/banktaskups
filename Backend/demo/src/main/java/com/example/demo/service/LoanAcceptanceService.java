package com.example.demo.service;

import com.example.demo.model.LoanApplication;
import com.example.demo.repository.LoanApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoanAcceptanceService {

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    @Transactional
    public boolean acceptLoanApplication(Long id, Double loanAmount, Integer tenure, Double interestRate) {
        return loanApplicationRepository.findById(id).map(loanApplication -> {
            loanApplication.setLoanAmount(loanAmount);
            loanApplication.setTenure(tenure);
            loanApplication.setInterestRate(interestRate);
            loanApplication.setStatus("Accepted");
            loanApplicationRepository.save(loanApplication);
            return true;
        }).orElse(false);
    }
}
