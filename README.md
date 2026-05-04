# Peer Management Platform

![Private workspace](https://img.shields.io/badge/private-workspace-08090a?style=for-the-badge)
![Hourly attendance](https://img.shields.io/badge/attendance-3_sessions_per_day-e4f222?style=for-the-badge&labelColor=08090a&color=e4f222)
![Secure sign in](https://img.shields.io/badge/sign_in-protected-161718?style=for-the-badge)

Peer Management Platform keeps student coordination work in one calm, focused place.

It helps a coordinator mark attendance, record group discussion feedback, manage student accounts, and export reports without juggling separate sheets or tools.

---

## What You Can Do

| Area | What it helps with |
| --- | --- |
| Attendance | Mark attendance for three fixed sessions every day. |
| Search | Find a student by name or the last three digits of their USN. |
| Group Discussions | Record batch-wise feedback and remarks. |
| Accounts | Create user accounts and reset passwords when needed. |
| Security | Keep sign-in protected with authenticator codes when enabled. |
| Reports | Download attendance and group discussion reports. |

---

## Daily Attendance Rhythm

```text
Session 1   8:45AM - 10:45AM
Session 2   11AM   - 1PM
Session 3   2PM    - 4PM
```

Attendance is counted by session, not by day.

---

## Sign In Experience

<details>
<summary>For regular users</summary>

Regular users are taken to the dashboard after sign in. They are not forced to scan an authenticator QR code immediately.

Authenticator setup stays in Settings, where it belongs.

</details>

<details>
<summary>For the master admin</summary>

The master admin uses the password and authenticator secret from the deployment settings.

After adding a new authenticator secret locally, restart the app before trying the code.

</details>

<details>
<summary>For passwords</summary>

Users can change their own password from Settings.

Admins can reset another user's password. Existing passwords cannot be viewed because they are protected.

</details>

---

## Visual Direction

The app uses a dark command-center style:

- deep black background
- graphite panels
- compact controls
- bright yellow-green action buttons with black text
- the project logo for the app icon, sign-in screen, and navigation

---

## Where Everything Is

| Need | Go here |
| --- | --- |
| How to publish the site | `Documentation/DEPLOYMENT.md` |
| Feature walkthrough | `Documentation/walkthrough.md` |
| Design notes | `Documentation/DESIGN.md` and `theme.css` |
| Current checklist | `Documentation/task.md` |

---

## Quick Readiness Check

- [ ] The landing page opens.
- [ ] Sign in works.
- [ ] Regular users are not forced into QR setup.
- [ ] Master admin authenticator code works after the secret is added and the app is restarted.
- [ ] Yellow-green buttons have black text.
- [ ] Attendance saves all three sessions separately.
- [ ] Reports download correctly.

---

## Useful Reminder

If the master authenticator code is rejected right after changing the secret, restart the app first. The app reads that secret when it starts.
