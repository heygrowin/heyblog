---
title: "Viral AI assistant Instinct now has its own email address"
description: "A practical look at Viral AI assistant Instinct now has its own email address: what actually matters, how the options compare, and how to decide."
slug: viral-ai-assistant-instinct-now-has-its-own-email-address
publishDate: 2026-09-09T16:36:10Z
category: ai-tools
tags:
  - "viral"
  - "assistant"
  - "instinct"
  - "now"
  - "has"
heroImage: /images/viral-ai-assistant-instinct-now-has-its-own-email-address.jpg
heroImageAlt: "Editorial thumbnail graphic: Viral AI Assistant Instinct — a ai composition"
author: "The HeyBlog Desk"
draft: false
sourceTopicId: topic_59961
---

## 1. Instinct AI: Overview and Core Trade‑offs  

Instinct is a conversational AI assistant that can be reached through a web portal, mobile apps, and integrations with common messaging platforms. Its main capabilities are:

* answering factual or open‑ended questions,  
* summarising text or documents,  
* drafting short pieces of writing, and  
* performing simple task automation such as creating calendar events from natural‑language prompts.

The service processes user input on the provider’s servers. According to the public privacy policy (see [Instinct Privacy Policy](https://instinct.ai/privacy)), the provider may retain the raw content for a limited period to improve the model, unless the user opts out. Users therefore need to balance the speed and breadth of assistance against the fact that their data leaves their device.

> **Decision point** – If you are comfortable with the provider’s data‑handling approach and want an AI‑driven inbox that can turn email into actions, you may enable the Instinct email address. If you require stricter data‑residency guarantees or are uncertain about the security of an AI‑managed mailbox, you can continue using the standard chat interface and review the privacy documentation before adopting the email feature.

---

## 2. The New Email Address: How It Works  

A recent update gives every Instinct user a unique virtual mailbox (e.g., `yourname@instinct.ai`). Incoming mail is routed to the same backend that powers the chat interface. The system parses the email body, extracts intents, and replies in one of three formats:

1. **Plain‑text answer** – a simple text reply.  
2. **Formatted reply** – markdown‑styled content with headings, lists, or tables.  
3. **Action reply** – a JSON payload that can be consumed by automation platforms such as Zapier or Make.

The mailbox is fully managed in the provider’s cloud; no separate mail server is required on the user side.

### Why the feature was added  

In a community poll conducted on the official Instinct forum in March 2024, many respondents cited keeping AI assistance inside their regular email workflow as a top request and expressed interest in reliable triggers for downstream automation. The new email address addresses both of these needs by letting users interact with the assistant through a channel they already use and by exposing a structured reply that automation tools can act upon.

### Example workflow  

A user sends the following email to `tasks@instinct.ai`:

```
Subject: Project kickoff
Body: Please create a calendar event for a 1‑hour kickoff meeting with the product team next Monday at 10 am. Include a reminder 15 minutes before.
```

Instinct parses the request, generates a calendar‑event JSON payload, and replies:

```json
{
  "action": "create_event",
  "title": "Project kickoff",
  "date": "2024-09-16",
  "time": "10:00",
  "duration_minutes": 60,
  "reminder_minutes_before": 15,
  "participants": ["product-team@company.com"]
}
```

When the reply is routed through Zapier’s “Email Parser” trigger, a Zap creates the event in Google Calendar automatically. The user receives the calendar invitation without any manual copy‑pasting.

---

## 3. Setting Up Your Instinct Email Address  

The steps below work for the web portal and the official iOS/Android apps. They assume you already have a free or paid Instinct account.

1. **Log in**  
   * Open <https://app.instinct.ai> or launch the mobile app.  
   * Sign in with your existing credentials; if you do not have an account, register using a valid email address and a strong password.

2. **Open Integrations**  
   * From the left‑hand menu select **Settings → Integrations**.  
   * Locate the **Email Inbox** section.

3. **Generate your address**  
   * Click **Generate Email**. A unique address (e.g., `jane.doe@instinct.ai`) appears.  
   * Copy it to your clipboard.

4. **Verify ownership (optional)**  
   * In some regions the system asks for a verification code to prevent address squatting.  
   * The verification email is delivered instantly inside the dashboard; enter the code when prompted.

5. **Configure external forwarding (if desired)**  
   * In your regular email provider (Gmail, Outlook, etc.) create a rule that forwards messages addressed to an alias of your choice (e.g., `instinct@yourdomain.com`) to the Instinct address you just generated.  
   * Preserve the original subject line; Instinct uses it to maintain thread context.

6. **Choose a reply mode**  
   * **Plain reply** – simple text.  
   * **Formatted reply** – markdown with headings, tables, etc.  
   * **Action reply** – JSON payload for automation.  
   * Set the preferred mode in **Email Inbox → Reply Settings**.

7. **Test the connection**  
   * Send a test email from any account to your Instinct address, for example “Summarise the attached PDF”.  
   * Verify that a reply arrives within a few seconds and matches the selected reply mode.

8. **Enable two‑factor authentication (2FA)**  
   * Go to **Account → Security** and activate 2FA. This protects the underlying Instinct account; it does not affect email receipt.

#### Platform requirements  

| Requirement | Minimum version |
|-------------|-----------------|
| Web browser | Modern browser with TLS 1.3 support |
| iOS app    | iOS 13 or later |
| Android app| Android 8 (Oreo) or later |
| Internet   | Continuous connection; no local mail server needed |
| Automation (Action reply) | Account on a supported platform (Zapier, Make, etc.) and basic webhook handling knowledge |

---

## 4. Privacy and Security  

### Data‑processing pipeline  

| Stage | Description |
|-------|-------------|
| **Ingress** | Email metadata (sender, timestamps) is stripped; the message body is sent to the AI inference engine. |
| **Inference** | The text is tokenised and processed by the same large‑language model that powers the chat interface. |
| **Retention** | By default, raw email content is stored for up to 30 days, as stated in the provider’s privacy policy ([source](https://instinct.ai/privacy)). Users can delete individual threads, which triggers immediate removal from the backend. |
| **Outbound** | Generated replies are sent back through the virtual mailbox and delivered to the original sender’s client. |

### Key policy points  

* **Opt‑out of retention** – In **Settings → Privacy** you can toggle “Do not retain my inputs for training”. When enabled, content is discarded after the response is generated.  
* **Encryption** – All client‑to‑server traffic uses TLS 1.3. Emails stored in the virtual mailbox are encrypted at rest with AES‑256.  
* **Jurisdiction** – The service runs in cloud regions located in the United States and the European Union. A list of data‑center locations is available on the provider’s site ([Data‑center locations](https://instinct.ai/data-centers)). The provider does not currently offer region‑specific deployments beyond these two zones; organisations subject to strict data‑localisation rules should contact sales for the latest options.

### Practical security checklist  

* **Avoid highly sensitive data** – Do not email passwords, financial statements, or health records unless you have enabled the beta end‑to‑end encryption feature.  
* **Use distinct aliases** – Create separate Instinct addresses (e.g., `work@instinct.ai`, `personal@instinct.ai`) to limit exposure if an address is compromised.  
* **Regularly purge history** – The dashboard allows bulk deletion of threads older than a chosen date. A monthly cleanup routine reduces stored data.  
* **Protect automation credentials** – Webhook URLs generated for Zapier or Make should be treated like passwords; store them securely and rotate them if you suspect leakage.

---

## 5. Real‑World Use Cases  

### 5.1 Summarising inbound reports  

* **Scenario** – A manager receives weekly PDF performance reports.  
* **Workflow** – Forward the PDF to `summaries@instinct.ai`. Instinct extracts the text (built‑in OCR) and replies with a bullet‑point summary. The manager reads the summary directly in their inbox, saving the time required to open each PDF.

### 5.2 Calendar event creation  

* **Scenario** – A teammate emails “Schedule a 30‑minute sync with Alex on Thursday at 2 pm.”  
* **Workflow** – Instinct parses the request, replies with a confirmation, and, if the user has linked a calendar (Google Calendar or Outlook) in **Integrations**, automatically creates the event. The original sender receives the calendar invite and the AI‑generated confirmation.

### 5.3 Data extraction for spreadsheets  

* **Scenario** – A sales analyst receives daily CSV files with leads.  
* **Workflow** – The analyst forwards the email to `leads@instinct.ai` with the note “Extract names and email addresses only.” Instinct returns a clean CSV in the reply body. An email rule saves the reply to a shared folder, where a downstream script imports the data into a CRM.

### 5.4 Customer‑support triage  

* **Scenario** – A small business uses `support@instinct.ai` as a generic help address.  
* **Workflow** – Incoming queries are routed to Instinct, which classifies each request (billing, technical, feedback) and replies with a templated acknowledgment. The classification tag is added to the email subject, allowing the business’s ticketing system to route the message to the appropriate human agent.

### 5.5 Personal knowledge‑base building  

* **Scenario** – An individual wants to capture ideas from articles and meetings.  
* **Workflow** – They email a note to `notes@instinct.ai` with the prompt “Summarise and tag the key points.” Instinct replies with a markdown‑formatted summary and suggested tags (e.g., `#productivity`, `#AI`). The user forwards the reply to a note‑taking app that supports markdown, instantly creating a searchable entry.

These examples demonstrate that the Instinct email address is more than a convenience; it acts as a programmable endpoint that can bridge traditional email workflows with AI‑driven automation.

---

## 6. Pricing, Limits, and Additional Considerations  

### Pricing (USD)  

| Tier | Monthly cost | Email address | Message limit | Attachment limit |
|------|--------------|---------------|---------------|------------------|
| **Free** | $0 | 1 address | 100 messages | 5 MB total per month |
| **Pro** | $12 | 3 addresses | 1 000 messages | 50 MB total per month |
|
