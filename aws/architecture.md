# AWS Architecture — Library Management System (Capstone)

Region: **ap-south-1 (Mumbai)** · All AWS resources in this region.
Capstone requirement: minimum 5 of EC2, S3, IAM, EBS, VPC, ELB, Auto Scaling — this design uses **all 7**.

## Diagram

```
                    ┌─────────────────────────┐
                    │   Student / Librarian / │
                    │   Admin (browser/phone) │
                    └────────┬────────────────┘
                             │ HTTPS
              ┌──────────────┴──────────────┐
              │  S3 static website hosting  │  Frontend (React build, dist/)
              │  library-frontend           │  + book covers (covers/)
              └──────────────┬──────────────┘
                             │ API calls
                             ▼
              ┌─────────────────────────┐
              │  Application Load       │
              │  Balancer (ALB)         │  Health check: GET /health
              │  public subnets a + b   │  Listener: port 80 → target group
              └────────┬────────────────┘
                       │
              ┌────────┴────────────────┐
              │  Auto Scaling Group     │  min 1 · desired 2 · max 3
              │  EC2 t2.micro ×2        │  Scale out when CPU > 60% (5 min)
              │  Node 20 + Express      │
              │  8 GB gp3 EBS (root)    │
              └────────┬────────────────┘
                       │ MONGO_URI (env, never in git)
                       ▼
              ┌─────────────────────────┐
              │  MongoDB Atlas (M0)     │  Users, Books, Borrows,
              │  (outside the VPC)      │  Seats, SeatBookings
              └─────────────────────────┘

  VPC library-vpc  10.0.0.0/16
    ├─ public subnet a  10.0.1.0/24  (ap-south-1a) — ALB + EC2
    ├─ public subnet b  10.0.2.0/24  (ap-south-1b) — ALB + EC2
    └─ Internet Gateway (no NAT Gateway — keeps the cost at $0 extra)

  IAM: Library-EC2-S3-Role (instance profile) — least privilege, see iam-policy.json:
  only Get/PutObject on <bucket>/covers/*, nothing else.
```

See also `architecture.svg` for the same diagram as an image.

## How each of the 7 services is used

| # | AWS service | How this project uses it | Proof for the presentation |
|---|---|---|---|
| 1 | **Amazon EC2** | Backend API on t2.micro, Node 20 + Express, port 5000, run by pm2 (`npm start` → `node server.js`) | Console → EC2 Instances, `curl <ALB-DNS>/health` |
| 2 | **Amazon S3** | Frontend static hosting (`npm run build` → `dist/` uploaded) + book covers under `covers/` | S3 bucket, static website endpoint, a book cover URL |
| 3 | **AWS IAM** | `Library-EC2-S3-Role` attached to instances; policy in `aws/iam-policy.json` allows only the `covers/` prefix | IAM console → role + policy JSON |
| 4 | **Amazon EBS** | 8 GB gp3 root volume on every EC2 instance (launch template); also holds `backend/uploads/` (book covers) | EC2 → Volumes |
| 5 | **Amazon VPC** | `library-vpc` 10.0.0.0/16, 2 public subnets (ap-south-1a/b), Internet Gateway, route table, security groups (ALB: 80 from anywhere; EC2: 5000 from ALB only; SSH 22 from your IP only) | VPC console → map |
| 6 | **Elastic Load Balancer** | Application Load Balancer, listener 80, target group with health check `GET /health` (healthy = `{"status":"ok"}`) | ALB DNS name in the browser; stop one instance, site stays up |
| 7 | **Auto Scaling** | ASG min 1 / desired 2 / max 3, target-tracking CPU > 60%; `user_data.sh` bootstraps every new instance | ASG console → Activity history shows a new instance launching |

## The app on AWS (what runs where)

- **Backend** (`backend/`, Node/Express/Mongoose): `npm start` → `node server.js`, port `PORT` (default 5000). API base `/api/v1`, health `GET /health` → `{"status":"ok"}`. Env vars: `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` (7d), `CLIENT_URL`.
- **Frontend** (`frontend/`, React 18 + Vite): `npm run build` → `dist/`, uploaded to S3. Build-time env: `VITE_API_URL=http://<ALB-DNS>/api/v1` (must be set **before** `npm run build` — Vite bakes it into the bundle).
- **Database**: MongoDB Atlas M0 (outside AWS). Models: User (student/librarian/admin), Book, Borrow (14-day loan, max 3 active, ₹10/day overdue fine), Seat (30 seats: Floor 1 = 1–15 Reading Hall A, Floor 2 = 16–30 Reading Hall B), SeatBooking (date + Morning/Afternoon/Evening/Full Day, double-booking prevented).
- **Uploads**: book covers are uploaded with multer to `backend/uploads/` (JPG/PNG, max 2 MB) and served at `/uploads`. On EC2 that lives on the EBS volume of that instance — a cover uploaded on one instance is not visible on the other. For the demo this is acceptable; moving covers to the S3 `covers/` prefix is the documented next step (the IAM policy already allows it).

## ⚠️ BLOCKERS — do these BEFORE any AWS deploy

1. **Rotate the leaked Atlas password (BLOCKER).** The Atlas password was committed to the public GitHub repo (`backend/.env` in git history, reported by GitHub secret-scanning and MongoDB Atlas). Rotating is mandatory — deleting the file from the repo does **not** fix it, the old password stays in git history.
   - Atlas → Database Access → edit the DB user → change password → save the **new** password.
   - Update `MONGO_URI` everywhere it is used: Render dashboard (current live backend) and the Launch Template user data for AWS. The old `MONGO_URI` stops working the moment the password changes.
   - Remove the `.env` files from git tracking (`git rm --cached backend/.env frontend/.env`) and confirm `.gitignore` covers `.env` (it does — see below).
   - The local copy of this project has **no** `backend/.env` or `frontend/.env` file present (checked 2026-11-26); only `.env.example` files exist. Do not paste the new password into any file that goes to git.
2. **`CLIENT_URL` must be exact (BLOCKER for login).** The backend CORS setting allows only `process.env.CLIENT_URL`. Set it to the exact frontend URL used for login, with no trailing slash — for AWS that is the S3 static website URL (e.g. `http://library-frontend-<name>.s3-website.ap-south-1.amazonaws.com`). This is the same bug that broke phone login on Vercel: `CLIENT_URL` was set to the protected deployment URL instead of the URL actually opened, so login failed on a CORS mismatch. On AWS, set it in `user_data.sh` before creating the Launch Template.
3. **`/health` only answers after MongoDB connects (known behaviour).** `server.js` connects to MongoDB first and only then starts listening; `src/config/db.js` exits the process if the connection fails. Verified 2026-11-26: with no `MONGO_URI` the server exits with code 1 and `/health` never answers. So the ALB health check depends on Atlas being reachable with the **rotated** URI and network access `0.0.0.0/0` (demo) — if Atlas is unreachable, instances are marked unhealthy and the ALB serves nothing. Test `curl http://localhost:5000/health` on one instance before creating the ASG.

## Deployment steps (in order)

1. **Rotate the Atlas password + update MONGO_URI** (see Blockers above). Then Atlas → Network Access → allow `0.0.0.0/0` for the demo, copy the new `MONGO_URI`.
2. **IAM** — create role `Library-EC2-S3-Role` with the policy in `aws/iam-policy.json` (replace `YOUR-BUCKET-NAME`), create the instance profile.
3. **S3** — create bucket `library-frontend-<your-name>` (Mumbai, Block Public Access **off** only for static hosting), upload `frontend/dist/` + enable static website hosting. Note the website URL — it becomes `CLIENT_URL`.
4. **VPC** — create `library-vpc` 10.0.0.0/16, two public subnets (10.0.1.0/24 in ap-south-1a, 10.0.2.0/24 in ap-south-1b), Internet Gateway, route table, security groups as above.
5. **Launch Template** — AMI Amazon Linux 2023, t2.micro, key pair, IAM instance profile, 8 GB gp3, user data = `aws/user_data.sh` with the new `MONGO_URI`, a fresh `JWT_SECRET` (`openssl rand -hex 32`), and the S3 website URL filled in.
6. **Target Group + ALB** — target group, HTTP 5000, health check path `/health`; ALB in both public subnets, listener 80 → target group.
7. **Auto Scaling Group** — launch template, both subnets, min 1 / desired 2 / max 3, target-tracking scaling CPU > 60%.
8. **Frontend** — set `VITE_API_URL=http://<ALB-DNS>/api/v1`, then `cd frontend && npm run build`, upload `dist/` to S3.
9. **Seed + test** — SSH into an instance (or run locally with the new URI) `npm run seed` (3 demo users, 12 books, 30 seats), then run the 5-minute demo flow in the README.
10. **Delete the same day** — `bash aws/cleanup.sh` (after filling in your names), then verify Billing.

## Cost warning

- **ALB is the expensive part: ~$16–18/month (~₹1,400) if left running.** EC2 t2.micro is free-tier eligible (750 hrs/month for 12 months), EBS 8 GB gp3 is inside the free tier, S3 is pennies.
- **Build, test, demo, delete the same day.** A 4-hour run costs roughly ₹40–50, almost all of it the ALB.
- Anmol's AWS account already showed **$15.38 spent against a $15 budget alert (24 Nov 2026)** — check the Mumbai console for leftover resources from the earlier build *before* starting this one, and set a Budget alarm at $5 before you create the ALB.
- Never leave the ASG at desired 2 overnight: set desired capacity to 0 if you must pause, or run `cleanup.sh`.

## Challenges & solutions (for the presentation)

- **Leaked Atlas credentials in a public repo** — GitHub secret-scanning + Atlas emailed about it. Fix: rotate the password in Atlas, update `MONGO_URI` in every deployment, remove `.env` from git tracking. Lesson: secrets go only in env vars / user data, never in the repo.
- **CORS login failure on the phone** — `CLIENT_URL` pointed at the wrong Vercel deployment URL, so the backend rejected the login. Fix: `CLIENT_URL` must be exactly the frontend URL the user opens. Same rule applies to the S3 website URL on AWS.
- **ALB health check failing** — the backend only listens after MongoDB connects, so a wrong `MONGO_URI` makes every instance unhealthy. Fix: verify the rotated URI and `GET /health` on one instance before creating the ASG.
- **New instances start empty** — `user_data.sh` installs Node, clones the repo and starts pm2 on every launch, so Auto Scaling actually works.
- **Book covers are per-instance** — multer writes to `backend/uploads/` on the instance's EBS volume, so a cover on instance A is not on instance B. Accepted for the demo; S3 `covers/` is the next step (IAM policy already allows it).
- **Free backends sleep** — the old Render backend slept after inactivity (first request up to a minute). On AWS the ALB + ASG keep at least one instance warm, so the demo has no cold start.

## Local verification (done 2026-11-26)

- `node --check` passed on all backend files (`server.js`, `src/**/*.js`, seed, tests).
- Frontend `npm run build` succeeded (113 modules, `dist/` built in ~2 s).
- Backend `GET /health` could **not** be tested live without a `MONGO_URI` — no `.env` exists locally and the old Atlas password is leaked, so no live DB test was attempted. Run it after the rotation: `cd backend && npm run seed && npm start`, then `curl http://localhost:5000/health`.
