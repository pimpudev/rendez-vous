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
2. For a new database, run `supabase/schema.sql`, then run migrations `202610020001_student_intake.sql`, `202610020002_merge_student_registrations.sql`, and `202610020003_admin_delete_reservations.sql` in order from `supabase/migrations/`. If earlier migrations are already applied, run only the missing migrations, still in order. The student view combines applications by e-mail while retaining a separate status for every course. The second migration adds a second marked demo registration for Camille.
3. To preview a type 2 group registration, add an open group for the exact offer name. This sample is optional:

```sql
insert into public.course_groups (offer, group_name, schedule_description)
values ('DELF A1-A2-B1 – 4 compétences', 'Alpha', 'Mercredi de 13 h à 14 h 30');
```

Individual submissions are saved as type 1 / `INDIVIDUEL` / `À VALIDER`. Accepting an open group creates type 2 / `GROUPE` / `À VALIDER`; declining all groups (or having no open group) creates type 3 / `GROUPE` / `LISTE D’ATTENTE`. The selected level, exact availability slots, offer details, and comment are stored with the reservation.

4. Create an admin account in **Authentication > Users**, then add its user UUID to `public.admin_users` from the SQL Editor:

```sql
insert into public.admin_users (user_id) values ('ADMIN_USER_UUID');
```

5. Restart the development server and sign in at `/admin/etudiants` with that account. The `/admin` page links to Étudiants, Groupes, and Planning; Groupes and Planning are placeholders for now.

The public form can only create reservations with their initial statuses. Only signed-in users listed in `admin_users` can read, update, or delete reservations. “Supprimer ce cours” removes one registration; “Supprimer” removes every registration for that student. Never use a Supabase `service_role` or secret key in this app.
