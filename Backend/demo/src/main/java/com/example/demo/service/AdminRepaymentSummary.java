package com.example.demo.service;

import java.time.LocalDate;

public class AdminRepaymentSummary {
    private String customerName;
    private Long totalPaidAmount;
    private String loanStatus;
    private Long nextEmiAmount; // New field for the next EMI amount
    private Long id;

    // Constructors
    public AdminRepaymentSummary() {
    }

    public AdminRepaymentSummary(Long id, String customerName, Long totalPaidAmount, String loanStatus, Long nextEmiAmount) {
        this.id = id;
        this.customerName = customerName;
        this.totalPaidAmount = totalPaidAmount;
        this.loanStatus = loanStatus;
        this.nextEmiAmount = nextEmiAmount;
    }

    // Getters and Setters
    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Long getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(Long totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    public String getLoanStatus() {
        return loanStatus;
    }

    public void setLoanStatus(String loanStatus) {
        this.loanStatus = loanStatus;
    }

    public Long getNextEmiAmount() {
        return nextEmiAmount;
    }

    public void setNextEmiAmount(Long nextEmiAmount) {
        this.nextEmiAmount = nextEmiAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}