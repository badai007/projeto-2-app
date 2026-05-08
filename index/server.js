const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    user: 'sa', 
    password: 'Cb26102007@#', 
    server: 'localhost', 
    database: 'todo_db',
    options: {
        encrypt: false, 
        trustServerCertificate: true,
        enableArithAbort: true
    },
    port: 1433
};

// Rota para buscar as tarefas
app.get('/api/tasks/:userId', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('userId', sql.Int, req.params.userId)
            .query("SELECT id, title, description, status FROM tasks WHERE user_id = @userId");
        
        res.json(result.recordset); // Retorna a lista de tarefas
    } catch (err) {
        console.error("Erro no SQL:", err.message);
        res.status(500).json({ error: "Erro ao buscar tarefas" });
    }
});

// Rota de teste
app.get('/api/test', (req, res) => res.json({ message: "Conexão OK!" }));

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));