/*
# Fix Table Grants — Least Privilege

The anon role had full CRUD grants on categories, courses, and modules.
RLS policies block the writes, but the grants are still overly permissive.

## Fix
- anon: SELECT only on public-read tables (categories, courses, modules, reviews).
- anon: INSERT only on promotions (so unauthenticated users can submit requests).
- anon: no access to course_interactions or profiles (authenticated-only).
- authenticated: keeps CRUD where policies allow.
*/

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES ON categories FROM anon;
GRANT SELECT ON categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON categories TO authenticated;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES ON courses FROM anon;
GRANT SELECT ON courses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON courses TO authenticated;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES ON modules FROM anon;
GRANT SELECT ON modules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON modules TO authenticated;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES ON reviews FROM anon;
GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT ON reviews TO authenticated;
GRANT UPDATE, DELETE ON reviews TO authenticated;

REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES ON course_interactions FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON course_interactions TO authenticated;

REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES ON profiles FROM anon;
GRANT SELECT, UPDATE ON profiles TO authenticated;

REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, SELECT ON promotions FROM anon;
GRANT INSERT ON promotions TO anon, authenticated;
GRANT SELECT, UPDATE ON promotions TO authenticated;
