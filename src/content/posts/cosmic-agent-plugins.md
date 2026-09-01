---
title: "Cosmic Agent Plugins"
description: "Specialised modules for the Cosmic Agent automation framework"
slug: cosmic-agent-plugins
publishDate: 2026-09-01T21:08:18Z
category: ai-tools
tags:
  - cosmic-agent
  - plugin
  - automation
heroImage: /images/cosmic-agent-plugins.jpg
heroImageAlt: "Title card reading “Cosmic Agent Plugins” set in white on a dark green gradient with concentric circle motifs"
author: "The HeyBlog Desk"
draft: false
sourceTopicId: topic_51335
---

## 1. What are Cosmic Agent Plugins and which host do they augment?

**Recommendation:** If you need to add specialised capabilities to the Cosmic Agent automation framework, use the official plugin architecture instead of ad‑hoc scripts. The plugin system is version‑controlled, integrates with the core runtime, and avoids source‑level changes.

**Definition**  
Cosmic Agent Plugins are compiled or interpreted modules that the Cosmic Agent runtime loads at start‑up or on demand. They provide extra actions, data connectors, or UI widgets for the **Cosmic Agent platform**, a cross‑platform automation engine that runs workflows written in the Cosmic Script language. The platform supplies a scheduler, a sandbox, and a REST‑based control API; plugins fill gaps that the core engine does not cover, such as:

* Connecting to proprietary SaaS APIs that are not in the built‑in library.  
* Adding custom data‑processing steps (e.g., image recognition, statistical modelling).  
* Exposing new trigger types (file‑system events, hardware sensor inputs).  
* Supplying visual components for the Cosmic Agent Dashboard.

Each plugin is a single package (a `.cag` archive on Windows, macOS, and Linux) that contains:

* A manifest declaring the plugin’s name, version, required Cosmic Agent version, and any external dependencies (e.g., Python 3.10, OpenSSL 1.1).  
* Compiled code or a script bundle.  
* Optional resource files.

When the host starts, it scans a designated **plugins directory**, validates the manifest signatures, and registers the extensions for use in scripts. Because the architecture is versioned, the host can reject plugins that target an incompatible runtime, preserving stability and security.

---

## 2. Which plugins are essential or most popular for everyday tasks?

Below is a curated list of plugins that most users install after a fresh Cosmic Agent deployment. The selection reflects the most frequent workflow categories observed in community discussions and the general popularity indicated on the marketplace. All listed plugins are provided by the Cosmic Agent team or third‑party developers, many of which have open‑source repositories.

| Plugin | Core Feature | Typical Use‑Case | License / Cost |
|--------|--------------|------------------|----------------|
| **Cosmic‑Connect‑REST** | Generic REST client with OAuth 2.0 support | Pull data from external services (e.g., CRM, marketing platforms) without writing custom HTTP code | Free, open source (MIT) |
| **Cosmic‑DB‑Bridge** | Unified database driver (PostgreSQL, MySQL, MongoDB) | Read/write to relational or document stores within a workflow | Free, open source (Apache 2.0) |
| **Cosmic‑AI‑Vision** | Image classification using pre‑trained TensorFlow models | Automate tagging of uploaded photos, detect defects in manufacturing images | Free tier; paid model packs are available at a price set by the vendor |
| **Cosmic‑File‑Watcher** | Real‑time file‑system monitoring (cross‑platform) | Trigger jobs when files appear in a drop folder, useful for ETL pipelines | Free, open source |
| **Cosmic‑Secure‑Vault** | Encrypted secret storage with optional HSM integration | Store API keys, certificates, and passwords for scripts | Free for up to 10 secrets; tiered pricing applies for larger usage |
| **Cosmic‑Scheduler‑Pro** | Advanced cron‑like scheduling with calendar integration (Google Calendar, Outlook) | Coordinate complex, time‑based workflows across teams | Paid single‑user license is available, with volume discounts |
| **Cosmic‑UI‑Widgets** | Drag‑and‑drop dashboard components (charts, tables, live logs) | Build custom monitoring pages for operations staff | Free, open source |

### Why these matter

* **Data integration** – The REST and DB Bridge plugins eliminate the need to embed low‑level networking code in scripts.  
* **Automation triggers** – File‑Watcher provides a reliable, OS‑agnostic way to start jobs on new data.  
* **Security** – Secure‑Vault centralises secret management, reducing the risk of hard‑coded credentials.  
* **AI capabilities** – AI‑Vision enables non‑programmers to add image analysis without training their own models.  
* **Scheduling** – Scheduler‑Pro adds calendar awareness that the base engine lacks.  
* **Visibility** – UI‑Widgets let teams monitor workflow health without building a separate front‑end.

When choosing plugins, start with the functional gaps in your current workflows. If you already use an external secret store, you may skip Secure‑Vault; otherwise, it is the recommended first add‑on.

---

## 3. How to install and configure a Cosmic Agent Plugin on my system?

**Recommendation:** Use the built‑in plugin manager (`cag-plugin`) rather than copying files manually. The manager performs version checks, signature verification, and automatic placement in the correct directory for all supported operating systems.

### 3.1 Prerequisites

| Item | Minimum version | Notes |
|------|----------------|-------|
| Cosmic Agent runtime | 3.2.0 or later | Earlier versions lack signed‑manifest support. |
| Operating system | Windows 10 / macOS 12 / Linux kernel 5.4+ | The manager works on all three. |
| Dependencies | Python 3.9+ (if the plugin includes Python scripts) | The manager will warn if a required interpreter is missing. |

### 3.2 Installation via the official marketplace

1. **Open the Cosmic Agent console** – run `cag-console` from a terminal or start‑menu shortcut.  
2. **Select “Marketplace”** – the UI lists verified plugins with an **Install** button.  
3. **Choose the plugin** – click **Install**; the console downloads the package from `https://marketplace.cosmicagent.io`.  
4. **Confirm the signature** – the manager shows the publisher’s public‑key fingerprint; compare it with the fingerprint published on the developer’s website or repository.  
5. **Automatic placement** – the manager extracts the `.cag` archive into the host’s plugin directory (`%APPDATA%\CosmicAgent\plugins` on Windows, `~/.cosmicagent/plugins` on macOS/Linux).  
6. **Restart the runtime** – issue `cag restart` in the console or stop/start the service via your OS service manager.

### 3.3 Manual installation (advanced)

If you need a version that is not yet listed in the marketplace (e.g., a beta release from GitHub), follow the steps for your operating system.

| OS | Commands |
|----|----------|
| **Windows** | 1. Download the `.cag` file from a trusted source.<br>2. Verify the SHA‑256 hash (`certutil -hashfile plugin.cag SHA256`).<br>3. Copy the file to `%APPDATA%\CosmicAgent\plugins`.<br>4. Register it with `cag-plugin register plugin.cag`.<br>5. Restart the service (`net stop CosmicAgent && net start CosmicAgent`). |
| **macOS** | 1. Download the `.cag` file.<br>2. Verify the hash (`shasum -a 256 plugin.cag`).<br>3. Move it to `~/Library/Application Support/CosmicAgent/plugins/`.<br>4. Register with `cag-plugin register "~/Library/Application Support/CosmicAgent/plugins/plugin.cag"`.<br>5. Restart via Homebrew (`brew services restart cosmic-agent`) or launchctl (`launchctl unload /Library/LaunchDaemons/com.cosmic.agent.plist && launchctl load /Library/LaunchDaemons/com.cosmic.agent.plist`). |
| **Linux** | 1. Download the `.cag` file.<br>2. Verify the hash (`sha256sum plugin.cag`).<br>3. Place it in `~/.cosmicagent/plugins/` (or `/etc/cosmicagent/plugins/` for system‑wide install).<br>4. Register with `cag-plugin register ~/.cosmicagent/plugins/plugin.cag`.<br>5. Restart the daemon (`systemctl restart cosmic-agent`). |

### 3.4 Configuration after installation

Most plugins provide a configuration file (`plugin-name.yaml`) inside their folder. Typical steps:

1. **Edit the YAML file** – add API keys, endpoint URLs, or model identifiers. Use a UTF‑8‑compatible editor.  
2. **Validate the file** – run `cag-plugin validate plugin-name` to check syntax and required fields.  
3. **Apply the settings** – reload the plugin (`cag-plugin reload plugin-name`) or restart the runtime.

For plugins that rely on external services (e.g., AI‑Vision), you may also need to:

* Create an account on the service provider’s portal.  
* Generate an API token and store it in Secure‑Vault (recommended).  
* Reference the vault secret in the plugin’s YAML, for example `api_key: vault://cosmic-ai-vision/key`.

---

## 4. Compatibility, versioning, and trusted download sources

### 4.1 Compatibility matrix (as of Cosmic Agent 3.2)

| Plugin | Minimum Cosmic Agent version | Supported OS | External dependencies | Notes |
|--------|-----------------------------|--------------|-----------------------|-------|
| Cosmic‑Connect‑REST | 3.0.0 | Windows, macOS, Linux | None | Uses built‑in HTTP client. |
| Cosmic‑DB‑Bridge | 3.1.0 | Windows, macOS, Linux | libpq ≥ 12, MySQL Connector ≥ 8.0 | Install drivers via OS package manager if absent. |
| Cosmic‑AI‑Vision | 3.2.0 | Windows, macOS, Linux | TensorFlow 2.8+, CUDA 11 (GPU optional) | GPU acceleration requires a compatible NVIDIA driver. |
| Cosmic‑File‑Watcher | 3.0.0 | All | None | Uses native file‑system APIs. |
| Cosmic‑Secure‑Vault | 3.1.0 | All | OpenSSL 1.1.1+ (encryption) | HSM integration needs the vendor’s SDK.
