---
title: "Google Has Removed MV2 Extensions from the Chrome Web Store,…"
description: "A practical look at Google Has Removed MV2 Extensions from the Chrome Web Store, Including UBO: what actually matters, how the options compare, and how to decid"
slug: google-has-removed-mv2-extensions-from-the-chrome-web-store
publishDate: 2026-09-05T15:05:46Z
category: consumer-tech
tags:
  - google
  - has
  - removed
  - mv2
  - extensions
heroImage: /images/google-has-removed-mv2-extensions-from-the-chrome-web-store.jpg
heroImageAlt: "Editorial thumbnail graphic: Google Removed MV2 Extensions — a general composition"
author: "The HeyBlog Desk"
draft: true
sourceTopicId: topic_51202
---

## 1. Google’s MV2 deprecation timeline and global policy  

Google announced the phase‑out of Manifest V2 extensions in a Chrome Developers blog post. The post outlined a three‑stage schedule that applied to the Chrome Web Store worldwide [1]. The key milestones were:

| Phase | Action |
|------|--------|
| Announcement | Public notice of MV2 deprecation; Chrome began showing compatibility warnings. |
| Store freeze | New MV2 submissions and updates were halted. Existing MV2 listings remained visible but could not be updated. |
| Automatic removal | MV2 extensions that had not been migrated were removed from the store. |
| Final deadline | All MV2 extensions eventually needed to be either migrated to MV3 or removed. Chrome stopped loading MV2 extensions from any source without a developer‑side workaround. |

Google describes the MV2 deprecation policy as applying globally: the same technical requirements apply to every Chrome user, regardless of location [2]. Local regulations can still affect whether a particular extension is allowed in a specific jurisdiction. For example, the Chrome Web Store is not available in mainland China, and Google’s support page notes that extensions cannot be listed there [3]. Similarly, the European Union’s GDPR rules have led some privacy‑focused extensions to be withdrawn from the store in certain EU member states [4].

---

## 2. Why uBlock Origin (UBO) is often cited  

uBlock Origin (UBO) is one of the most widely installed ad‑blocking extensions. The Chrome Web Store page for UBO indicated a large user base before the MV2 removal [5]. That user base made the extension a high‑visibility example when Google began enforcing the MV2 sunset.

### Technical factors  

1. **Reliance on `chrome.webRequest` (blocking mode)** – MV2 allowed the extension to intercept network requests in real time. MV3 replaces that capability with the Declarative Net Request (DNR) API, which requires a static rule set.  
2. **Rule‑set size** – UBO ships with a substantial number of filter rules (including community‑maintained lists) as documented in the project’s release notes [6]. The default DNR limit for regular Chrome users is **30 000 rules**; enterprise‑managed Chrome can raise the limit to **150 000** [7]. A direct port of UBO to MV3 would therefore discard a portion of its filters unless the developer restructures the lists.  
3. **Open‑source development** – The maintainers have publicly discussed the migration challenges on the project’s GitHub issue tracker, providing a concrete case study for other developers [8].

### Availability after removal  

The MV2 version of UBO is no longer available on the Chrome Web Store. The extension remains available as open‑source code on GitHub, and the developers continue to publish MV2 builds that users can side‑load. Those builds are not signed by Google, so they must be installed manually and will not receive automatic updates from the store.

---

## 3. Installing or side‑loading UBO after the store removal  

The following steps describe a safe way to install the latest MV2 build of UBO on a Chrome browser that no longer offers it through the store.

### 3.1 Verify the source  

1. Visit the official repository: <https://github.com/gorhill/uBlock>.  
2. Confirm that the latest release is signed by a recognized maintainer (the release page shows GPG signatures for each tag).  
3. Download the file named **`uBlock0_1.53.0.chromium.mv2.crx`** (or the most recent MV2‑labeled file) from the **Releases** section.

### 3.2 Enable side‑loading  

1. Open `chrome://extensions/`.  
2. Toggle **Developer mode** in the top‑right corner.  
3. Drag the downloaded `.crx` file onto the extensions page. Chrome will display a confirmation dialog; accept it to install.  
4. After installation, compare the extension’s ID (shown on the extensions page) with the ID listed on the GitHub release page to ensure they match.

### 3.3 Keep the extension up to date  

Because Google will not push updates, you must repeat the download process for each new MV2 release. To simplify:

* Bookmark the GitHub releases page.  
* Subscribe to the repository’s **Release** RSS feed or enable “Watch → Releases only” on GitHub to receive notifications.  

### 3.4 Security checks  

* **Never download** the `.crx` from third‑party sites that are not linked from the official repository.  
* Verify the file’s SHA‑256 hash (provided on the release page) using a command such as `shasum -a 256 uBlock0_1.53.0.chromium.mv2.crx` (macOS/Linux) or `Get-FileHash -Algorithm SHA256 uBlock0_1.53.0.chromium.mv2.crx` (PowerShell).  
* Remember that side‑loaded extensions are not scanned by Google’s automated malware detection, so only install builds you have verified yourself.

### 3.5 Reactivating a previously disabled installation  

If UBO was installed before the deprecation deadline and Chrome automatically disabled it, the steps above will reactivate the extension. Chrome may show a warning that the extension is “unsupported”; after confirming the source, you can safely ignore the warning.

---

## 4. Migrating an MV2 extension to Manifest V3  

Developers who want to keep their extensions on the Chrome Web Store must migrate to MV3 before the final deadline. The official migration guide is part of the Chrome Developers documentation [9]; it includes a checklist and links to validation tools.

### 4.1 Manifest file changes  

| Change | Action required |
|--------|-----------------|
| `manifest_version` | Change value from `2` to `3`. |
| `background` | Replace the `scripts` array with a **service worker** definition, e.g. `"background": {"service_worker": "background.js"}`. Service workers cannot run indefinitely and have no access to the DOM. |
| `permissions` | Move host permissions into a new `host_permissions` field. |
| `browser_action` / `page_action` | Consolidate into the unified `action` key. |
| `content_security_policy` | Update to the MV3 format, e.g. `"content_security_policy": {"extension_pages": "script-src 'self'; object-src 'self'"}`. |

### 4.2 API replacements  

| MV2 API | MV3 alternative | Key considerations |
|---------|----------------|--------------------|
| `chrome.webRequest` (blocking) | `chrome.declarativeNetRequest` | Requires a static rule set; dynamic changes must use `updateDynamicRules`. |
| `chrome.extension.getBackgroundPage` | Not available | Use message passing to the service worker instead. |
| `chrome.runtime.onMessage` (long‑lived) | Same API, but the listener runs in the service worker context. |
| `chrome.storage.sync` (large data) | Same API, but MV3 imposes a lower quota (100 KB vs. 8 MB in MV2). |
| `chrome.tabs.executeScript` | `chrome.scripting.executeScript` | Requires the `scripting` permission. |

### 4.3 Validation and testing tools  

1. **Manifest V3 Migration Checklist** – a downloadable PDF from the Chrome Developers site that lists required manifest fields and common pitfalls [9].  
2. **Extension Manifest Validator** – install with `npm i -g @chrome-extension-tools/validator` and run `cxt validate manifest.json` to catch syntax and API‑usage errors.  
3. **Local loading** – In `chrome://extensions/`, click **Load unpacked** and select the MV3 folder. Chrome will surface manifest errors and flag prohibited API calls.  

### 4.4 Rule
