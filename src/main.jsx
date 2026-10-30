import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "./index.css";
import "react-country-state-city/dist/react-country-state-city.css";
import HospitalList from "./pages/HospitalList";

// Home & Login
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Donor/Profile";

// Donor
import DonorRegister from "./pages/Donor/DonorRegister";
import DonorDashboard from "./pages/Donor/DonorDashboard";
import DonationHistory from "./pages/Donor/DonationHistory";
import BookAppointment from "./pages/Donor/BookAppointment";
import AppointmentConfirmation from "./pages/Donor/BookAppointConfirm";
import Appointment from "./pages/Donor/DonorAppointment";
import Notifications from "./pages/Donor/notifications";
import EmergencyRequests from "./pages/Donor/EmergencyRequests";

// Recipient
import RecipientRegistration from "./pages/Recipient/RecipientRegistration";
import RecipientDashboard from "./pages/Recipient/RecipientDashboard";
import BloodRequest from "./pages/Recipient/BloodRequest";
import MyRequests from "./pages/Recipient/MyRequests";
import MyAppointments from "./pages/Recipient/MyAppointments";

import Rnotifications from "./pages/Recipient/Rnotifications";
import RProfile from "./pages/Recipient/Rprofile";

// Hospital
import HospitalRegistration from "./pages/Hospital/HospitalRegister";
import HospitalDashboard from "./pages/Hospital/HospitalDashboard";
import BloodInventory from "./pages/Hospital/BloodInventary";
import BloodRequests from "./pages/Hospital/BloodRequests";
import DonorManagement from "./pages/Hospital/DonorManagement";
import HospitalNotification from "./pages/Hospital/HospitalNotifications";
import ProfileHS from "./pages/Hospital/HospitalProfile";

// Admin
import AdminDashboard from "./pages/Admin/AdminDashboard";
import DonorManagementADm from "./pages/Admin/DonorManagement";
import RecipientManagementADm from "./pages/Admin/RCManagement";
import HospitalManagementADm from "./pages/Admin/HpManagement";
import BloodRequestsADm from "./pages/Admin/BloodRequestsAD";
import AppointmentManagementADm from "./pages/Admin/AppoiMngmtAD";
import EmergencyRequestsADm from "./pages/Admin/EmergencyAD";
import NotificationsADm from "./pages/Admin/NotificationsAD";
import Reports from "./pages/Admin/Reports";
import UserManagement from "./pages/Admin/UserManagement";
import AdminProfile from "./pages/Admin/AdminProfile";


// Blood Bank
import BloodBankRegistration from "./pages/BloodBank/BBRegistration";
import BloodBankDashboard from "./pages/BloodBank/BBDashboard";
import BBBloodInventory from "./pages/BloodBank/BBbloodInventory";
import BloodCollection from "./pages/BloodBank/BBbloodCollection";
import BloodIssue from "./pages/BloodBank/BloodIssue";
import BBBloodRequests from "./pages/BloodBank/BBbloodRequests";
import BBDonorManagement from "./pages/BloodBank/BBDonorMng";
import BBAppointments from "./pages/BloodBank/BBAppointment";
import BBEmergencyRequests from "./pages/BloodBank/BBEmergencyRequests";
import BBReports from "./pages/BloodBank/BBReports";
import BloodBankNotifications from "./pages/BloodBank/BBNotifications";
import BloodBankProfile from "./pages/BloodBank/BBProfile";

import BBManagementADm from "./pages/Admin/BBManagement";
import SuccessPage from "./pages/SuccessPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Campaigns from "./pages/compaign";
import Emergency from "./pages/Emergency";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import HospitalEmergencyRequest from "./pages/Hospital/Emergency";
import ViewEmergencyRequests from "./pages/Hospital/EmergencyRequests";
import RecipientEmergencyRequest from "./pages/Recipient/EmergencyRequests";
import AdminEmergencyRequests from "./pages/Admin/EmergencyAD";
import BloodStockManagementADm from "./pages/Admin/bloodStockManagement";
import DonationEventManagementADm from "./pages/Admin/donationEventsManagementAD";
import FeedbackManagementADm from "./pages/Admin/feedbacksAD";
import RouteError from "./pages/RouteError";
import ManageDonationCamps from "./pages/DonationCamps/ManageDonationCamps";
import AddDonationCamp from "./pages/DonationCamps/AddDonationCamp";
import ViewDonationCamps from "./pages/DonationCamps/ViewDonationCamps";
import CompletionActions from "./pages/CompletionActions";

const router = createBrowserRouter([
  { path: "/", element: <Home />, errorElement: <RouteError />, },
  { path: "/login", element: <Login />, errorElement: <RouteError />, },
  { path: "/hospitals", element: <HospitalList /> },

  // Donor
  { path: "/register/donor", element: <DonorRegister /> },
  { path: "/donor-dashboard", element: <DonorDashboard /> },
  { path: "/donationHistory", element: <DonationHistory /> },
  { path: "/appointments", element: <Appointment /> },
  { path: "/bookappointment", element: <BookAppointment /> },
  { path: "/appointConfirm", element: <AppointmentConfirmation /> },

  // Recipient
  { path: "/register/recipient", element: <RecipientRegistration /> },
  { path: "/recipient-dashboard", element: <RecipientDashboard /> },
  { path: "/blood-request", element: <BloodRequest /> },
  { path: "/my-requests", element: <MyRequests /> },
  {
    path: "/recipient-emergency", element: <RecipientEmergencyRequest />
  },
  { path: "/Rnotifications", element: <Rnotifications /> },
  { path: "/Rprofile", element: <RProfile /> },

  // Hospital
  { path: "/hospital-register", element: <HospitalRegistration /> },
  { path: "/hospital-dashboard", element: <HospitalDashboard /> },
  { path: "/blood-inventory", element: <BloodInventory /> },
  { path: "/blood-requests", element: <BloodRequests /> },
  { path: "/donor-management", element: <DonorManagement /> },
  { path: "/hospital-emergency", element: <ViewEmergencyRequests /> },
  { path: "/new-emergency", element: <HospitalEmergencyRequest /> },
  {
    path: "/notifications-hospital", element: <HospitalNotification />
  },
  { path: "/hospital-profile", element: <ProfileHS /> },

  // Admin
  { path: "/admin-dashboard", element: <AdminDashboard /> },
  { path: "/donor-managementAD", element: <DonorManagementADm /> },
  { path: "/recipient-managementAD", element: <RecipientManagementADm /> },
  { path: "/hospital-managementAD", element: <HospitalManagementADm /> },
  {
    path: "/bloodbank-managementAD", element: <BBManagementADm />
  },
  { path: "/blood-requestsAD", element: <BloodRequestsADm /> },
  { path: "/appointment-managementAD", element: <AppointmentManagementADm /> },
  {
    path: "/emergency-requestsAD", element: <AdminEmergencyRequests />
  },
  { path: "/notificationsAD", element: <NotificationsADm /> },
  { path: "/reports", element: <Reports /> },
  { path: "/user-management", element: <UserManagement /> },
  { path: "/admin-profile", element: <AdminProfile /> },
  {
    path: "/blood-stock-reports", element: <BloodStockManagementADm />
  },
  {
    path: "/donation-events-managementAD", element: <DonationEventManagementADm />
  },
  {
    path: "/feedbacksAD", element: <FeedbackManagementADm />
  },

  // Blood Bank
  { path: "/register/bloodbanks", element: <BloodBankRegistration /> },
  { path: "/bloodbank-dashboard", element: <BloodBankDashboard /> },
  { path: "/bloodbank-inventory", element: <BBBloodInventory /> },
  { path: "/blood-collection", element: <BloodCollection /> },
  { path: "/blood-issue", element: <BloodIssue /> },
  { path: "/bloodbank-bloodrequests", element: <BBBloodRequests /> },
  { path: "/bloodbank-donor-management", element: <BBDonorManagement /> },
  { path: "/bloodbank-appointment-management", element: <BBAppointments /> },
  { path: "/bloodbank-emergency", element: <BBEmergencyRequests /> },
  { path: "/blood-stock-report", element: <BBReports /> },
  { path: "/bloodbank-notifications", element: <BloodBankNotifications /> },
  { path: "/bloodbank-profile", element: <BloodBankProfile /> },

  // Common
  { path: "/profile", element: <Profile /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "/emergencyRequests", element: <EmergencyRequests /> },
  { path: "/myappointments", element: <MyAppointments /> },
  {
    path: "/success", element: <SuccessPage />
  },
  {
    path: "/about", element: <About />
  },
  {
    path: "/contact", element: <Contact />
  },
  {
    path: "/campaigns", element: <Campaigns />
  },
  {
    path: "/emergency", element: <Emergency />
  },
  {
    path: "/forgot-password", element: <ForgotPassword />
  },
  {
    path: "/reset-password", element: <ResetPassword />
  },


  // Donation Camps
  {
    path: "/blood-donation-camps",
    element: <ManageDonationCamps />,
  },
  {
    path: "/hospital/donation-camps/add",
    element: <AddDonationCamp />,
  },
  {
    path: "/donation-camps",
    element: <ViewDonationCamps />,
  },
  {
    path: "/hospital/completion-actions",
    element: <CompletionActions destinationType="Hospital" />,
  },
  {
    path: "/bloodbank/completion-actions",
    element: <CompletionActions destinationType="BloodBank" />,
  },

])

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);