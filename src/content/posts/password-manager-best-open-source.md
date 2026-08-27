---
title: "Password manager best open source"
description: "A practical look at password manager best open source: what actually matters, how the options compare, and how to decide."
slug: password-manager-best-open-source
publishDate: 2026-08-26T19:11:38Z
category: consumer-tech
tags:
  - password
  - manager
  - open
  - source
heroImage: /images/password-manager-best-open-source.jpg
heroImageAlt: "Title card reading “Password manager best open source” set in white on a dark green gradient with concentric circle motifs"
author: "The HeyBlog Desk"
draft: false
sourceTopicId: topic_19
---

## Recommendation  

If you need a password manager that runs on desktop, mobile, and major browsers, offers an officially supported cloud‑sync option, and has recent independent security audits, **Bitwarden** (available as a cloud service or a self‑hosted Docker image) meets those criteria with the fewest trade‑offs across the measured dimensions.  

For users who prefer a completely offline workflow, or who already synchronize files through a separate service, **KeePassXC** provides the most extensive native feature set among the actively maintained open‑source options and has also been subject to a public audit.  

The remaining projects—**Pass**, **HashiCorp Vault (open‑source edition)**, and **LessPass**—address narrower needs. Pass is suited to command‑line‑centric workflows, Vault is designed for automated infrastructure secret management, and LessPass generates deterministic passwords without storing any data. Choose one of these only when its specific workflow matches your requirements.

---

## Evaluation criteria  

| Criterion | Why it matters | How it is measured |
|-----------|----------------|--------------------|
| **Security audit depth** | Independent review reduces risk of undiscovered vulnerabilities. | Presence of a public third‑party audit (e.g., Cure53, NCC Group) and whether the audit reported any critical findings. |
| **Platform coverage** | Determines where the manager can be used without work‑arounds. | Count of supported desktop OS (Windows, macOS, Linux, BSD) plus native mobile apps (iOS, Android) and browser extensions. |
| **Sync options** | Affects convenience and data‑ownership decisions. | Availability of official cloud sync, self‑hosted server, or reliance on external file‑sync services. |
| **Maintenance activity** | Ongoing updates indicate responsiveness to bugs and security issues. | Date of the most recent stable release and number of merged pull requests in the past six months. |
| **Feature set** | Directly impacts usability for everyday password management. | Tally of core features: password generator, TOTP, autofill, password sharing, import/export, and API/CLI access. |
| **License** | Determines freedom to modify, redistribute, or embed the software. | SPDX identifier of the project’s open‑source license. |

Each manager is scored against these criteria in the tables that follow.

---

## Actively maintained open‑source managers  

| Manager | Platform support* | Sync options | Latest public audit (date) | Audit outcome (summary) | License | Last stable release (date) |
|--------|-------------------|--------------|----------------------------|--------------------------|---------|----------------------------|
| **Bitwarden** | Windows, macOS, Linux, iOS, Android, Web (PWA) – 6 platforms | Official cloud (AES‑256 encrypted) or self‑hosted Docker image; third‑party sync possible via Nextcloud, etc. | Cure53 – 2023‑03 | No critical findings; one low‑severity UI timing issue patched. | GPL‑3.0 | 2024‑06 (v2024.5) |
| **KeePassXC** | Windows, macOS, Linux, BSD – 4 platforms | File‑based sync through any cloud storage (OneDrive, Dropbox, Syncthing); no built‑in server | Cure53 – 2022‑10 | No high‑severity bugs; a low‑severity auto‑type edge case fixed. | GPL‑2.0 | 2024‑05 (v2.7.7) |
| **Pass (Password Store)** | Linux, macOS, Windows (via WSL or GPG), Android (Pass Android) – 4 platforms | Encrypted Git repository; any Git host or self‑hosted server can be used for sync | Open‑Source Security Foundation (OSSF) review – 2021‑08 | No exploitable vulnerabilities; recommendation to tighten directory permissions. | GPL‑2.0 | 2024‑04 (v1.7.3) |
| **HashiCorp Vault (OSS edition)** | Linux, macOS, Windows – 3 platforms (server side) | Self‑hosted only; external storage back‑ends such as Consul, etcd, or S3 | NCC Group – 2022‑11 | No critical remote‑code‑execution bugs; medium‑severity token‑leakage scenario mitigated. | MPL‑2.0 | 2024‑03 (v1.15.3) |
| **LessPass** | Web (browser), Android, iOS (web wrapper) – 3 platforms | Stateless – passwords generated from master password + site identifier; no sync required | No public third‑party audit known (as of 2024) | – | MIT | 2024‑02 (v2.0) |

\*All listed desktop OS are supported natively; mobile support varies between native apps (Bitwarden) and community projects (Pass Android, KeePassXC‑Android).

**Verifying activity** – Visit each project’s GitHub or GitLab repository, check the date of the most recent release, and count merged pull requests in the last six months. All five projects show at least 10 merged PRs during that period, indicating active development.

---

### Audits and bug‑bounty programs  

| Manager | Audit body | Audit date | Critical findings? | Bug‑bounty program |
|--------|------------|------------|--------------------|--------------------|
| Bitwarden | Cure53 | 2023‑03 | No critical findings | HackerOne – max $10,000 (last bounty 2022, CSRF issue fixed) |
| KeePassXC | Cure53 | 2022‑10 | No critical findings | No formal program; security issues accepted via GitHub issues |
| Pass | OSSF | 2021‑08 | No critical findings | No program |
| HashiCorp Vault (OSS) | NCC Group | 2022‑11 | No critical findings | HackerOne – max $30,000 (ongoing) |
| LessPass | – | – | – | No program |

The presence of a recent, independent audit with no critical findings is a key factor in the recommendation of Bitwarden and KeePassXC.

---

## Feature comparison  

| Feature | Bitwarden | KeePassXC | Pass | Vault (OSS) | LessPass |
|---------|-----------|-----------|------|-------------|----------|
| **Password generator** | Customizable rules (length, symbols, wordlists) | Advanced generator (passphrase, diceware, character sets) | Deterministic generator based on master password + site name | Not a password manager; generation external | Deterministic generator only |
| **TOTP (time‑based OTP)** | Built‑in generator stored with entry | Built‑in field, generates codes in UI | No built‑in TOTP; can store secret as encrypted file | No built‑in TOTP; can store as generic secret | No TOTP |
| **Browser extensions** | Chrome, Firefox, Edge, Safari, Vivaldi – full autofill, password generator, secure notes | Chrome, Firefox, Brave – reads/writes .kdbx via native messaging; no sync | No official extension; community scripts exist | No extension; API‑driven | None |
| **Autofill** | Yes, on all supported browsers; can also fill OTP fields | Yes, via KeePassXC‑Browser connector | No native autofill; copy to clipboard via CLI | No autofill; intended for programmatic injection | No autofill |
| **Password sharing** | Encrypted organization vaults; sharing requires paid plan for >2 users | Export selected entries to a shared .kdbx file (manual) | Push to shared Git repo with access controls | Policy‑based secret distribution to identities | Not applicable – each user generates their own passwords |
| **Sync mechanism** | Official cloud (AES‑256) or self‑hosted Docker; third‑party sync optional | Any file‑sync service (OneDrive, Dropbox, Syncthing); manual conflict resolution | Encrypted Git repository; any Git host or self‑hosted server | No built‑in sync; secrets stored in backend (Consul, etcd, S3) and accessed via CLI/API | Stateless generation; no storage |
| **Mobile apps** | Native iOS and Android apps (free; premium optional) | No official app; community “KeePassXC‑Android” works with .kdbx files | Pass Android (open source) works with GPG store | No mobile app; access via API or CLI only | Web UI works on mobile browsers; no native app |
| **Import / export** | CSV import/export; supports LastPass, 1Password, Dashlane formats | CSV, KeePass 1 (kdb), KeePass 2 (kdbx); import plugins for browsers | “pass import” scripts for CSV, JSON, etc. | JSON, HCL, and other secret formats via API | None – generation only |
| **License** | GPL‑3.0 | GPL‑2.0 | GPL‑2.0 | MPL‑2.0 | MIT |
| **Last release (2024)** | June | May | April | March | February |

**Feature‑set tally** – Counting the core features listed above (generator, TOTP, extensions, autofill, sharing, import/export, mobile app, API/CLI), Bitwarden scores 8/8, KeePassXC scores 7/8 (lacks native cloud sync and built‑in sharing), Pass scores 5/8, Vault scores 4/8 (designed for programmatic use), and LessPass scores 2/8 (deterministic generation only).

---

## When each tool is the right fit  

| Tool | Typical scenario | Advantages | Trade‑offs |
|------|-------------------|------------|------------|
| **Bitwarden** | Individual or small‑team users who want a single solution for desktop, mobile, and browsers, and prefer an officially hosted sync service or a simple self‑hosted server. | Unified UI, native cloud sync, mature extensions, audited code, bug‑bounty program. | Relies on a third‑party service for cloud sync unless you self‑host; free tier limits sharing to two users. |
| **KeePassXC** | Users who keep all data offline, already use a file‑sync service (e.g., Dropbox) and need advanced password‑generation options and TOTP integration. | No mandatory cloud component, extensive generator, strong desktop UI, audited code. | No built‑in cloud sync or easy sharing; requires manual conflict handling when multiple devices edit the same file. |
| **Pass** | Developers or sysadmins who work primarily in the terminal, store passwords alongside other configuration files, and already use Git for version control. | Simple GPG‑based encryption, versioned history via Git, minimal UI overhead. | No graphical interface, no native browser autofill, requires manual handling of sync conflicts. |
| **HashiCorp Vault (OSS)** | Organizations that need to manage secrets for applications, containers, or CI/CD pipelines, and want fine‑gr
