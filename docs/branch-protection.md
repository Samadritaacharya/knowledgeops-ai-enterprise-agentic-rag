# Recommended `main` branch protection

The repository CI is designed so the default branch can be protected without creating path-filter deadlocks. Both workflows run on every pull request targeting `main`.

## Required checks

Configure the `main` ruleset to require these exact status checks:

- **Python verification**
- **Web verification**

The workflow display names are `Python AI CI` and `Interactive Web CI`; the required-check names above are the job names GitHub exposes to branch protection.

## Recommended rules for a solo portfolio repository

In **Settings → Rules → Rulesets**, create an active branch ruleset targeting the default branch `main` and enable:

- Require a pull request before merging.
- Require status checks to pass before merging.
- Add `Python verification` and `Web verification` as required checks.
- Require conversation resolution before merging.
- Block force pushes.
- Restrict deletions of the protected branch.

For a solo-owned portfolio, requiring **0 approving reviews** is practical because the owner may not have a second reviewer available. If a real collaborator is available, increase this to **1 approving review**.

Avoid broad permanent bypass rules. An administrator/emergency bypass can be retained only if needed for repository recovery.

## Why the workflows have no path filters

Required status checks and path-filtered workflows are a risky combination: a documentation-only pull request can skip a filtered workflow, leaving the required check permanently absent/pending. These workflows therefore run on every PR to `main`, even when the change is documentation-only.

## Merge policy

Preferred flow:

```text
feature/fix branch
  -> pull request
  -> Python verification
  -> Web verification
  -> review/conversation resolution
  -> squash or merge
  -> protected main
```

Do not push feature changes directly to `main` once the ruleset is active.
