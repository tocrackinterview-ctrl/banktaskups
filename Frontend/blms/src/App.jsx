import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import Login from './Login.jsx';
import './App.css'
import EMICalculator from './Emi.jsx';
import RepaymentStatus from './RepaymentStatus.jsx';
import LoanStatus from './LoanStatus.jsx';
import AdminPage from './Admin.jsx';
import LoanApplicationForm from './LoanApplicationForm.jsx';
import CustomersList from './CustomersList.jsx';
import Applications from './Applications.jsx';
import LoanApplications from './LoanApplications.jsx';
import Signup from './Signup.jsx';
import ScrollToTop from './ScrollToTop.jsx';

function App() {
  

  return (
    <>
     <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<Login />} />
       <Route path="/emi" element={<EMICalculator />} />
       <Route path="/admin" element={<AdminPage />} />
       <Route path="/signup" element={<Signup />} />
       <Route path="/customers" element={<CustomersList />} />
       <Route path="/loan-applications" element={<LoanApplicationForm />} />
       <Route path="/repayment" element={<RepaymentStatus />} />
       <Route path="/loan-status" element={<LoanStatus />} />
       <Route path="/applications" element={<Applications />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
