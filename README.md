# Rendez-Vous

Site vitrine pour des cours de français en ligne, avec une landing page moderne, responsive et bilingue.

## Démarrage

```bash
npm install
npm run dev
```

Ensuite, ouvrez http://localhost:3000 dans votre navigateur.

## Production

```bash
npm run build
npm run start
```

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase (database and admin authentication)

## Supabase setup

1. Create a Supabase project and copy `.env.example` to `.env.local`. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with the values shown in **Connect > Framework > Next.js > App Router**.
2. Run `supabase/schema.sql` in the Supabase SQL Editor. It creates the reservations tables, row-level security policies, and a clearly marked demo client.
3. Create an admin account in **Authentication > Users**, then add its user UUID to `public.admin_users` from the SQL Editor:

```sql
insert into public.admin_users (user_id) values ('ADMIN_USER_UUID');
```

4. Restart the development server and sign in at `/admin` with that account.

The public form can only create reservations with their initial statuses. Only signed-in users listed in `admin_users` can read or update them. Never use a Supabase `service_role` or secret key in this app.
