import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TeamLead.css"

// Map task status to a progress percentage
const statusToProgress = (status) => {
  switch (status) {
    case "To Do":
      return 25;
    case "In Process":
      return 50;
    case "Testing":
      return 75;
    case "Complete":
      return 100;
    default:
      return 0;
  }
};

export default function App() {
  const apiBase = "https://taskmanagerapp-backend-9tdi.onrender.com/api";

  const [teamLeads, setTeamLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loginData, setLoginData] = useState({ id: "", email: "" });
  const [lead, setLead] = useState(null);
  const [error, setError] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches all data (team leads, employees, tasks) from the server.
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, employeesRes, tasksRes] = await Promise.all([
        axios.get(`${apiBase}/teamleads`),
        axios.get(`${apiBase}/employees`),
        axios.get(`${apiBase}/tasks`),
      ]);
      setTeamLeads(leadsRes.data || []);
      setEmployees(employeesRes.data || []);
      setTasks(tasksRes.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data from the server. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Handles the login form submission.
   */
  const handleLogin = (e) => {
    e.preventDefault();
    const found = teamLeads.find(
      (tl) =>
        (tl.id?.toString().trim() === loginData.id.trim() || tl._id?.toString().trim() === loginData.id.trim()) &&
        tl.email?.toLowerCase() === loginData.email.trim().toLowerCase()
    );
    if (found) {
      setLead(found);
      setError("");
    } else {
      setError("Invalid Team Lead ID or Email");
    }
  };

  /**
   * Opens the employee editing modal.
   */
  const openEditEmployee = (emp) => {
    setEditingEmployee({ ...emp });
  };

  /**
   * Closes the employee editing modal.
   */
  const closeEditEmployee = () => setEditingEmployee(null);

  /**
   * Handles changes in the employee edit form.
   */
  const handleEmployeeChange = (field, value) => {
    setEditingEmployee((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Saves employee changes via a PUT API call.
   */
  const saveEmployee = async () => {
    try {
      const id = editingEmployee._id || editingEmployee.id;
      await axios.put(`${apiBase}/employees/${id}`, editingEmployee);
      await fetchData();
      closeEditEmployee();
    } catch (err) {
      console.error(err);
      setError("Failed to save employee data.");
    }
  };

  /**
   * Deletes a single employee via a DELETE API call.
   */
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`${apiBase}/employees/${id}`);
      await fetchData();
      setSelectedEmployees((s) => s.filter((x) => x !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete employee.");
    }
  };

  /**
   * Deletes all selected employees.
   */
  const bulkDeleteEmployees = async () => {
    try {
      await Promise.all(
        selectedEmployees.map((id) => axios.delete(`${apiBase}/employees/${id}`))
      );
      setSelectedEmployees([]);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to bulk delete employees.");
    }
  };

  /**
   * Updates the status of a specific task via a PUT API call.
   */
  const updateTaskStatus = async (task, newStatus) => {
    try {
      const id = task._id || task.id;
      const payload = { status: newStatus };
      await axios.put(`${apiBase}/tasks/${id}`, payload);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to update task status.");
    }
  };

  /**
   * Deletes a single task via a DELETE API call.
   */
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${apiBase}/tasks/${id}`);
      await fetchData();
      setSelectedTasks((s) => s.filter((x) => x !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete task.");
    }
  };

  /**
   * Deletes all selected tasks.
   */
  const bulkDeleteTasks = async () => {
    try {
      await Promise.all(
        selectedTasks.map((id) => axios.delete(`${apiBase}/tasks/${id}`))
      );
      setSelectedTasks([]);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to bulk delete tasks.");
    }
  };

  /**
   * Toggles the selection state for an employee.
   */
  const toggleSelectEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /**
   * Toggles the selection state for a task.
   */
  const toggleSelectTask = (id) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /**
   * Logs the user out.
   */
  const logout = () => {
    setLead(null);
    setLoginData({ id: "", email: "" });
    setError("");
    setSelectedEmployees([]);
    setSelectedTasks([]);
  };

  // Filters employees and tasks based on the logged-in team lead's team.
  const teamEmployees = employees.filter((e) => e.team === lead?.team);
  const teamTasks = tasks.filter((t) => t.team === lead?.team);

  return (
    <div className="tl-wrap">
      <style>
        {`
       
        `}
      </style>
      {lead && <h1 className="main-heading">Team Lead Dashboard</h1>}
      
      {!lead ? (
        // Login Page
        <div className="login-panel">
          <h2>Team Lead Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Team Lead ID"
              value={loginData.id}
              onChange={(e) => setLoginData((p) => ({ ...p, id: e.target.value }))}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
              required
            />
            <button type="submit" className="btn primary">
              Login
            </button>
            {error && <div className="error">{error}</div>}
            {loading && <div className="loading">Loading...</div>}
          </form>
        </div>
      ) : (
        // Dashboard
        <div className="dashboard">
          <header className="header">
            <div>
              <h1>Welcome, {lead.name}</h1>
              <div>
                <span>ID: {lead.id || lead._id} •</span>
                <span>Team: {lead.team} •</span>
                <span>Email: {lead.email}</span>
              </div>
            </div>
            <div>
              <button className="btn outline" onClick={fetchData} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button className="btn danger" onClick={logout}>
                Logout
              </button>
            </div>
          </header>
          {error && <div className="error" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
          
          <main className="grid">
            {/* Employees Section */}
            <section className="section-card">
              <header className="card-head">
                <h3>Employees ({teamEmployees.length})</h3>
                <button
                  onClick={bulkDeleteEmployees}
                  disabled={!selectedEmployees.length}
                  className="btn warn small"
                >
                  Bulk Delete
                </button>
              </header>
              <div className="list custom-scrollbar">
                {teamEmployees.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No employees found for your team.
                  </p>
                ) : (
                  teamEmployees.map((emp) => {
                    const id = emp._id || emp.id;
                    return (
                      <div key={id} className="list-item">
                        <div className="left">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(id)}
                            onChange={() => toggleSelectEmployee(id)}
                          />
                          <div>
                            <div style={{ fontWeight: 500 }}>{emp.name}</div>
                            <div style={{ color: '#6b7280' }}>
                              {emp.role} • {emp.email}
                            </div>
                          </div>
                        </div>
                        <div className="right">
                          <button className="btn small primary" onClick={() => openEditEmployee(emp)}>
                            Edit
                          </button>
                          <button className="btn danger small" onClick={() => deleteEmployee(id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Tasks Section */}
            <section className="section-card">
              <header className="card-head">
                <h3>Tasks ({teamTasks.length})</h3>
                <button
                  onClick={bulkDeleteTasks}
                  disabled={!selectedTasks.length}
                  className="btn warn small"
                >
                  Bulk Delete
                </button>
              </header>
              <div className="list custom-scrollbar">
                {teamTasks.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No tasks found for your team.
                  </p>
                ) : (
                  teamTasks.map((task) => {
                    const id = task._id || task.id;
                    return (
                      <div key={id} className="task-item">
                        <div className="task-left">
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(id)}
                            onChange={() => toggleSelectTask(id)}
                          />
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {task.taskName}
                            </div>
                            <div style={{ color: '#6b7280' }}>
                              Assigned: {task.assignedTo || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="task-right">
                          
                          <div className="progress-mini" title={`${statusToProgress(task.status)}%`}>
                            <div
                              className="fill"
                              style={{ width: `${statusToProgress(task.status)}%` }}
                            />
                          </div>
                          <button className="btn danger small" onClick={() => deleteTask(id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* Employee Edit Modal */}
      {editingEmployee && (
        <div className="modal">
          <div className="modal-card">
            <h3>Edit Employee</h3>
            <input
              value={editingEmployee.name}
              onChange={(e) => handleEmployeeChange("name", e.target.value)}
              placeholder="Name"
            />
            <input
              value={editingEmployee.role}
              onChange={(e) => handleEmployeeChange("role", e.target.value)}
              placeholder="Role"
            />
            <input
              value={editingEmployee.email}
              onChange={(e) => handleEmployeeChange("email", e.target.value)}
              placeholder="Email"
            />
            <input
              value={editingEmployee.team}
              onChange={(e) => handleEmployeeChange("team", e.target.value)}
              placeholder="Team"
            />
            <div>
              <button className="btn primary" onClick={saveEmployee}>
                Save
              </button>
              <button className="btn outline" onClick={closeEditEmployee}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
