-- Criação e seleção do banco de dados
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'todo_db')
BEGIN
    CREATE DATABASE todo_db;
END
GO

USE todo_db;
GO

-- 1. Tabela de Usuários
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT PRIMARY KEY IDENTITY(1,1),
        name VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(MAX) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- 2. Tabela de Status (Pendente / Concluída - Congruente ao JS)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'task_status')
BEGIN
    CREATE TABLE task_status (
        id INT PRIMARY KEY, -- 0 para Pendente, 1 para Concluída
        name VARCHAR(50) NOT NULL
    );
    
    -- Inserindo os status básicos
    INSERT INTO task_status (id, name) VALUES (0, 'Pendente');
    INSERT INTO task_status (id, name) VALUES (1, 'Concluída');
END
GO

-- 3. Tabela de Tarefas (Aperfeiçoada para conter ID textual/único do JS e Horário)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tasks')
BEGIN
    CREATE TABLE tasks (
        id VARCHAR(50) PRIMARY KEY, -- Mapeia o Date.now().toString() do JS
        title VARCHAR(150) NOT NULL,
        description VARCHAR(255),
        user_id INT NOT NULL,
        status_id INT NOT NULL DEFAULT 0, -- 0 = Pendente por padrão
        task_time VARCHAR(10),             -- Armazena o horário (ex: '15:30')
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Tasks_Users FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT FK_Tasks_Status FOREIGN KEY (status_id) REFERENCES task_status(id)
    );
END
GO

-- 4. Inserindo dados de teste (Usuário Cezar)
IF NOT EXISTS (SELECT * FROM users WHERE email = 'cesar@email.com')
BEGIN
    INSERT INTO users (name, email, password) 
    VALUES ('Cezar', 'cesar@email.com', '$2b$10$ExemploHashDeSenhaSegura');
END
GO

-- 5. Exemplo de inserção de tarefa (Simulando o input do JS)
DECLARE @userId INT;
SELECT @userId = id FROM users WHERE email = 'cesar@email.com';

IF NOT EXISTS (SELECT * FROM tasks WHERE title = 'Criar o portfólio no GitHub')
BEGIN
    INSERT INTO tasks (id, title, description, user_id, status_id, task_time)
    VALUES (
        '1714580000000', -- Exemplo de timestamp único simulado
        'Criar o portfólio no GitHub',
        'Subir o projeto do To-Do List',
        @userId,
        0,
        '20:30'
    );
END
GO
