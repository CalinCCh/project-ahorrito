-- Script para investigar y resolver el problema de achievements
-- Ejecuta estos comandos uno por uno para diagnosticar el problema

-- 1. Verificar la estructura de la tabla user_levels
\d user_levels;

-- 2. Verificar los datos actuales en user_levels
SELECT * FROM user_levels LIMIT 5;

-- 3. Verificar si hay algún ID que no sea texto
SELECT id, typeof(id) FROM user_levels WHERE id ~ '^[0-9]+$';

-- 4. Si encuentras problemas, puedes limpiar la tabla:
-- TRUNCATE TABLE user_levels;

-- 5. Verificar la estructura de user_achievements
\d user_achievements;

-- 6. Verificar datos en user_achievements
SELECT * FROM user_achievements LIMIT 5;

-- 7. Si hay problemas con tipos de datos inconsistentes:
-- DROP TABLE IF EXISTS user_levels CASCADE;
-- DROP TABLE IF EXISTS user_achievements CASCADE;
-- Luego ejecuta las migraciones nuevamente
