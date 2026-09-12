# Website publishing

The public website is https://trylifetask.com/. Vercel project ID: `prj_wRRkog1V3bJe6nEnGTGh5SYfUzst`, team: `team_UM1LAzFacPInWKVt7DlFgABD`.

After checking website changes locally, deploy the updated static site to production:

```powershell
npx --yes vercel deploy --prod --yes --scope dragos-s-projects-e98f1653
```

Run this from the website directory linked to the project. No framework or build step is required. Verify the public domain in a fresh browser context, including mobile layout and legal/support links. Use the production domain for sharing; do not add a section hash.

The user has chosen production updates for future approved website work rather than separate review URLs. Keep source history in Git. Old Vercel deployments were removed after the September 12, 2026 production update was verified; their unique URLs no longer serve review copies.
