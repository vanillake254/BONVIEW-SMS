# Bonview Church Bulk Messaging (SMS + WhatsApp)

Production-ready bulk messaging web app for **Bonview Church** (US). Admins can:

- Manage opt-in members (manual add + CSV import)
- Send bulk messages via **Twilio SMS**, **Twilio WhatsApp**, or **Both**
- View message history (logs)
- Automatically process inbound **STOP** to unsubscribe

## Architecture

- **Frontend**: React (Vite) -> Firebase Hosting
- **Backend**: Node.js + Express -> Railway
- **Auth**: Firebase Authentication (Email/Password)
- **DB**: Firestore
- **Messaging**: Twilio SMS + WhatsApp

## Firestore Data Schema

- **members** (collection)
  - `name` (string)
  - `phoneE164` (string, US E.164 `+1XXXXXXXXXX`)
  - `status` (string: `subscribed` | `unsubscribed`)
  - `createdAt` (timestamp/date)
  - `updatedAt` (timestamp/date)

- **messageLogs** (collection)
  - `createdAt`
  - `createdByUid`
  - `createdByEmail`
  - `message` (string)
  - `mode` (string: `sms` | `whatsapp` | `both`)
  - `recipientCount` (number)
  - `results` (object)
  - `status` (string: `sent` | `partial`)
  - `perMessageStatuses` (array)

- **optOutEvents** (collection)
  - `phoneE164`
  - `channel` (`sms` | `whatsapp`)
  - `body` (inbound message text)
  - `createdAt`

## Compliance & Safety (Implemented)

- **Opt-in**: members are assumed opt-in when added/imported; status stored per member.
- **STOP handling**: inbound `STOP` (and common variants) marks member `unsubscribed`.
- **Opt-out enforcement**: unsubscribed members are excluded from sends.
- **Quiet hours**: server blocks sends outside 8:00 AM – 9:00 PM in configured timezone.
- **Spam wording guard**: server blocks high-risk wording (simple phrase list).

## Repo Structure

- `backend/` Express API (Railway)
- `frontend/` React admin dashboard (Firebase Hosting)
- `firestore.rules` Firestore security rules
- `firebase.json` Firebase Hosting + Firestore rules config

## Prerequisites

- Node.js 18+
- Firebase project with:
  - Firebase Authentication (Email/Password) enabled
  - Firestore database created
- Twilio account with:
  - SMS-capable phone number
  - WhatsApp sender (sandbox or approved sender)

## Backend Setup (Local)

1. Install dependencies:

```bash
npm install
```

Run this in `backend/`.

2. Create `backend/.env` from `backend/.env.example`.

3. Start server:

```bash
npm run dev
```

## Frontend Setup (Local)

1. Install dependencies in `frontend/`:

```bash
npm install
```

2. Create `frontend/.env` from `frontend/.env.example`.

3. Start dev server:

```bash
npm run dev
```

## Admin Access (Required)

The backend requires a Firebase custom claim: `admin: true`.

1. Create your admin user in Firebase Auth (Email/Password).
2. Set the custom claim using the backend script:

```bash
npm run set-admin -- admin@example.com
```

Run this from `backend/` with `FIREBASE_SERVICE_ACCOUNT_JSON` set.

## Twilio Webhook (STOP Handling)

Configure Twilio inbound webhook to:

- **URL**: `https://<YOUR-RAILWAY-BACKEND>/twilio-webhook`
- **Method**: POST

This endpoint processes inbound messages from both SMS and WhatsApp and unsubscribes on STOP.

## Deployment

### Backend -> Railway

1. Create a new Railway service from the `backend/` folder.
2. Set environment variables (Railway -> Variables):

- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON` (paste the full JSON as a string)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_SMS_FROM` (e.g. `+15551234567`)
- `TWILIO_WHATSAPP_FROM` (e.g. `whatsapp:+14155238886`)
- `CORS_ORIGINS` (comma-separated, include your Firebase Hosting domain)
- `CHURCH_TIMEZONE` (default: `America/New_York`)
- `SEND_START_HOUR` (default: `8`)
- `SEND_END_HOUR` (default: `21`)
- `REQUIRE_ADMIN_CLAIM` (keep `true` in production)

3. Deploy. Railway will run `npm start`.

### Frontend -> Firebase Hosting

1. Install Firebase CLI and login.
2. Set your Firebase project in `.firebaserc` (or use `firebase use`).
3. Build the frontend:

```bash
npm run build
```

Run this in `frontend/`.

4. Deploy hosting + rules from repo root:

```bash
firebase deploy
```

## Verification Checklist

- Login works and dashboard is protected.
- Adding a member normalizes to US E.164.
- CSV import creates members and skips duplicates.
- Sending during quiet hours is blocked.
- SMS includes “Reply STOP to unsubscribe.”
- Replying STOP unsubscribes the member and future sends exclude them.
- Message History shows message logs.

## Notes

- WhatsApp sender must be configured in Twilio (sandbox or approved sender).
- Firestore rules are **admin-only** (custom claim required).
