const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


const dbConfig = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'todo_db',
    user: process.env.DB_USER || 'seu_usuario',
    password: process.env.DB_PASSWORD || 'sua_senha',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

app.get('/api/test', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        res.json({ message: 'Conexão bem-sucedida' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/tasks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query('SELECT * FROM tasks WHERE user_id = @user_id');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/tasks', async (req, res) => {
    try {
        const { id, title, description, user_id, status_id, task_time } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.VarChar(50), id)
            .input('title', sql.VarChar(150), title)
            .input('description', sql.VarChar(255), description)
            .input('user_id', sql.Int, user_id)
            .input('status_id', sql.Int, status_id || 0)
            .input('task_time', sql.VarChar(10), task_time)
            .query(`INSERT INTO tasks (id, title, description, user_id, status_id, task_time) 
                    VALUES (@id, @title, @description, @user_id, @status_id, @task_time)`);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.put('/api/tasks/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status_id } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.VarChar(50), id)
            .input('status_id', sql.Int, status_id)
            .query('UPDATE tasks SET status_id = @status_id WHERE id = @id');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.VarChar(50), id)
            .query('DELETE FROM tasks WHERE id = @id');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));