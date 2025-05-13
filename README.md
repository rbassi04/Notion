# Features Linked to Supabase:

<table>
  <tr>
    <th>Feature</th>
    <th>What You'll Learn</th>
  </tr>
  <tr>
    <td>Authentication</td>
    <td>Email signup/login, magic links, OAuth (Google, GitHub), password reset</td>
  </tr>
  <tr>
    <td>Database</td>
    <td>Schema design (users, documents, memberships tables)
Row Level Security (RLS)	Only owners/collaborators can read/write their docs</td>
  </tr>
  <tr>
    <td>Realtime</td>
    <td>Live editing or "user X is typing..."</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>Upload file attachments (images, PDFs) to Supabase Storage</td>
  </tr>
  <tr>
    <td>Edge Functions</td>
    <td>Automate backups, run scheduled tasks</td>
  </tr>
  <tr>
    <td>Policies</td>
    <td>Create secure, fine-grained access control</td>
  </tr>
  <tr>
    <td>Client Libraries</td>
    <td>Practice using Supabase JS SDK fully</td>
  </tr>
  <tr>
    <td>Error handling</td>
    <td>Building robust login/signup forms, dealing with session expiry</td>
  </tr>
  <tr>
    <td>Deployment</td>
    <td>Push a live, production-grade app</td>
  </tr>
</table>


## 🗓 Week 2: Database + CRUD Documents
* Create a documents table:
  * `id`
  * `user_id`
  * `title`
  * `content`
  * `created_at`
  * `updated_at`
* Implement Create / Read / Update / Delete documents.
* Show list of docs after login.
* Clicking a document opens an editor.

✅ Skills practiced: Supabase database queries, tables, CRUD operations.

## 🗓 Week 3: Row Level Security (RLS)
* Enable RLS on documents table.
* Write policies:
  * Only owner (user_id) can read/write/delete.
* Test that users cannot access others' documents even with manual API calls.

✅ Skills practiced: Critical for production apps. Learn how to lock down your database.

## 🗓 Week 4: Realtime Collaboration (Optional, fun)
* Set up Supabase Realtime subscriptions.
* Listen for document updates in real time.
* Show "User is editing..." if someone else is in the document.
* (Advanced) Build live typing indicator.

✅ Skills practiced: Websockets, realtime databases, presence systems.

## 🗓 Week 5: File Uploads (Supabase Storage)
* Add ability to upload images/files inside a document.
* Use Supabase Storage Buckets to store files.
* Save file URLs in the document content.
* Display uploaded images inside the editor.

✅ Skills practiced: Storage API, file uploads, security for file access.

## 🗓 Week 6: Edge Functions (Advanced/Optional)
* Write a simple Edge Function to:

  * Automatically backup documents daily
  * Send a notification (e.g., email or log) when backup succeeds

* Deploy Edge Functions through Supabase CLI.

✅ Skills practiced: Serverless functions, scheduled jobs, using Supabase CLI.

## 🗓 Week 7: Polish + Deploy
* Add loading states, error handling, empty screens.

* Make the UI look nice (TailwindCSS, Shadcn UI, or your own design).

* Deploy frontend (Vercel/Netlify) + check Supabase configs (redirect URLs).

* Write a nice README file.

✅ Skills practiced: Production readiness, UX/UI, final deployment.



small text: #a0958e | #cfcfcf
Heading: #d4d4d4
text: #d4d4d4

sidebar: #d4d4d4


# Results

Websocket: 
- useEffect to register
- On change send the change over
- ...




on Unshare: 
- Send to not shared page

on Save:
- send payload