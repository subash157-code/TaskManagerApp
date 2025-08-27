const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Replace with your MongoDB Atlas URI or local connection string
mongoose.connect('mongodb+srv://PETE1:Subash12222@cluster0.yepz59t.mongodb.net/employee-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Could not connect to MongoDB:', err);
});

// Mongoose Schemas & Models
const employeeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['Employee', 'Team Lead'], required: true },
    team: { type: String, required: true },
    experience: { type: Number },
    salary: { type: Number },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true }
});

// Employee Model: maps to the 'employees' collection
const Employee = mongoose.model('Employee', employeeSchema);

// Team Lead Model: maps to a separate 'teamleads' collection
const TeamLead = mongoose.model('TeamLead', employeeSchema, 'teamleads');

const taskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    deadline: { type: Date, required: true },
   team: {
        type: String,
        required: true,
    },
    assignedTo: {
        type: String,
        required: true,
    },
    status: { type: String, enum: ['To Do', 'In Process', 'Testing', 'Complete'], default: 'To Do' }
});
const Task = mongoose.model('Task', taskSchema);

// API Endpoints

// Employees
// GET all employees

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});
app.get('/api/employees', async (req, res) => {
    try {
        const { role } = req.query;
        const employees = role ? await Employee.find({ role }) : await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// POST a new employee
app.post('/api/employees', async (req, res) => {
    try {
        const employee = new Employee(req.body);
        const newEmployee = await employee.save();
        res.status(201).json(newEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// PUT to update an employee
app.put('/api/employees/:id', async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.json(updatedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// DELETE an employee by id
app.delete('/api/employees/:id', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Bulk DELETE employees
app.delete('/api/employees', async (req, res) => {
    try {
        const { employeeIds } = req.body;
        if (!employeeIds || !Array.isArray(employeeIds)) return res.status(400).json({ message: 'Invalid request. An array of employee IDs is required.' });
        const result = await Employee.deleteMany({ _id: { $in: employeeIds } });
        res.status(200).json({ message: `${result.deletedCount} employees deleted successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Team Leads
// GET all team leads
app.get('/api/teamleads', async (req, res) => {
    try {
        const teamLeads = await TeamLead.find();
        res.json(teamLeads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// POST a new team lead
app.post('/api/teamleads', async (req, res) => {
    try {
        const teamLead = new TeamLead({ ...req.body, role: 'Team Lead' });
        const newTeamLead = await teamLead.save();
        res.status(201).json(newTeamLead);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// PUT to update a team lead
app.put('/api/teamleads/:id', async (req, res) => {
    try {
        const updatedTeamLead = await TeamLead.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedTeamLead) return res.status(404).json({ message: 'Team Lead not found' });
        res.json(updatedTeamLead);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// DELETE a team lead by id
app.delete('/api/teamleads/:id', async (req, res) => {
    try {
        const deletedTeamLead = await TeamLead.findByIdAndDelete(req.params.id);
        if (!deletedTeamLead) return res.status(404).json({ message: 'Team Lead not found' });
        res.status(200).json({ message: 'Team Lead deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Bulk DELETE team leads
app.delete('/api/teamleads', async (req, res) => {
    try {
        const { teamLeadIds } = req.body;
        if (!teamLeadIds || !Array.isArray(teamLeadIds)) return res.status(400).json({ message: 'Invalid request. An array of team lead IDs is required.' });
        const result = await TeamLead.deleteMany({ _id: { $in: teamLeadIds } });
        res.status(200).json({ message: `${result.deletedCount} team leads deleted successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Tasks & Task Status
// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// POST a new task
app.post('/api/tasks', async (req, res) => {
    const task = new Task(req.body);
    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// PUT to update a task (including status)
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// DELETE a task by id
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Bulk DELETE tasks
app.delete('/api/tasks', async (req, res) => {
    try {
        const { taskIds } = req.body;
        if (!taskIds || !Array.isArray(taskIds)) return res.status(400).json({ message: 'Invalid request. An array of task IDs is required.' });
        const result = await Task.deleteMany({ _id: { $in: taskIds } });
        res.status(200).json({ message: `${result.deletedCount} tasks deleted successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
