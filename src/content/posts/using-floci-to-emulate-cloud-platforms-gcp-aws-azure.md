---
title: "Using floci to emulate Cloud platforms (GCP, AWS, Azure)"
description: "A practical look at Using floci to emulate Cloud platforms (GCP, AWS, Azure): what actually matters, how the options compare, and how to decide."
slug: using-floci-to-emulate-cloud-platforms-gcp-aws-azure
publishDate: 2026-08-31T20:04:58Z
category: consumer-tech
tags:
  - using
  - floci
  - emulate
  - cloud
  - platforms
heroImage: /images/using-floci-to-emulate-cloud-platforms-gcp-aws-azure.jpg
heroImageAlt: "Title card reading “Using floci to emulate Cloud platforms (GCP, AWS, Azure)” set in white on a dark green gradient with concentric circle motifs"
author: "The HeyBlog Desk"
draft: false
sourceTopicId: topic_48559
---

## Recommendation – Use FLOCI when a single Docker‑based emulator meets most of your local development needs  

Choose FLOCI if you need a lightweight, Docker‑hosted emulator that can expose a limited set of GCP, AWS, and Azure services together. It works well for teams that only require object storage, simple messaging, and basic NoSQL or document databases.  

If your code depends on a wide range of cloud APIs, on advanced features such as fine‑grained IAM, VPC networking, or managed Kubernetes, or if you need production‑grade fidelity, supplement FLOCI with provider‑specific emulators (for example, LocalStack for AWS, the Google Cloud SDK `gcloud beta emulators`, or Azure Storage Emulator).  

The core trade‑off is **scope versus completeness**. FLOCI offers a unified Docker image and a single endpoint, which reduces orchestration effort and speeds up CI pipelines. In return you accept partial API coverage, occasional incompatibilities after version upgrades, and the need to manage authentication stubs yourself. For many micro‑service projects the convenience outweighs the gaps; for larger, compliance‑sensitive workloads a mixed‑tool approach remains safer.

---

## FLOCI Overview & Key Tradeoffs  

### What FLOCI is  

FLOCI (pronounced “flow‑see”) is an open‑source project that packages a set of cloud‑service stubs inside one Docker image. It implements a small, well‑defined subset of the public REST/JSON APIs for Google Cloud Platform (GCP), Amazon Web Services (AWS), and Microsoft Azure. A built‑in HTTP router forwards requests to the appropriate mock based on the hostname or path prefix you configure.

### Core architecture  

| Component | Role |
|-----------|------|
| **Router layer** | Listens on a configurable port (default 8080) and directs traffic to the matching service mock. |
| **Service mocks** | Small Go or Python processes that implement selected API operations. Data are stored in memory or on a local filesystem, depending on the service. |
| **State persistence** | Optional volume mounts let you keep bucket contents, queue messages, or table rows across container restarts. |
| **CLI wrapper** | The `floci` command‑line tool generates a `docker compose` file, injects environment variables, and runs health checks. |

### How FLOCI differs from other local emulators  

| Feature | FLOCI | LocalStack | Minikube + cloud‑service operators |
|---------|-------|------------|------------------------------------|
| **Unified multi‑cloud image** | Yes – one container can expose GCP, AWS, and Azure endpoints simultaneously. | No – focuses on AWS; GCP/Azure support is provided via separate projects. | No – requires a Kubernetes cluster and separate operators for each service. |
| **API fidelity** | Partial – core CRUD operations only; advanced features (IAM policies, VPC networking, etc.) are omitted. | Varies – AWS services are more complete; GCP/Azure support is community‑driven and limited. | Depends on the operator; can be high but usually needs a full K8s cluster. |
| **Resource footprint** | Single container; lower resource usage when only a few services are active. | Multiple containers per AWS service; resource use grows quickly. | Full K8s node(s) plus per‑service pods; higher baseline overhead. |
| **CI integration** | Simple `docker compose up` and teardown; predictable environment variables. | Similar Docker approach but longer startup due to many containers. | Requires a Kubernetes runner (kind, k3s, etc.) in CI, adding complexity. |
| **Community & support** | Small but active GitHub community; documentation focuses on quick‑start use cases. | Larger community and commercial backing (LocalStack Pro). | Community‑driven operators; support varies by project. |

### Key trade‑offs  

* **Simplicity vs. coverage** – A single‑image design reduces orchestration effort but limits the number of services you can emulate.  
* **Speed vs. realism** – Mocks store data locally and skip many security checks, so start‑up is fast. Code that relies on fine‑grained IAM or regional behavior may see different results in production.  
* **Version lock‑in** – FLOCI tracks specific API versions (e.g., GCP Pub/Sub v1). Updating the Docker image can introduce breaking changes; verify compatibility before a major bump.  

If these trade‑offs match your workflow, proceed with FLOCI. Otherwise, adopt a mixed‑toolchain approach.

---

## Supported Services & Known Gaps  

The table below reflects the services implemented in the latest stable FLOCI release (v0.9.1). Versions refer to the public API version that each mock aims to emulate. Check the repository’s `SUPPORTED_SERVICES.md` file for the most current list.

| Cloud | Service | API version emulated | Persistence option | Notable limitations |
|-------|---------|----------------------|--------------------|----------------------|
| **AWS** | S3 (Object storage) | `2006-03-01` | Local filesystem volume | No multipart upload; bucket policies ignored |
|  | SQS (Message queue) | `2012-11-05` | In‑memory (optional file dump) | No dead‑letter queue; visibility timeout approximated |
|  | DynamoDB (NoSQL) | `2012-08-10` | SQLite file (optional) | No secondary indexes; limited query operators |
|  | SNS (Pub/Sub) | `2010-03-31` | In‑memory | Topics are simple strings; no subscription filtering |
| **GCP** | Cloud Storage | `v1` | Local filesystem volume | No object versioning; IAM not enforced |
|  | Pub/Sub | `v1` | In‑memory (optional JSON dump) | No push subscriptions; ordering not guaranteed |
|  | Firestore (Native mode) | `v1` | SQLite file (optional) | No collection‑group queries; limited transaction support |
| **Azure** | Blob Storage | `2021-04-10` | Local filesystem volume | No soft delete; limited CORS handling |
|  | Queue Storage | `2021-06-08` | In‑memory | No poison‑message handling |
|  | Table Storage | `2021-02-12` | SQLite file (optional) | No batch operations; limited query syntax |

#### Known gaps  

* **IAM / authentication** – FLOCI accepts any request that contains a correctly formatted `Authorization` header but does not validate signatures or enforce policies. Tests that need permission‑error handling must mock those responses manually.  
* **Regional behavior** – All services run in a single logical region (`local`). Features that differ by region (latency‑based routing, data residency, etc.) are not reproduced.  
* **Advanced services** – AWS Kinesis, GCP BigQuery, Azure Event Hubs, managed Kubernetes, and similar services are outside the current scope.  
* **Version drift** – The mock API may lag behind the latest provider release. If your code uses a newly added field, FLOCI will return an “unknown parameter” error.  

When a required service is missing or a limitation blocks a test, you can run the provider‑specific emulator for that service alongside FLOCI.

---

## Multi‑Provider Setup & Configuration  

The steps below assume Docker Engine (or Docker Desktop) and Docker Compose v2 are installed. Commands are shown for a Unix‑like shell; equivalent PowerShell commands are similar.

### 1. Pull the FLOCI image  

```bash
docker pull ghcr.io/floci/floci:0.9.1
```

Replace `0.9.1` with a newer tag if one is available.

### 2. Create a `docker-compose.yml`  

```yaml
version: "3.9"

services:
  floci:
    image: ghcr.io/floci/floci:0.9.1
    container_name: floci
    ports:
      - "8080:8080"
    environment:
      - ENABLE_AWS_S3=true
      - ENABLE_AWS_SQS=true
      - ENABLE_GCP_STORAGE=true
      - ENABLE_GCP_PUBSUB=true
      - ENABLE_AZURE_BLOB=true
      - ENABLE_AZURE_QUEUE=true
    volumes:
      - ./floci-data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/healthz"]
      interval: 10s
      timeout: 5s
      retries: 3
```

**Key points**  

* **Ports** – FLOCI listens on a single port (8080). Your application reaches any mock service by using the appropriate hostname prefix (see step 4).  
* **Environment variables** – Each `ENABLE_*` flag turns a specific mock on or off, reducing memory use for unused services.  
* **Volumes** – Mounting `./floci-data` persists bucket contents, queue messages, or table rows across container restarts.  
* **Healthcheck** – CI pipelines can
