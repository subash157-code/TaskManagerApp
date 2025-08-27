import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Employee.css"; // Import modern CSS

// Base URL for the backend API
const apiBase = "https://taskmanagerapp-backend-9tdi.onrender.com/api";

// Helper function to map task status to a progress percentage
const statusToProgress = (status) => {
  switch (status) {
    case "To Do": return 25;
    case "In Process": return 50;
    case "Testing": return 75;
    case "Complete": return 100;
    default: return 0;
  }
};

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loginData, setLoginData] = useState({ id: "", email: "" });
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Function to fetch both employees and tasks from the backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, taskRes] = await Promise.all([
        axios.get(`${apiBase}/employees`),
        axios.get(`${apiBase}/tasks`),
      ]);

      setEmployees(empRes.data || []);
      setTasks(taskRes.data || []);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch employees or tasks. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Fetch data only once on initial component mount

  // Handles the login form submission
  const handleLogin = (e) => {
    e.preventDefault();

    // Find the employee by matching either ID or email
    const found = employees.find(
      (emp) =>
        (emp.id?.toString().trim() === loginData.id.trim() ||
        emp._id?.toString().trim() === loginData.id.trim()) &&
        emp.email?.toLowerCase() === loginData.email.trim().toLowerCase()
    );

    if (found) {
      setEmployee(found);
      setError("");
    } else {
      setError("Invalid Employee ID or Email");
    }
  };

  // Handles the logout functionality
  const logout = () => {
    setEmployee(null);
    setLoginData({ id: "", email: "" });
    setError("");
  };

  // Handles updating a task's status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${apiBase}/tasks/${taskId}`, { status: newStatus });
      // After a successful update, re-fetch the tasks to get the latest data
      await fetchData();
    } catch (error) {
      console.error("Error updating task status:", error);
      setError("Failed to update task status.");
    }
  };

  // Filter tasks to show only those assigned to the logged-in employee
  const myTasks = tasks.filter(
    (t) => t.assignedTo?.toLowerCase() === employee?.name?.toLowerCase()
  );

  if (loading) return <div className="loading">Loading data...</div>;

  return (
    <div className="employee-wrap">
      {!employee ? (
        // Login Panel
        
        <div className="login-panel card">
          <h2 className="title">Employee Login</h2>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="text"
              placeholder="Employee ID"
              value={loginData.id}
              onChange={(e) =>
                setLoginData((prev) => ({ ...prev, id: e.target.value }))
              }
              required
              className="input-field"
            />
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              className="input-field"
            />
            <button type="submit" className="btn primary">
              Login
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      ) : (
        // Employee Dashboard
        <>
         <h1 className="main-heading">Employee Dashboard</h1>
        <div className="dashboard">
          <div className="header">
            <div className="employee-info">
              <h1>Welcome, {employee.name}</h1>
              <p>
                ID: {employee.id || employee._id} • Email: {employee.email} • Team:{" "}
                {employee.team}
              </p>
            </div>
            <button className="btn outline" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="tasks-section">
            <h2>My Tasks ({myTasks.length})</h2>
            {myTasks.length === 0 ? (
              <p>No tasks assigned.</p>
            ) : (
              <div className="task-list">
                {myTasks.map((task) => (
                  <div key={task._id} className="task-item card">
                    <h3 className="task-name">{task.taskName}</h3>
                    <p>
                      Deadline:{" "}
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : "—"}
                    </p>
                    <p>Assign To: {task.team}</p>
                    <div className="task-status">
                      <span>Status:</span>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleUpdateTaskStatus(task._id, e.target.value)
                        }
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Process">In Process</option>
                        <option value="Testing">Testing</option>
                        <option value="Complete">Complete</option>
                      </select>
                      <div
                        className="progress-mini"
                        title={`${statusToProgress(task.status)}%`}
                      >
                        <div
                          className="fill"
                          style={{
                            width: `${statusToProgress(task.status)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default Employee;
