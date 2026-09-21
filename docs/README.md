# Stuhdee — Documentation

Documentation for the Stuhdee codebase.

> **Read this first:** Stuhdee is currently a **scaffold**. The directory tree and
> file names are in place, but nearly every source file is empty (0 bytes). These
> docs describe both what exists today and the architecture the structure implies,
> and they label which is which. See [Implementation Status](./07-implementation-status.md)
> for the exact inventory.

## Contents

| Doc | What it covers |
| --- | --- |
| [01 — Overview](./01-overview.md) | What Stuhdee is, who it's for, current state |
| [02 — Tech Stack](./02-tech-stack.md) | Installed dependencies, planned dependencies, tooling |
| [03 — Architecture](./03-architecture.md) | Layering rules, data flow, where code belongs |
| [04 — Project Structure](./04-project-structure.md) | Annotated file tree |
| [05 — Data Model](./05-data-model.md) | Proposed database schema and entities |
| [06 — API Reference](./06-api-reference.md) | Route inventory and intended contracts |
| [07 — Implementation Status](./07-implementation-status.md) | What's built, what's empty, known issues |
| [08 — Development Guide](./08-development-guide.md) | Setup, env vars, scripts, conventions |

## Conventions used in these docs

Every claim is tagged so you can tell fact from inference:

- **Implemented** — the code exists and does this today.
- **Scaffolded** — the file exists but is empty; the name states the intent.
- **Proposed** — not present in the repo at all; inferred from the structure and
  recorded here as a design suggestion to accept, change, or reject.

Anything marked *Proposed* is a starting point for discussion, not a decision
that has already been made.
