import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Admin = () => {
    const [showForm, setShowForm] = useState('viewEmployees');
    const [employees, setEmployees] = useState([]);
    const [teamLeads, setTeamLeads] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedTeamLeads, setSelectedTeamLeads] = useState([]);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // New state for team and employee dropdowns
    const [teams, setTeams] = useState([]);
    const [employeesByTeam, setEmployeesByTeam] = useState({});

    const [employee, setEmployee] = useState({
        id: '', name: '', role: 'Employee', team: '', mobile: '', email: '', address: ''
    });

    const [teamLead, setTeamLead] = useState({
        id: '', name: '', role: 'Team Lead', team: '', experience: 0, salary: 0, mobile: '', email: '', address: ''
    });

    const [task, setTask] = useState({
        taskName: '', deadline: '', team: '', status: 'To Do', assignedTo: ''
    });

    // State for chart data
    const [taskChartData, setTaskChartData] = useState({
        labels: ['To Do', 'In Process', 'Testing', 'Complete'],
        datasets: [{
            label: 'Task Status',
            data: [0, 0, 0, 0],
            backgroundColor: ['#FF6384', '#FFCE56', '#4BC0C0', '#36A2EB'],
            borderColor: ['#FF6384', '#FFCE56', '#4BC0C0', '#36A2EB'],
            borderWidth: 1,
        }],
    });

    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [editingTeamLeadId, setEditingTeamLeadId] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);

    // Fetch all data on component load
    useEffect(() => {
        fetchEmployees();
        fetchTeamLeads();
        fetchTasks();
    }, []);

    // API Calls
    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/employees');
            setEmployees(response.data);
            processEmployeeData(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchTeamLeads = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/teamleads');
            setTeamLeads(response.data);
        } catch (error) {
            console.error('Error fetching team leads:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tasks');
            setTasks(response.data);
            updateTaskChartData(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // New function to process employee data for dropdowns
    const processEmployeeData = (employeeData) => {
        const uniqueTeams = [...new Set(employeeData.map(emp => emp.team))];
        const employeesByTeam = employeeData.reduce((acc, emp) => {
            acc[emp.team] = acc[emp.team] || [];
            acc[emp.team].push(emp);
            return acc;
        }, {});
        setTeams(uniqueTeams);
        setEmployeesByTeam(employeesByTeam);
    };

    // Task Chart Data Update
    const updateTaskChartData = (tasks) => {
        const statusCounts = tasks.reduce((acc, task) => {
            const status = task.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, { 'To Do': 0, 'In Process': 0, 'Testing': 0, 'Complete': 0 });

        setTaskChartData({
            labels: ['To Do', 'In Process', 'Testing', 'Complete'],
            datasets: [{
                label: 'Task Status',
                data: [
                    statusCounts['To Do'],
                    statusCounts['In Process'],
                    statusCounts['Testing'],
                    statusCounts['Complete']
                ],
                backgroundColor: ['#FF6384', '#FFCE56', '#4BC0C0', '#36A2EB'],
                borderColor: ['#FF6384', '#FFCE56', '#4BC0C0', '#36A2EB'],
                borderWidth: 1,
            }],
        });
    };

    // Employee Handlers
    const handleAddEmployeeSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...employee, role: 'Employee', experience: null, salary: null };
            await axios.post('http://localhost:5000/api/employees', data);
            alert('Employee added successfully!');
            setEmployee({ id: '', name: '', role: 'Employee', team: '', mobile: '', email: '', address: '' });
            fetchEmployees();
            setShowForm('viewEmployees');
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Failed to add employee. Check if ID or email already exists.');
        }
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/employees/${editingEmployeeId}`, employee);
            alert('Employee updated successfully!');
            setEditingEmployeeId(null);
            setEmployee({ id: '', name: '', role: 'Employee', team: '', mobile: '', email: '', address: '' });
            fetchEmployees();
            setShowForm('viewEmployees');
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Failed to update employee.');
        }
    };

    const handleDeleteEmployee = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/employees/${id}`);
            alert('Employee deleted successfully!');
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Failed to delete employee.');
        }
    };

    const handleBulkDeleteEmployees = async () => {
        if (selectedEmployees.length === 0) return;
        try {
            await axios.delete('http://localhost:5000/api/employees', { data: { employeeIds: selectedEmployees } });
            alert('Selected employees deleted successfully!');
            setSelectedEmployees([]);
            fetchEmployees();
        } catch (error) {
            console.error('Error bulk deleting employees:', error);
            alert('Failed to delete selected employees.');
        }
    };

    // Team Lead Handlers
    const handleAddTeamLeadSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...teamLead, role: 'Team Lead' };
            await axios.post('http://localhost:5000/api/teamleads', data);
            alert('Team Lead added successfully!');
            setTeamLead({ id: '', name: '', role: 'Team Lead', team: '', experience: 0, salary: 0, mobile: '', email: '', address: '' });
            fetchTeamLeads();
            setShowForm('viewTeamLeads');
        } catch (error) {
            console.error('Error adding team lead:', error);
            alert('Failed to add team lead. Check if ID or email already exists.');
        }
    };

    const handleUpdateTeamLead = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/teamleads/${editingTeamLeadId}`, teamLead);
            alert('Team Lead updated successfully!');
            setEditingTeamLeadId(null);
            setTeamLead({ id: '', name: '', role: 'Team Lead', team: '', experience: 0, salary: 0, mobile: '', email: '', address: '' });
            fetchTeamLeads();
            setShowForm('viewTeamLeads');
        } catch (error) {
            console.error('Error updating team lead:', error);
            alert('Failed to update team lead.');
        }
    };

    const handleDeleteTeamLead = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/teamleads/${id}`);
            alert('Team Lead deleted successfully!');
            fetchTeamLeads();
        } catch (error) {
            console.error('Error deleting team lead:', error);
            alert('Failed to delete team lead.');
        }
    };

    const handleBulkDeleteTeamLeads = async () => {
        if (selectedTeamLeads.length === 0) return;
        try {
            await axios.delete('http://localhost:5000/api/teamleads', { data: { teamLeadIds: selectedTeamLeads } });
            alert('Selected team leads deleted successfully!');
            setSelectedTeamLeads([]);
            fetchTeamLeads();
        } catch (error) {
            console.error('Error bulk deleting team leads:', error);
            alert('Failed to delete selected team leads.');
        }
    };

    // Task Handlers
    const handleAssignTaskSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/tasks', task);
            alert('Task assigned successfully!');
            setTask({ taskName: '', deadline: '', team: '', status: 'To Do', assignedTo: '' });
            fetchTasks();
            setShowForm('viewTasks');
        } catch (error) {
            console.error('Error assigning task:', error);
            alert('Failed to assign task.');
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/tasks/${editingTaskId}`, task);
            alert('Task updated successfully!');
            setEditingTaskId(null);
            setTask({ taskName: '', deadline: '', team: '', status: 'To Do', assignedTo: '' });
            fetchTasks();
            setShowForm('viewTasks');
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task.');
        }
    };

    const handleUpdateTaskStatus = async (id, newStatus) => {
        try {
            const taskToUpdate = tasks.find(t => t._id === id);
            if (taskToUpdate) {
                const updatedTask = { ...taskToUpdate, status: newStatus };
                await axios.put(`http://localhost:5000/api/tasks/${id}`, updatedTask);
                alert('Task status updated successfully!');
                fetchTasks();
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('Failed to update task status.');
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${id}`);
            alert('Task deleted successfully!');
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task.');
        }
    };

    const handleBulkDeleteTasks = async () => {
        if (selectedTasks.length === 0) return;
        try {
            await axios.delete('http://localhost:5000/api/tasks', { data: { taskIds: selectedTasks } });
            alert('Selected tasks deleted successfully!');
            setSelectedTasks([]);
            fetchTasks();
        } catch (error) {
            console.error('Error bulk deleting tasks:', error);
            alert('Failed to delete selected tasks.');
        }
    };

    // Other Functions
    const handleNavClick = (formName) => {
        setShowForm(formName);
        setSearchQuery('');
    };

    const handleEditEmployee = (emp) => {
        setEmployee(emp);
        setEditingEmployeeId(emp._id);
        setShowForm('addEmployee');
    };

    const handleEditTeamLead = (lead) => {
        setTeamLead(lead);
        setEditingTeamLeadId(lead._id);
        setShowForm('addTeamLead');
    };

    const handleEditTask = (t) => {
        setTask({
            ...t,
            deadline: t.deadline.split('T')[0] // Format date for input type="date"
        });
        setEditingTaskId(t._id);
        setShowForm('assignTask');
    };

    const handleToggleEmployeeSelect = (id) => {
        setSelectedEmployees(prev =>
            prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
        );
    };

    const handleToggleTeamLeadSelect = (id) => {
        setSelectedTeamLeads(prev =>
            prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]
        );
    };

    const handleToggleTaskSelect = (id) => {
        setSelectedTasks(prev =>
            prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
        );
    };

    const filteredEmployees = employees.filter(emp =>
        (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredTeamLeads = teamLeads.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTasks = tasks.filter(t =>
        t.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Task Progress Bar Component
    const TaskProgressBar = ({ status }) => {
        let percentage = 0;
        let color = '#ccc';
        let statusText = status;

        switch (status) {
            case 'To Do':
                percentage = 25;
                color = '#FF6384';
                statusText = 'To Do';
                break;
            case 'In Process':
                percentage = 50;
                color = '#FFCE56';
                statusText = 'Process';
                break;
            case 'Testing':
                percentage = 75;
                color = '#4BC0C0';
                statusText = 'Testing';
                break;
            case 'Complete':
                percentage = 100;
                color = '#36A2EB';
                statusText = 'Complete';
                break;
            default:
                break;
        }

        return (
            <div className="progress-bar-container">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                ></div>
                <span className="progress-bar-text">{statusText} </span>
            </div>
        );
    };

    return (
        <div className={`admin-dashboard ${darkMode ? 'dark-mode' : ''}`}>
            <div className="sidebar">
                <h2 className="sidebar-title">Admin Panel</h2>
                <ul className="nav-links">
                    <li className={showForm === 'addEmployee' ? 'active' : ''} onClick={() => handleNavClick('addEmployee')}>Add Employee</li>
                    <li className={showForm === 'addTeamLead' ? 'active' : ''} onClick={() => handleNavClick('addTeamLead')}>Add Team Lead</li>
                    <li className={showForm === 'assignTask' ? 'active' : ''} onClick={() => handleNavClick('assignTask')}>Assign Task</li>
                    <li className={showForm === 'viewEmployees' ? 'active' : ''} onClick={() => handleNavClick('viewEmployees')}>View Employees</li>
                    <li className={showForm === 'viewTeamLeads' ? 'active' : ''} onClick={() => handleNavClick('viewTeamLeads')}>View Team Leads</li>
                    <li className={showForm === 'viewTasks' ? 'active' : ''} onClick={() => handleNavClick('viewTasks')}>View Tasks</li>
                </ul>
            </div>

            <div className="main-content">
                {showForm === 'addEmployee' && (
                    <form onSubmit={editingEmployeeId ? handleUpdateEmployee : handleAddEmployeeSubmit} className="employee-form">
                        <h3 className="form-title">{editingEmployeeId ? 'Update Employee' : 'Add New Employee'}</h3>
                        <div className="form-group"><label>Employee ID:</label><input type="text" name="id" value={employee.id} onChange={(e) => setEmployee({ ...employee, id: e.target.value })} required /></div>
                        <div className="form-group"><label>Employee Name:</label><input type="text" name="name" value={employee.name} onChange={(e) => setEmployee({ ...employee, name: e.target.value })} required /></div>
                        <div className="form-group"><label>Team:</label><input type="text" name="team" value={employee.team} onChange={(e) => setEmployee({ ...employee, team: e.target.value })} required /></div>
                        <div className="form-group"><label>Mobile No:</label><input type="text" name="mobile" value={employee.mobile} onChange={(e) => setEmployee({ ...employee, mobile: e.target.value })} required /></div>
                        <div className="form-group"><label>Mail ID:</label><input type="email" name="email" value={employee.email} onChange={(e) => setEmployee({ ...employee, email: e.target.value })} required /></div>
                        <div className="form-group"><label>Address:</label><textarea name="address" value={employee.address} onChange={(e) => setEmployee({ ...employee, address: e.target.value })} required /></div>
                        <button type="submit" className="submit-btn">{editingEmployeeId ? 'Update Employee' : 'Submit'}</button>
                    </form>
                )}

                {showForm === 'addTeamLead' && (
                    <form onSubmit={editingTeamLeadId ? handleUpdateTeamLead : handleAddTeamLeadSubmit} className="team-lead-form">
                        <h3 className="form-title">{editingTeamLeadId ? 'Update Team Lead' : 'Add New Team Lead'}</h3>
                        <div className="form-group"><label>Employee ID:</label><input type="text" name="id" value={teamLead.id} onChange={(e) => setTeamLead({ ...teamLead, id: e.target.value })} required /></div>
                        <div className="form-group"><label>Name:</label><input type="text" name="name" value={teamLead.name} onChange={(e) => setTeamLead({ ...teamLead, name: e.target.value })} required /></div>
                        <div className="form-group"><label>Team:</label><input type="text" name="team" value={teamLead.team} onChange={(e) => setTeamLead({ ...teamLead, team: e.target.value })} required /></div>
                        <div className="form-group"><label>Experience (in years):</label><input type="number" name="experience" value={teamLead.experience} onChange={(e) => setTeamLead({ ...teamLead, experience: e.target.value })} required /></div>
                        <div className="form-group"><label>Salary:</label><input type="number" name="salary" value={teamLead.salary} onChange={(e) => setTeamLead({ ...teamLead, salary: e.target.value })} required /></div>
                        <div className="form-group"><label>Mobile No:</label><input type="text" name="mobile" value={teamLead.mobile} onChange={(e) => setTeamLead({ ...teamLead, mobile: e.target.value })} required /></div>
                        <div className="form-group"><label>Mail ID:</label><input type="email" name="email" value={teamLead.email} onChange={(e) => setTeamLead({ ...teamLead, email: e.target.value })} required /></div>
                        <div className="form-group"><label>Address:</label><textarea name="address" value={teamLead.address} onChange={(e) => setTeamLead({ ...teamLead, address: e.target.value })} required /></div>
                        <button type="submit" className="submit-btn">{editingTeamLeadId ? 'Update Team Lead' : 'Submit'}</button>
                    </form>
                )}

                {showForm === 'assignTask' && (
                    <form onSubmit={editingTaskId ? handleUpdateTask : handleAssignTaskSubmit} className="task-form">
                        <h3 className="form-title">{editingTaskId ? 'Update Task' : 'Assign Task'}</h3>
                        <div className="form-group"><label>Task Name:</label><input type="text" name="taskName" value={task.taskName} onChange={(e) => setTask({ ...task, taskName: e.target.value })} required /></div>
                        <div className="form-group"><label>Deadline:</label><input type="date" name="deadline" value={task.deadline} onChange={(e) => setTask({ ...task, deadline: e.target.value })} required /></div>
                        <div className="form-group">
                            <label>Select Team:</label>
                            <select name="team" value={task.team} onChange={(e) => setTask({ ...task, team: e.target.value, assignedTo: '' })} required>
                                <option value="">--Select a Team--</option>
                                {teams.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>
                        </div>
                        {task.team && (
                            <div className="form-group">
                                <label>Assign to Employee:</label>
                                <select name="assignedTo" value={task.assignedTo} onChange={(e) => setTask({ ...task, assignedTo: e.target.value })} required>
                                    <option value="">--Select an Employee--</option>
                                    {employeesByTeam[task.team]?.map(emp => (
                                        <option key={emp._id} value={emp.name}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    
                        <button type="submit" className="submit-btn">{editingTaskId ? 'Update Task' : 'Add Task'}</button>
                    </form>
                )}
                <>
                {showForm === 'viewEmployees' && (
                    <div className="table-view-container">
                        <h1 className="main-heading">Admin Dashboard</h1>
                        <h3 className="table-title">Employee Details</h3>
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="search-bar"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {selectedEmployees.length > 0 && (
                            <button className="bulk-delete-btn" onClick={handleBulkDeleteEmployees}>Bulk Delete ({selectedEmployees.length})</button>
                        )}
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" onChange={() => setSelectedEmployees(selectedEmployees.length === filteredEmployees.length ? [] : filteredEmployees.map(emp => emp._id))} checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0} /></th>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Team</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp._id}>
                                        <td><input type="checkbox" checked={selectedEmployees.includes(emp._id)} onChange={() => handleToggleEmployeeSelect(emp._id)} /></td>
                                        <td>{emp.id}</td>
                                        <td>{emp.name}</td>
                                        <td>{emp.team}</td>
                                        <td>{emp.email}</td>
                                        <td>
                                            <button className="edit-btn" onClick={() => handleEditEmployee(emp)}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteEmployee(emp._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showForm === 'viewTeamLeads' && (
                    <div className="table-view-container">
                        <h1 className="main-heading">Admin Dashboard</h1>
                        <h3 className="table-title">Team Lead Details</h3>
                        <input
                            type="text"
                            placeholder="Search team leads..."
                            className="search-bar"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {selectedTeamLeads.length > 0 && (
                            <button className="bulk-delete-btn" onClick={handleBulkDeleteTeamLeads}>Bulk Delete ({selectedTeamLeads.length})</button>
                        )}
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" onChange={() => setSelectedTeamLeads(selectedTeamLeads.length === filteredTeamLeads.length ? [] : filteredTeamLeads.map(lead => lead._id))} checked={selectedTeamLeads.length === filteredTeamLeads.length && filteredTeamLeads.length > 0} /></th>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Team</th>
                                    <th>Experience</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeamLeads.map((lead) => (
                                    <tr key={lead._id}>
                                        <td><input type="checkbox" checked={selectedTeamLeads.includes(lead._id)} onChange={() => handleToggleTeamLeadSelect(lead._id)} /></td>
                                        <td>{lead.id}</td>
                                        <td>{lead.name}</td>
                                        <td>{lead.team}</td>
                                        <td>{lead.experience} years</td>
                                        <td>
                                            <button className="edit-btn" onClick={() => handleEditTeamLead(lead)}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteTeamLead(lead._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showForm === 'viewTasks' && (
                    <div className="table-view-container">
                        <h1 className="main-heading">Admin Dashboard</h1>
                        <h3 className="table-title">Task Details</h3>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="search-bar"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {selectedTasks.length > 0 && (
                            <button className="bulk-delete-btn" onClick={handleBulkDeleteTasks}>Bulk Delete ({selectedTasks.length})</button>
                        )}
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0} onChange={() => setSelectedTasks(selectedTasks.length === filteredTasks.length ? [] : filteredTasks.map(t => t._id))} /></th>
                                    <th>Task Name</th>
                                    <th>Deadline</th>
                                    <th>Team</th>
                                    <th>Assigned To</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map((t) => (
                                    <tr key={t._id}>
                                        <td><input type="checkbox" checked={selectedTasks.includes(t._id)} onChange={() => handleToggleTaskSelect(t._id)} /></td>
                                        <td>{t.taskName}</td>
                                        <td>{new Date(t.deadline).toLocaleDateString()}</td>
                                        <td>{t.team}</td>
                                        <td>{t.assignedTo}</td>
                                        <td>
                                            
                                            <TaskProgressBar status={t.status} />
                                        </td>
                                        <td>
                                            <button className="edit-btn" onClick={() => handleEditTask(t)}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDeleteTask(t._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                </>
            </div>
        </div>
    );
};

export default Admin;