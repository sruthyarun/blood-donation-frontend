
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HospitalList from "./pages/HospitalList";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="colored"
      />

      <Routes>
        <Route path="/hospitals" element={<HospitalList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
