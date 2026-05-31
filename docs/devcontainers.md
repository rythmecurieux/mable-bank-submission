# Dev Containers — plain-English guide

How to run and develop each Mable Bank implementation inside a Dev Container, with or without an IDE.

**You do not need .NET, Node, or Ruby installed on your machine** if you use a Dev Container. You do need **Docker Desktop** (or Docker Engine on Linux) running.

## What each folder gives you

| Folder | Language | Container includes | After first open |
| --- | --- | --- | --- |
| `dotnet/` | C# / .NET 9 | SDK, test tools | `dotnet restore` |
| `nodejs-typescript/` | TypeScript / Node 22 | npm, Vitest, ESLint | `npm ci` |
| `ruby/` | Ruby 3.3 | Bundler, RSpec, RuboCop | `bundle install` |

Each folder is **self-contained**. Pick the stack you want to review or change — you do not need to open the whole repo at once.

## The one rule that catches most people

**Open the implementation folder**, not the repository root.

| Do this | Not this |
| --- | --- |
| `mabel/dotnet/` | `mabel/` |
| `mabel/nodejs-typescript/` | `mabel/` |
| `mabel/ruby/` | `mabel/` |

If you open the repo root, the Dev Container config will not be found.

---

## Three ways to use Dev Containers

### 1. Develop in an IDE (recommended for changing code)

Open the folder in VS Code, Rider, WebStorm, or RubyMine and attach to the container. Edit, run tests, and debug inside the container.

See [Develop in your IDE](#develop-in-your-ide) below.

### 2. Run checks inside a container you already have open

If the IDE has already started the Dev Container, open a **terminal in the container** and run:

```bash
./demo.sh
```

That installs dependencies (if needed), runs tests, builds, and runs the sample CSV through the CLI.

TypeScript only — full CI-style check:

```bash
npm run verify
```

### 3. Smoke-test without opening an IDE

Useful for a quick “does it work?” check from a terminal. Docker pulls the image, mounts your code, runs `./demo.sh`, and exits.

From the implementation folder:

```bash
./script/test-devcontainer.sh
```

**Windows PowerShell** (recommended on Windows — no local SDK required):

```powershell
cd dotnet              # or nodejs-typescript / ruby
./script/test-devcontainer.ps1
```

Each stack has `script/test-devcontainer.ps1`. On Git Bash / WSL / Linux / macOS use `./script/test-devcontainer.sh` instead.

---

## Develop in your IDE

### VS Code (any stack)

1. Install **Docker Desktop** and the **Dev Containers** extension.
2. **File → Open Folder** → choose `dotnet/`, `nodejs-typescript/`, or `ruby/`.
3. When prompted, click **Reopen in Container**.  
   Or: Command Palette → **Dev Containers: Reopen in Container**.
4. Wait for the container to build and run the post-create step (`dotnet restore`, `npm ci`, or `bundle install`).
5. Open the integrated terminal and run:

   ```bash
   ./demo.sh
   ```

6. To run the CLI with your own CSV files, see [Reviewer guide — custom CSV](reviewer-guide.md#run-the-cli-with-your-own-csv-files).

**Run tests from the UI:** use the Test Explorer (C# / Vitest extensions are preconfigured in `devcontainer.json`).

### JetBrains Rider — .NET (`dotnet/`)

1. Install Docker and the **Dev Containers** plugin (bundled in recent Rider versions).
2. **File → Open** → select the `dotnet/` folder.
3. When Rider offers to open in a Dev Container, accept it.  
   Or: find **Dev Containers** on the welcome screen / recent projects.
4. After the container is ready, open the terminal and run `./demo.sh`.
5. Run tests: right-click the test project or use the unit test tool window.

### JetBrains WebStorm — TypeScript (`nodejs-typescript/`)

1. **File → Open** → select `nodejs-typescript/`.
2. Open in Dev Container when prompted.
3. Terminal: `./demo.sh` or `npm run verify`.
4. Run tests: npm tool window → `test`, or use the Vitest integration.

### JetBrains RubyMine — Ruby (`ruby/`)

1. **File → Open** → select `ruby/`.
2. Open in Dev Container when prompted.
3. Terminal: `./demo.sh` (RSpec + RuboCop + fixture CLI).
4. Run tests: RSpec run configuration, or `bundle exec rspec` in the terminal.

### If the container fails to start

- Confirm Docker Desktop is running.
- Confirm you opened **`dotnet/`**, **`nodejs-typescript/`**, or **`ruby/`**, not the repo root.
- **Rebuild** the container from the IDE (VS Code: Command Palette → **Dev Containers: Rebuild Container**; JetBrains: Dev Containers UI → rebuild).
- On a slow first run, image pull can take several minutes.

---

## Day-to-day commands (inside the container)

All commands assume you are in the implementation folder terminal **inside** the Dev Container.

| Goal | .NET | TypeScript | Ruby |
| --- | --- | --- | --- |
| Full check | `./demo.sh` | `./demo.sh` or `npm run verify` | `./demo.sh` |
| Tests only | `dotnet test` | `npm test` | `bundle exec rspec` |
| Run sample CLI | see [reviewer guide](reviewer-guide.md#c--net--dotnet) | see [reviewer guide](reviewer-guide.md#typescript--nodejs-typescript) | see [reviewer guide](reviewer-guide.md#ruby--ruby) |
| Lint / format | (via build) | `npm run lint` | `bundle exec rubocop` |

Expected fixture output: **4** successful transfers; key balance **`1111234522226789: 4820.50`**. Full set: [Reviewer guide — expected outcome](reviewer-guide.md#expected-outcome).

---

## Troubleshooting

### Git Bash on Windows: invalid working directory

**Symptom:**

```text
docker: Error response from daemon: the working directory 'C:/Program Files/Git/workspaces/ruby' is invalid
```

**Cause:** Git Bash rewrites Unix paths like `/workspaces/ruby` before passing them to Docker.

**Fix (pick one):**

- Re-run with the updated `./script/test-devcontainer.sh` (sets `MSYS_NO_PATHCONV=1`), or
- Use **PowerShell**: `./script/test-devcontainer.ps1` (Ruby), or
- Use **WSL** instead of Git Bash.

### `demo.sh`: bash\r not found

**Symptom:** `/usr/bin/env: 'bash\r': No such file or directory`

**Cause:** Shell scripts saved with Windows (CRLF) line endings.

**Fix:** Ensure `*.sh` files use LF line endings. The repo’s `.gitattributes` enforces this for shell scripts; re-checkout or convert if you cloned on Windows before that was added.

### TypeScript: Node version errors locally

The TypeScript stack requires **Node 22+**. If your host Node is older, use the Dev Container — Node 22 is already inside the image.

### Ruby: bundler / gem errors on the host

If `bundle install` fails on Windows (SSL, paths), use the Dev Container or `./script/test-devcontainer.ps1` — gems install cleanly inside Linux.

### I only want to review, not develop

Run the smoke test from a terminal (no IDE):

```bash
cd ruby   # or dotnet / nodejs-typescript
./script/test-devcontainer.sh
```

That is enough to verify tests and the fixture CLI. For a timed review, see [Reviewer guide](reviewer-guide.md) (~2–5 minutes per stack).

---

## What is *not* in scope

These Dev Containers are for **local development and review only**:

- No Docker Compose
- No database or message broker
- No production deployment

See [ADR 001 — no database in scope](decisions/001-no-database-or-event-sourcing.md).

---

## Related docs

| Document | Purpose |
| --- | --- |
| [Reviewer guide](reviewer-guide.md) | All terminal commands, custom CSV CLI, FAQ |
| [docs/README.md](README.md) | Documentation index |
| [Polyglot comparison](architecture/polyglot-comparison.md) | Same model across three stacks |
