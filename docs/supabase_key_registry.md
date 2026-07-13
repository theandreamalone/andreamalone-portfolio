Supabase Publishable Key — Deployment Registry
Purpose: track every place the current Supabase publishable key is deployed
so a future key rotation can update all of them without breakage.
Current key ID prefix: sb_publishable_8ad6... (first 4 chars only — never
paste the full key here)
Current status: not rotating (decision made 2026-07-09). Publishable keys
are designed for browser exposure; risk floor is low. Rotate later if any
signal warrants it.

Where the key is used
#LocationWhat it doesHow to update after rotation1Portfolio .env.local (VITE_SUPABASE_PUBLISHABLE_KEY)React app reads case studies, submits contact formEdit .env.local, restart npm run dev2n8n HTTP Request nodes (MDX sync workflows)Sync MDX frontmatter → Supabase RPC callsUpdate apikey header in each HTTP Request node in n8n UI3(add more as they're created)
Where the key is NOT used (do not touch on rotation)

Supabase Edge Functions — use service_role internally via the Supabase
runtime, not the publishable key. No update needed.
Direct SQL Editor queries in Supabase dashboard — authenticated via your
admin login, not a key.

Rotation checklist (for future use)

Supabase dashboard → Project Settings → API → rotate publishable key
Copy new key value
Update every location in the table above, one at a time
After each update, verify:

Portfolio: dev server restart, home page still fetches case studies
n8n: run one workflow manually, confirm sync writes succeed


Delete the old key from any local scratch notes

Rotation triggers (when to rotate)

Key value appears in a public git commit
Key value shared in a public forum or bug report
Suspected malicious activity in Supabase logs
Personal habit / hygiene refresh — every 6-12 months


History

2026-07-09: Key deployed to n8n workflows. .env.local for portfolio
created same day. No rotation performed.