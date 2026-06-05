# Dev Containers: plain-English guide

How to run and develop each Mable Bank implementation inside a Dev Container, with or without an IDE.

**You do not need .NET, Node, or Ruby installed on your machine** if you use a Dev Container. You do need **Docker Desktop** (or Docker Engine on Linux) running.

## What each folder gives you

| Folder | Language | Container includes | After first open |
| --- | --- | --- | --- |
| `dotnet/` | C# / .NET 9 | SDK, test tools | `dotnet restore` |
| `nodejs-typescript/` | TypeScript / Node 22 | npm, Vitest, ESLint (deps pre-installed in image) | `npm ci` if lockfile changed |
| `ruby/` | Ruby 3.3 | Bundler, RSpec, RuboCop (pre-installed in image) | `bundle check` (fast) |

Each folder is **self-contained**. Pick the stack you want to review or change. You do not need to open the whole repo at once.

## How long setup takes

| Step | First time | Later opens |
| --- | --- | --- |
| Pull base Docker image | 5–15 min | Skipped (cached) |
| Build Dev Container image | 3–10 min | ~30 s if Dockerfile unchanged |
| RubyMine / JetBrains backend | 2–5 min | 1–3 min |
| `bundle install` / `npm ci` / `dotnet restore` | 1–3 min | Seconds (`bundle check`, cached layers) |

**First open** on Windows with RubyMine is often **15–25 minutes** total. That is normal.

**Later opens** of the same container should be **under a minute** if you do not rebuild.

To avoid waiting:

- **Do not rebuild** unless the Dockerfile or `Gemfile.lock` changed.
- When closing RubyMine, choose **keep the Dev Container running** if offered.
- For a quick verify only, skip the IDE: `./script/test-devcontainer.ps1` in `ruby/` (~5–10 min first time, faster after image cache).

The Ruby image now installs gems at **build time** (not from the bind-mounted folder), so reopening the project does not re-download RuboCop and RSpec every time.

## The one rule that catches most people

**Open the implementation folder**, not the repository root.

| Do this | Not this |
| --- | --- |
| `mable/dotnet/` | `mable/` |
| `mable/nodejs-typescript/` | `mable/` |
| `mable/ruby/` | `mable/` |

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

TypeScript only: full CI-style check:

```bash
npm run verify
```

### 3. Smoke-test without opening an IDE

Useful for a quick “does it work?” check from a terminal. Docker pulls the image, mounts your code, runs `./demo.sh`, and exits.

From the implementation folder:

```bash
./script/test-devcontainer.sh
```

**Windows PowerShell** (recommended on Windows: no local SDK required):

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

6. To run the CLI with your own CSV files, see [Reviewer guide: custom CSV](reviewer-guide.md#run-the-cli-with-your-own-csv-files).

**Run tests from the UI:** use the Test Explorer (C# / Vitest extensions are preconfigured in `devcontainer.json`).

### JetBrains Rider: .NET (`dotnet/`)

1. Install Docker and the **Dev Containers** plugin (bundled in recent Rider versions).
2. **File → Open** → select the `dotnet/` folder.
3. When Rider offers to open in a Dev Container, accept it.  
   Or: find **Dev Containers** on the welcome screen / recent projects.
4. After the container is ready, open the terminal and run `./demo.sh`.
5. Run tests: right-click the test project or use the unit test tool window.

### JetBrains WebStorm: TypeScript (`nodejs-typescript/`)

1. **File → Open** → select `nodejs-typescript/`.
2. Open in Dev Container when prompted.
3. Terminal: `./demo.sh` or `npm run verify`.
4. Run tests: npm tool window → `test`, or use the Vitest integration.

### JetBrains RubyMine: Ruby (`ruby/`)

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

Expected fixture output: **4** successful transfers; key balance **`1111234522226789: 4820.50`**. Full set: [Reviewer guide: expected outcome](reviewer-guide.md#expected-outcome).

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

The TypeScript stack requires **Node 22+**. If your host Node is older, use the Dev Container. Node 22 is already inside the image.

### TypeScript: `fatal: not a git repository` / Cannot create Dev Container

Same root cause as Ruby: opening **`nodejs-typescript/`** alone hides `.git` at the repo root. Rebuild the Dev Container so the parent repo mounts at `/workspaces/repo-root` and the workspace is `/workspaces/repo-root/nodejs-typescript`.

### Ruby: `fatal: not a git repository` / Cannot create Dev Container

**Symptom:** RubyMine shows `Failed to execute /usr/local/bin/git: fatal: not a git repository (or any parent up to mount point /workspaces)` during **Preparing environment** or **Uploading worker binary**, then **Cannot create Dev Container**. `bundle install` may still run in the background.

**Cause:** You opened the **`ruby/`** folder. The `.git` directory lives in the **repo root** (`mable-bank-submission/`), one level up. JetBrains Dev Containers mount only the opened folder by default, so Git is missing inside the container.

**Fix (rebuild):** Rebuild the Dev Container. The updated `devcontainer.json` mounts the parent repo at `/workspaces/repo-root` and sets the workspace to `/workspaces/repo-root/ruby`, so Git works.

**Workaround (no IDE):** From PowerShell in `ruby/`:

```powershell
./script/test-devcontainer.ps1
```

**Workaround (JetBrains):** On the welcome screen, use **Create Dev Container and Clone Sources** from a Git remote instead of **Mount Sources**, so the full repo (including `.git`) is inside the container.

### Ruby: Bundler permission error on `/usr/local/rvm/gems`

**Symptom:** `Bundler::PermissionError` writing to `/usr/local/rvm/gems/default/cache/...` during `postCreateCommand` or `bundle install`.

**Cause:** The Dev Container runs as user `vscode`, but RVM gem directories in the base image are owned by root.

**Fix (inside the container terminal):**

```bash
cd /workspaces/ruby   # or your mounted ruby folder
bundle config set --local path vendor/bundle
bundle install
```

Then run `./demo.sh`.

**Fix (rebuild):** Rebuild the Dev Container from the RubyMine welcome screen so the updated Dockerfile and `.bundle/config` apply. See [Rebuild the container](#if-the-container-fails-to-start) above.

### Ruby: bundler / gem errors on the host

If `bundle install` fails on Windows (SSL, paths), use the Dev Container or `./script/test-devcontainer.ps1`. Gems install cleanly inside Linux.

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

See [ADR 001: no database in scope](decisions/001-no-database-or-event-sourcing.md).

---

## Related docs

| Document | Purpose |
| --- | --- |
| [Reviewer guide](reviewer-guide.md) | All terminal commands, custom CSV CLI, FAQ |
| [docs/README.md](README.md) | Documentation index |
| [Polyglot comparison](architecture/polyglot-comparison.md) | Same model across three stacks |
