# AI Log

## 1. Project direction
**Problem:** Establish a commercial visual direction for a construction company without generic template styling.  
**Prompt given:** Build Srinidhi Constructions as a live client simulation with construction-industry tokens and realistic copy.  
**AI solution:** Chose a quiet editorial system: concrete paper, charcoal ink, safety orange, green accent, Manrope body type and Playfair Display emphasis.  
**What you understood:** The brand needs to feel precise and human, not like a property listing portal.  
**What you changed:** Created the responsive navigation, hero, section rhythm, project cards, stats and closing CTA.  
**Final result:** A distinct first-viewport experience with a clear route to work and contact.

## 2. API resilience
**Problem:** The frontend needs to be reviewable before the local PHP/MySQL environment is configured.  
**Prompt given:** Wire React pages to real APIs while keeping the site usable during setup.  
**AI solution:** Added one axios client with API methods and curated fallback content used only when requests fail.  
**What you understood:** Fallbacks should preserve the interface contract, not create a second fake application.  
**What you changed:** Added services, projects, project detail and enquiry wrappers.  
**Final result:** Local UI review works immediately and the same calls switch to the PHP API when available.

## 3. Input safety
**Problem:** Public enquiries must not accept malformed or unsafe data.  
**Prompt given:** Mirror client validation on the server and use consistent JSON envelopes.  
**AI solution:** Added trim/strip-tags sanitation, name/email/phone/subject/message validation, prepared inserts and generic errors.  
**What you understood:** Client checks improve feedback; server checks are the actual boundary.  
**What you changed:** Added `validate.php`, `Response.php` and the enquiry endpoint.  
**Final result:** Invalid requests return 422 with field errors; database failures return generic 500 responses and log details.

## 4. Data model
**Problem:** Projects need filters, galleries, SEO slugs and safe deletion behavior.  
**Prompt given:** Design the MySQL schema around the requested project and enquiry shape.  
**AI solution:** Used unique slugs, filter indexes, separate project images and foreign keys with cascade/set-null behavior.  
**What you understood:** The image relation should be independent so galleries can grow without widening the projects table.  
**What you changed:** Added schema and realistic seed records for Bengaluru.  
**Final result:** The database contract supports public discovery and future admin CRUD.

## 5. Delivery readiness
**Problem:** A handoff needs repeatable setup and API verification.  
**Prompt given:** Include README, Postman environments and deployment-oriented security notes.  
**AI solution:** Documented database import, PHP server, Vite commands, test account, environment variables and launch hardening.  
**What you understood:** A polished UI without an executable setup is not a deliverable.  
**What you changed:** Added `README.md`, Postman collection/environment and robots/sitemap assets.  
**Final result:** Another developer can install, build, import data and smoke-test the public/auth paths.

## 6. Debugging "A database error occurred"
**Problem:** Admin login and the enquiry form both failed with a generic "A database error occurred. Check the server log." message, and a few interactive elements (service links, CTA buttons) appeared unresponsive.
**Prompt given:** Diagnose and fix the DB error and every broken button using the actual project source, not guesses.
**AI solution:** Traced the error to `index.php`'s catch-all `PDOException` handler, which returns the same generic message for every failure mode — connection refused, missing table, missing row, and duplicate key all looked identical to the user. Root cause: `backend/.env` had never been created (only `.env.example` existed), so `db()` was connecting with unverified defaults. Also found the CORS config was missing `PATCH` in `Access-Control-Allow-Methods`, which would silently block the admin enquiry-status-update endpoint once login succeeded.
**What you understood:** A single generic catch block across every DB failure mode makes debugging blind — connection errors, schema errors and constraint errors need different, specific messages.
**What you changed:** Split the `PDOException` handling in `index.php` into connection failures, missing-table errors (1146), duplicate keys (1062) and FK violations (1452), each with an actionable message; added a `GET /api/health` endpoint that reports `.env` presence, DB connectivity, table existence and whether the admin row is seeded; added `PATCH` to the CORS allow-list; created a working `backend/.env`.
**Final result:** Hitting `/api/health` now tells you exactly which setup step is missing instead of a generic 500, and the admin enquiry-status PATCH request is no longer blocked by CORS.
