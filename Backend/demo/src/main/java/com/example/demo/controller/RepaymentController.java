package com.example.demo.controller;

import com.example.demo.service.AdminRepaymentSummary;
import com.example.demo.service.RepaymentStatus;
import com.example.demo.model.Loan;
import com.example.demo.model.Repayment;
import com.example.demo.model.Reminder;
import com.example.demo.repository.LoanRepository;
import com.example.demo.repository.RepaymentRepository;
import com.example.demo.repository.ReminderRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/repayments")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class RepaymentController {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private RepaymentRepository repaymentRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @GetMapping("/{customerId}")
    public ResponseEntity<RepaymentStatus> getRepaymentStatus(@PathVariable Long customerId) {
        // Find the loan associated with the customer
        Optional<Loan> loanOptional = loanRepository.findByCustomerId(customerId);

        if (loanOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Loan loan = loanOptional.get();

        // Find the repayment schedule for that loan, sorted by due date
        List<Repayment> schedule = repaymentRepository.findByLoanIdOrderByDueDateAsc(loan.getId());

        // Create and return the DTO
        RepaymentStatus dto = new RepaymentStatus(loan, schedule);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/pay/{repaymentId}")
    @Transactional
    public ResponseEntity<Repayment> payEmi(@PathVariable Long repaymentId) {
        Optional<Repayment> optionalRepayment = repaymentRepository.findById(repaymentId);

        if (optionalRepayment.isPresent()) {
            Repayment repayment = optionalRepayment.get();

            // Update the status to 'Paid'
            repayment.setStatus("Paid");

            // Save the updated entity to the database
            Repayment updatedRepayment = repaymentRepository.save(repayment);
            
            // Mark all reminders for this customer as read when payment is made
            Long customerId = repayment.getLoan().getCustomer().getId();
            List<Reminder> unreadReminders = reminderRepository.findByCustomerIdAndIsReadFalseOrderByCreatedAtDesc(customerId);
            for (Reminder reminder : unreadReminders) {
                reminder.setRead(true);
                reminderRepository.save(reminder);
            }

            return ResponseEntity.ok(updatedRepayment);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<AdminRepaymentSummary>> getRepaymentStatusForAllLoans() {
        List<Loan> allLoans = loanRepository.findAll();
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        List<AdminRepaymentSummary> summaries = allLoans.stream()
                .map(loan -> {
                    List<Repayment> repayments = repaymentRepository.findByLoanIdOrderByDueDateAsc(loan.getId());

                    // Check if loan has PENDING EMI due in current month
                    Optional<Repayment> currentMonthPendingEmi = repayments.stream()
                            .filter(r -> {
                                boolean isCurrentMonth = r.getDueDate().getMonthValue() == currentMonth && r.getDueDate().getYear() == currentYear;
                                boolean isPending = "Pending".equals(r.getStatus());
                                return isCurrentMonth && isPending;
                            })
                            .findFirst();

                    if (currentMonthPendingEmi.isEmpty()) {
                        return null; // Filter out loans without pending current month EMI
                    }

                    long totalPaid = (long) repayments.stream()
                            .filter(r -> "Paid".equals(r.getStatus()))
                            .mapToDouble(Repayment::getEmiAmount)
                            .sum();

                    Long currentEmiAmount = (long) currentMonthPendingEmi.get().getEmiAmount();

                    return new AdminRepaymentSummary(loan.getCustomer().getId(), 
                            loan.getCustomer().getName(), totalPaid, loan.getStatus(), currentEmiAmount);
                })
                .filter(summary -> summary != null)
                .collect(Collectors.toList());

        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/paid")
    public ResponseEntity<List<AdminRepaymentSummary>> getPaidCustomers() {
        List<Loan> allLoans = loanRepository.findAll();
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        List<AdminRepaymentSummary> paidCustomers = allLoans.stream()
                .map(loan -> {
                    List<Repayment> repayments = repaymentRepository.findByLoanIdOrderByDueDateAsc(loan.getId());

                    // Check if customer has paid current month's EMI
                    boolean hasPaidCurrentMonth = repayments.stream()
                            .anyMatch(r -> {
                                boolean isCurrentMonth = r.getDueDate().getMonthValue() == currentMonth && r.getDueDate().getYear() == currentYear;
                                boolean isPaid = "Paid".equals(r.getStatus());
                                return isCurrentMonth && isPaid;
                            });

                    if (!hasPaidCurrentMonth) {
                        return null; // Filter out customers who haven't paid current month
                    }

                    long totalPaid = (long) repayments.stream()
                            .filter(r -> "Paid".equals(r.getStatus()))
                            .mapToDouble(Repayment::getEmiAmount)
                            .sum();

                    return new AdminRepaymentSummary(loan.getCustomer().getId(), 
                            loan.getCustomer().getName(), totalPaid, "Paid", null);
                })
                .filter(summary -> summary != null)
                .collect(Collectors.toList());

        return ResponseEntity.ok(paidCustomers);
    }

    @PostMapping("/reminder/{customerId}")
    public ResponseEntity<String> sendReminder(@PathVariable Long customerId) {
        try {
            // Get loan details for the customer
            Optional<Loan> loanOptional = loanRepository.findByCustomerId(customerId);
            if (loanOptional.isEmpty()) {
                return ResponseEntity.badRequest().body("No loan found for customer");
            }
            
            Loan loan = loanOptional.get();
            List<Repayment> repayments = repaymentRepository.findByLoanIdOrderByDueDateAsc(loan.getId());
            
            // Find the next pending EMI
            Optional<Repayment> nextPendingEmi = repayments.stream()
                    .filter(r -> "Pending".equals(r.getStatus()))
                    .findFirst();
            
            if (nextPendingEmi.isEmpty()) {
                return ResponseEntity.badRequest().body("No pending EMI found for customer");
            }
            
            Repayment pendingEmi = nextPendingEmi.get();
            String message = String.format(
                "🔔 Payment Reminder: Your EMI of ₹%,.0f is due on %s. Loan Amount: ₹%,.0f. Please make the payment to avoid late fees. Contact support if you need assistance.",
                pendingEmi.getEmiAmount(),
                pendingEmi.getDueDate().toString(),
                loan.getLoanAmount()
            );
            
            Reminder reminder = new Reminder(customerId, message);
            reminderRepository.save(reminder);
            return ResponseEntity.ok("Reminder sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send reminder: " + e.getMessage());
        }
    }

    @GetMapping("/reminders/{customerId}")
    public ResponseEntity<List<Reminder>> getCustomerReminders(@PathVariable Long customerId) {
        List<Reminder> reminders = reminderRepository.findByCustomerIdAndIsReadFalseOrderByCreatedAtDesc(customerId);
        return ResponseEntity.ok(reminders);
    }
    
    @PostMapping("/reminders/{reminderId}/mark-read")
    public ResponseEntity<String> markReminderAsRead(@PathVariable Long reminderId) {
        try {
            Optional<Reminder> reminderOptional = reminderRepository.findById(reminderId);
            if (reminderOptional.isPresent()) {
                Reminder reminder = reminderOptional.get();
                reminder.setRead(true);
                reminderRepository.save(reminder);
                return ResponseEntity.ok("Reminder marked as read");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to mark reminder as read");
        }
    }
}