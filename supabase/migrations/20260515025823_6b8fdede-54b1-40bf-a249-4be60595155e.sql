INSERT INTO public.user_roles (user_id, role)
VALUES ('ad7afb9c-39f8-4e16-84c1-5f05939810d9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;