package com.example.demo.service;

import java.util.List;
import com.example.demo.model.Loan;
import com.example.demo.model.Repayment;

public class RepaymentStatus {
    private Loan loan;
    private List<Repayment> schedule;

    // Constructors, Getters, and Setters
    public RepaymentStatus(Loan loan, List<Repayment> schedule) {
        this.loan = loan;
        this.schedule = schedule;
    }

    public Loan getLoan() {
        return loan;
    }

    public void setLoan(Loan loan) {
        this.loan = loan;
    }

    public List<Repayment> getSchedule() {
        return schedule;
    }

    public void setSchedule(List<Repayment> schedule) {
        this.schedule = schedule;
    }
}