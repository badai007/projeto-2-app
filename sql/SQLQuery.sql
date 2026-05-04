
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'todo_db')
BEGIN
    CREATE DATABASE todo_db;
END
GO

USE todo_db;
GO


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


IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'task_status')
BEGIN
    CREATE TABLE task_status (
        id INT PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    );
END
GO


IF NOT EXISTS (SELECT * FROM task_status WHERE id = 0) 
    INSERT INTO task_status (id, name) VALUES (0, 'Pendente');

IF NOT EXISTS (SELECT * FROM task_status WHERE id = 1) 
    INSERT INTO task_status (id, name) VALUES (1, 'Concluída');
GO


IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tasks')
BEGIN
    CREATE TABLE tasks (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description VARCHAR(255),
        user_id INT NOT NULL,
        status_id INT NOT NULL DEFAULT 0,
        task_time VARCHAR(10),
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Tasks_Users FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT FK_Tasks_Status FOREIGN KEY (status_id) REFERENCES task_status(id)
    );
END
GO


IF NOT EXISTS (SELECT * FROM users WHERE email = 'cesar@email.com')
BEGIN
    INSERT INTO users (name, email, password) 
    VALUES ('Cezar', 'cesar@email.com', '$2b$10$ExemploHashDeSenhaSegura');
END
GO


DECLARE @userId INT;
SELECT @userId = id FROM users WHERE email = 'cesar@email.com';

IF @userId IS NOT NULL AND NOT EXISTS (SELECT * FROM tasks WHERE id = '1714580000000')
BEGIN
    INSERT INTO tasks (id, title, description, user_id, status_id, task_time)
    VALUES (
        '1714580000000',
        'Criar o portfólio no GitHub',
        'Subir o projeto do To-Do List',
        @userId,
        0,
        '20:30'
    );
END
GO