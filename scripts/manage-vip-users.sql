-- Script SQL para gestionar usuarios VIP
-- Ejecutar después de crear la tabla user_subscriptions

-- 1. Primero, buscar el User ID de Calin en Clerk (necesitarás reemplazar con el ID real)
-- SELECT * FROM user_levels WHERE user_id LIKE '%calin%' OR user_id LIKE '%Calin%';

-- 2. Una vez que tengas el User ID correcto, ejecuta esto para hacer a Calin VIP:
-- IMPORTANTE: Reemplaza 'USER_ID_DE_CALIN_AQUI' con el User ID real de Clerk

INSERT INTO user_subscriptions (
    id,
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    plan,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
) VALUES (
    'calin_vip_' || EXTRACT(EPOCH FROM NOW())::text, -- ID único
    'USER_ID_DE_CALIN_AQUI', -- Reemplazar con el User ID real de Calin
    'cus_test_calin_vip', -- Customer ID de prueba
    'sub_test_calin_vip', -- Subscription ID de prueba
    'price_annual_test', -- Price ID de prueba
    'annual', -- Plan anual
    'active', -- Estado activo
    NOW(), -- Empieza ahora
    NOW() + INTERVAL '1 year', -- Termina en 1 año
    'false', -- No cancelar al final del período
    NOW(), -- Creado ahora
    NOW() -- Actualizado ahora
) ON CONFLICT (user_id) DO UPDATE SET
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_price_id = EXCLUDED.stripe_price_id,
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    updated_at = NOW();

-- 3. Verificar que se creó correctamente:
-- SELECT * FROM user_subscriptions WHERE user_id = 'USER_ID_DE_CALIN_AQUI';

-- 4. Para ver todos los usuarios VIP activos:
-- SELECT 
--     user_id,
--     plan,
--     status,
--     current_period_end,
--     EXTRACT(DAYS FROM (current_period_end - NOW())) as days_remaining
-- FROM user_subscriptions 
-- WHERE status = 'active' AND current_period_end > NOW();

-- 5. Para quitar VIP a alguien (si es necesario):
-- UPDATE user_subscriptions 
-- SET status = 'canceled', updated_at = NOW() 
-- WHERE user_id = 'USER_ID_AQUI';