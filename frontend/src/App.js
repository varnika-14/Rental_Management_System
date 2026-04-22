import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import PropertyList from "./pages/PropertyList";
import PropertyDetails from "./pages/PropertyDetails";
import MyBookings from "./pages/MyBookings";
import BookingRequests from "./pages/BookingRequests";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import UserProfileView from "./pages/UserProfileView";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-property"
          element={
            <PrivateRoute>
              <Layout>
                <AddProperty />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-property/:id"
          element={
            <PrivateRoute>
              <Layout>
                <AddProperty />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-properties"
          element={
            <PrivateRoute>
              <Layout>
                <MyProperties />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <PrivateRoute>
              <Layout>
                <PropertyList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <PrivateRoute>
              <Layout>
                <PropertyDetails />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <Layout>
                <MyBookings />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/booking-requests"
          element={
            <PrivateRoute>
              <Layout>
                <BookingRequests />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <PrivateRoute>
              <Layout>
                <UserProfileView />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
