---
title: "K-Dense-AI/scientific-agent-skills"
description: "A practical look at K-Dense-AI/scientific-agent-skills: what actually matters, how the options compare, and how to decide."
slug: k-dense-ai-scientific-agent-skills
publishDate: 2026-08-31T14:10:08Z
category: ai-tools
tags:
  - dense
  - scientific
  - agent
  - skills
heroImage: /images/k-dense-ai-scientific-agent-skills.jpg
heroImageAlt: "Title card reading “K-Dense-AI/scientific-agent-skills” set in white on a dark green gradient with concentric circle motifs"
author: "The HeyBlog Desk"
draft: false
sourceTopicId: topic_48535
---

## 1. Purpose & Core Functionality – Overview  

**Decision:** If you need a modular framework that turns large‑language‑model (LLM) capabilities into reproducible scientific workflows, install the **K‑Dense‑AI/scientific‑agent‑skills** repository and use its skill‑based architecture as the basis for your agent.  

The project provides a library of “skills”—self‑contained Python modules that perform a single scientific operation (e.g., unit conversion, data‑frame summarisation, statistical‑test selection). An orchestrator loads the skills at runtime, lets an LLM plan a sequence of actions, and executes the plan in a deterministic, auditable environment. In practice, the framework lets you:

* Define a catalog of domain‑specific actions (e.g., fetching spectra, fitting a regression, generating a LaTeX report).  
* Allow a language model to select and chain those actions from a natural‑language request.  
* Execute each action in a sandboxed Python function with explicit inputs and outputs, preserving reproducibility.  

For teams already using LLMs for literature review or hypothesis generation, the repository offers a concrete way to move from suggestion to action while keeping the code base maintainable.

---

## 2. Repository Architecture – Modules & Organization  

The repository follows a standard Python package layout. The top‑level `src/` directory holds the core engine; `src/skills/` contains the individual skill definitions.

| Path | Description |
|------|-------------|
| `src/agent/` | Orchestration engine – classes that receive a user prompt, query the LLM for a plan, and invoke the selected skills in order. The main entry point is `Agent.run(prompt: str)`. |
| `src/skills/` | Skill library – each file defines a subclass of `BaseSkill` with a `name`, a JSON‑schema for inputs, and an `execute` method (e.g., `unit_conversion.py`, `stat_test.py`, `plot_generator.py`). |
| `src/pipelines/` | Helpers for loading datasets (CSV, NetCDF, FITS), caching results, and streaming large files to skills. |
| `src/utils/` | Support code – logging, error handling, and thin wrappers around NumPy, Pandas, SciPy, and Matplotlib. |
| `examples/` | Demo scripts and Jupyter notebooks that illustrate typical end‑to‑end use cases (e.g., analysing a time‑series of temperature readings). |
| `tests/` | Pytest suites that validate each skill’s contract and the agent’s planning logic. |
| `docker/` | Dockerfile and compose files for reproducible container execution. |
| `docs/` | Sphinx‑generated documentation – API reference, skill catalogue, and contribution guide. |

### Core abstraction – `BaseSkill`

All skills inherit from `BaseSkill`, which enforces a uniform interface:

```python
class BaseSkill(ABC):
    name: str                     # Human‑readable identifier
    input_schema: dict            # JSON‑schema describing required fields
    output_schema: dict           # JSON‑schema for the result

    @abstractmethod
    def execute(self, **inputs) -> dict:
        """Run the skill and return a dictionary matching output_schema."""
```

Because every skill follows this contract, the orchestrator can treat them as interchangeable building blocks. The orchestrator also includes a **skill registry** (`SkillRegistry`) that discovers all subclasses automatically at import time, so new modules can be added without changing the core engine.

---

## 3. Getting Started – Prerequisites, Installation, & Environment Setup  

### 3.1 System requirements  

* **Python 3.10** or newer – the code uses type‑hinting introduced in 3.10.  
* Access to an LLM endpoint (e.g., OpenAI `gpt‑4o`, Anthropic Claude, or a self‑hosted model). The repository does not include a model; you must supply an API key.  
* Optional: Docker 20.10+ if you prefer containerised execution.  

### 3.2 Clone the repository  

```bash
git clone https://github.com/K-Dense-AI/scientific-agent-skills.git
cd scientific-agent-skills
```

### 3.3 Choose an environment strategy  

| Strategy | Typical use case | Setup steps |
|----------|------------------|-------------|
| **Virtualenv / venv** | Quick local testing on a workstation | `python -m venv .venv && source .venv/bin/activate` |
| **Conda** | Managing scientific packages in a separate environment | `conda create -n sci-agent python=3.10 && conda activate sci-agent` |
| **Docker** | Reproducibility across machines or CI pipelines | `docker compose up --build` (see `docker/docker-compose.yml`) |

### 3.4 Install dependencies  

The repository lists runtime requirements in `requirements.txt`. After activating your chosen environment, run:

```bash
pip install -r requirements.txt
```

Key dependencies include:

* `pydantic` – input validation against the JSON schemas.  
* `openai`, `anthropic`, or `cohere` – client libraries for LLM APIs.  
* `numpy`, `pandas`, `scipy`, `matplotlib` – core scientific stack.  

If you use Docker, the `Dockerfile` already installs these packages, so a manual `pip` step is unnecessary.

### 3.5 Configure API credentials  

Create a `.env` file in the project root (the code loads it via `python‑dotenv`). Example:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=...
```

Only set the variable that matches the LLM you intend to use. The orchestrator raises a clear error if the required key is missing.

### 3.6 Run the built‑in demo  

```bash
python -m src.examples.run_demo "Analyse the CSV file data/temperature.csv for seasonal trends and produce a short report."
```

The command triggers the agent, which will:

1. Ask the LLM to produce a plan (e.g., load CSV → compute monthly averages → run a Fourier analysis → plot results).  
2. Execute each skill in the prescribed order, passing outputs forward.  
3. Return a Markdown report with embedded figures.  

If the demo completes without errors, the installation is functional.

---

## 4. Extending the Skills – Building Custom Scientific AI Agents  

### 4.1 Inspecting the built‑in catalogue  

The orchestrator registers all `BaseSkill` subclasses automatically. To list available skills:

```python
from src.agent import SkillRegistry
print(SkillRegistry.list_skills())
```

You can restrict the agent to a subset of skills by supplying a list of names at construction:

```python
agent = Agent(
    llm=OpenAIClient(),
    allowed_skills=["unit_conversion", "stat_test", "plot_generator"]
)
```

### 4.2 Adding a new skill  

1. **Create a module** in `src/skills/`, for example `spectral_fit.py`.  
2. **Subclass `BaseSkill`** and define `name`, `input_schema`, `output_schema`, and `execute`.  

```python
from src.skills.base import BaseSkill
import numpy as np
from scipy.optimize import curve_fit

class SpectralFitSkill(BaseSkill):
    name = "spectral_fit"

    input_schema = {
        "type": "object",
        "properties": {
            "wavelength": {"type": "array", "items": {"type": "number"}},
            "intensity": {"type": "array", "items": {"type": "number"}},
            "model": {"type": "string", "enum": ["gaussian", "lorentzian"]},
        },
        "required": ["wavelength", "intensity", "model"]
    }

    output_schema = {
        "type": "object",
        "properties": {
            "parameters": {"type": "array", "items": {"type": "number"}},
            "fit_quality": {"type": "number"},
        },
        "required": ["parameters", "fit_quality"]
    }

    def execute(self, **inputs) -> dict:
        wl = np.array(inputs["wavelength"])
        I = np.array(inputs["intensity"])

        if inputs["model"] == "gaussian":
            def model_func(x, a, mu, sigma):
                return a * np.exp(-0.5 * ((x - mu) / sigma) ** 2)
        else:
            def model_func(x, a, mu, gamma):
                return a * gamma**2 / ((x - mu) ** 2 + gamma**2)

        popt, _ = curve_fit(model_func, wl, I)
        residual = I - model_func(wl, *popt)
        fit_quality = 1 - np.var(residual) / np.var(I)

        return {"parameters": list(popt), "fit_quality": float(fit_quality)}
```

3. **Register the skill** – no extra code is needed; the `SkillRegistry` discovers it on import. Ensure the module is imported early, for example by adding `import src.skills.spectral_fit` to `src/skills/__init__.py`.  
4. **Document the new skill** – add its description and schemas to `docs/skill_catalogue.rst` so users can discover it.

### 4.3 Modifying an existing skill  

If you need a different default behavior, subclass the original and override `execute`. Register the subclass under a new name to avoid breaking agents that rely on the original.

```python
class UnitConversionSkillV2(UnitConversionSkill):
    name = "unit_conversion_v2"

    def execute(self, **inputs) -> dict:
        result = super().execute(**inputs)
        if inputs.get("source_unit") == "Kelvin" and inputs.get("target_unit") == "Celsius":
            result["value"] = result["value"] - 273.15
        return result
```

### 4.4 Using custom skills with the agent  

Add the new name to the `allowed_skills` list when constructing the agent, or modify the list after creation:

```python
agent.allowed_skills.append("spectral_fit")
```

The LLM can now include `spectral_fit` in its plan, provided the prompt supplies enough context for the model to recognise the need.

---

## 5. Demonstrations & Benchmarks – Example Workflows  

The repository includes three Jupyter notebooks that showcase distinct scientific domains:

| Notebook | Domain | Demonstrated capabilities |
|----------|--------|---------------------------|
| `examples/01_time_series.ipynb` | Environmental data | Load a CSV, run `stat_test`, generate a seasonal‑decomposition plot, and produce a concise Markdown summary. |
| `examples/02_materials.ipynb` | Materials science | Perform unit conversion, apply the custom `spectral_fit` skill, visualise the fitted curve, and export results to a LaTeX table. |
| `examples/03_biology.ipynb` | Biological analysis | Retrieve a public gene‑expression dataset, execute a differential‑expression test, and create a volcano plot using `plot_generator`. |

Each notebook records execution time for the LLM planning step and for the total workflow. Reported times vary with the chosen LLM and hardware; on a typical laptop (Intel i7, 16 GB RAM) using OpenAI’s `gpt‑4o`, planning takes roughly 1–2 seconds, while the full pipeline (including data loading and plotting) ranges from 5 to 12 seconds depending on dataset size.

### Performance considerations  

* **LLM latency** dominates the total runtime; faster endpoints or local models will reduce planning time
