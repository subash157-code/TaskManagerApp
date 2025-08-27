import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admin from "./Components/Admin";
import Employee from "./Components/Employee";
import TeamLead from "./Components/TeamLead";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/teamlead" element={<TeamLead />} />
      </Routes>
    </Router>
  );
}

export default App;
