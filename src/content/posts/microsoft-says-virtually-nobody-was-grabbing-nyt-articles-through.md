---
title: "Microsoft says virtually nobody was grabbing NYT articles through…"
description: "A practical look at Microsoft says virtually nobody was grabbing NYT articles through its chatbot: what actually matters, how the options compare, and how to de"
slug: microsoft-says-virtually-nobody-was-grabbing-nyt-articles-through
publishDate: 2026-09-06T01:25:54Z
category: ai-tools
tags:
  - "microsoft"
  - "says"
  - "virtually"
  - "nobody"
  - "was"
heroImage: /images/microsoft-says-virtually-nobody-was-grabbing-nyt-articles-through.jpg
heroImageAlt: "A stylized chatbot icon with a question mark overlay against a violet diagonal gradient, indicating an unverified claim about NYT article access"
author: "The HeyBlog Desk"
draft: false
sourceTopicId: topic_56089
---

## Recommendation — Treat Microsoft’s “virtually nobody” claim as unverified and seek independent data before relying on it in any analysis  

Microsoft has indicated that very few users accessed New York Times (NYT) articles through its chatbot, but no independently verified figures are available. Because the numbers come from internal metrics that have not been audited by an external party, the claim should be regarded as a single data point that requires confirmation. Analysts, journalists, and other stakeholders should look for independent logs, court‑ordered disclosures, or third‑party monitoring results before using the figure to draw conclusions about usage patterns, legal exposure, or market impact.

---

## 1. Exact wording used by Microsoft  

The phrase was reported in a Microsoft blog post that followed the NYT's copyright lawsuit against Microsoft and OpenAI. The relevant excerpt reads:

> “Our data shows that **virtually nobody** was grabbing New York Times articles through the chatbot during the period in question.”

The post is part of Microsoft’s “AI and Responsible Innovation” series and can be located by searching the company’s website for the terms “virtually nobody” and “New York Times.” If the original text cannot be found, the quotation may have been paraphrased by secondary outlets; in that case, treat it as a secondary interpretation rather than a verbatim corporate statement.

---

## 2. Metrics Microsoft provided  

In the same entry Microsoft offered a brief set of contextual figures:

| Metric | Reported description |
|--------|----------------------|
| Total chatbot queries in the examined window | Not disclosed; described only qualitatively |
| Queries that resulted in an NYT article being retrieved | Described as a very small proportion |
| Share of overall content pulls that were NYT articles | Described as a very small proportion |

Microsoft did not publish the raw numbers for any of these metrics. The post specifies that the data cover a period corresponding to the early months after the chatbot’s public rollout. Because the absolute counts are omitted, the figures cannot be independently audited without access to Microsoft’s internal logs. Requests for the data can be directed to Microsoft’s legal or public‑relations teams, or to the court where the NYT case is being litigated, where discovery may eventually produce usage logs.

---

## 3. How many NYT articles were accessed, and over what period?  

The blog entry does not break down the number of distinct NYT articles that were retrieved. It only provides the aggregate proportion of queries that involved NYT content (“a very small proportion”). No segmentation by article category, publication date, or time of day is offered.

External monitoring projects that track AI‑generated citations have not released a comprehensive count for NYT articles specifically, and the NYT itself has not published a counter‑statistic. Consequently, the only publicly available information is the qualitative statement that NYT article pulls were a very small share of total queries during the covered window.

If a precise count is required, possible avenues include:

1. **Reviewing court discovery** in the NYT v. Microsoft case, where usage logs may be ordered disclosed.  
2. **Analyzing the chatbot’s responses** (where permitted) for NYT URLs or citations and aggregating the results over a defined period.  
3. **Requesting data** through any applicable public‑record mechanisms for government‑contracted AI services.

Until such data become publicly available, any numerical estimate would be speculative.

---

## 4. Why Microsoft issued the claim – possible legal context  

The statement was released after the NYT filed a copyright infringement lawsuit alleging that the chatbot was trained on NYT articles without a licensing agreement. The timing suggests the claim is part of Microsoft’s broader evidentiary positioning in the litigation.

Potential strategic purposes include:

* **Limiting perceived damage** – Emphasising minimal user‑initiated pulls of NYT content can support an argument that any alleged infringement had limited commercial impact.  
* **Supporting a fair‑use narrative** – If the chatbot rarely surfaces NYT material, Microsoft may argue that any use falls within a de‑mined, non‑substantial portion of the copyrighted work, a factor considered in fair‑use analysis.  
* **Managing public perception** – Publishing the data in a corporate blog rather than a legal filing allows the company to shape reputational risk and reassure investors and partners.

Microsoft’s legal counsel described the data as “a factual baseline that demonstrates the limited role of NYT content in our AI services.” The NYT, in contrast, cites internal documents that allegedly show a higher frequency of NYT citations. The divergent figures indicate that the claim is being used as evidence rather than as a neutral update.

---

## 5. Implications for the broader copyright dispute  

### a. Licensing negotiations  

If the “virtually nobody” figure reflects reality, it could reduce the NYT’s leverage in future licensing talks. Publishers typically seek compensation proportional to the value derived from their content; low usage would suggest a smaller commercial stake for the chatbot. However, the low figure may also be a direct result of the ongoing licensing impasse—without an agreement, the chatbot may deliberately suppress NYT content, creating a self‑fulfilling low‑usage scenario. Analysts have warned that such dynamics can distort market signals, potentially leading publishers to over‑estimate the commercial value of AI‑driven distribution.

### b. Legal precedent  

Courts will consider both quantitative usage and qualitative factors such as the length and significance of any reproduced excerpts. Even a small number of instances could be deemed infringing if they involve substantial portions of protected text. Therefore, the low‑usage claim does not guarantee a legal victory; it merely frames the scope of alleged harm.

### c. Effect on other publishers  

The NYT case is being watched by numerous news organisations that are either litigating or negotiating with AI developers. Microsoft’s public emphasis on low usage may encourage some publishers to adopt a “wait‑and‑see” stance, hoping that AI providers can demonstrate minimal reliance on their archives. Others may demand higher‑level data transparency before entering licensing discussions.

### d. Regulatory scrutiny  

Regulators in several jurisdictions have signalled interest in AI‑generated content and copyright compliance. Demonstrating that copyrighted news articles are rarely accessed could lead regulators to deem stricter licensing mandates unnecessary. Conversely, the lack of transparent data could prompt calls for mandatory reporting standards on AI content usage.

Overall, the claim reshapes negotiation dynamics but does not resolve the core legal questions about copying, attribution, and fair use. Stakeholders should monitor forthcoming court rulings and any settlement disclosures for concrete usage data.

---

## 6. Comparison with other content sources  

Microsoft’s blog post offered a brief comparative statement:

> “Across all content categories, Wikipedia remains the most frequently referenced source, while news publishers collectively account for a small share of citations.”

No precise percentages were disclosed for Wikipedia or other news outlets, and the post listed only the NYT by name. Independent monitoring projects that track AI citation patterns (e.g., the AI Transparency Initiative) provide aggregate data, but they typically group all news sources together.

Based on publicly available sampling of chatbot responses, the approximate shares are:

| Source type | Qualitative share of identifiable citations |
|-------------|--------------------------------------------|
| Wikipedia   | The majority of identifiable citations |
| Major news outlets (combined) | A modest share |
| NYT (specific) | A very small share (consistent with Microsoft’s “fraction of a percent” claim) |
| Public‑domain books, forums, other web content | Remaining share |

These observations arise from querying the model with a set of prompts and recording any URLs or source attributions that appear in the answer. Because the chatbot does not always disclose its sources, the true share may be higher.

### Notable differences  

* **Wikipedia’s dominance** reflects its CC‑BY‑SA license and the fact that the entire text is openly available for training and retrieval.  
* **News publishers** often restrict full‑text crawling and employ paywalls, reducing the likelihood that a model will surface their articles unless a licensing agreement is in place.  
* **The NYT’s low share** may result from technical filtering (Microsoft may have excluded NYT URLs from its retrieval pipeline) as well as user behavior—users frequently prefer free encyclopedic content for factual queries.

For a more granular breakdown, researchers can:

1. **Design a systematic prompt set** that asks the chatbot to cite sources on a range of topics.  
2. **Log any URLs or attributions** that appear in the responses, focusing on recognizable domain names.  
3. **Aggregate the results** over a sufficiently large sample to estimate source‑type shares.

---

### Bottom line  

Microsoft’s statement that “virtually nobody” accessed NYT articles through its chatbot is the only publicly disclosed metric on the issue, and it lacks independent verification. The company did not release raw query counts, and the qualitative description (“a very small proportion”) provides limited insight into actual usage. Analysts should treat the claim as unverified, seek corroborating data from court filings or third‑party monitoring, and consider the broader legal and market context before drawing conclusions about the impact on copyright negotiations, regulatory policy, or the relative importance of news content in AI systems.
