# Real Value Product Brief: AI Regression Firewall

## Weak idea
Generate golden cases, generate a rubric, judge outputs. A user can do that in ChatGPT.

## Strong idea
Turn every confirmed bad AI output into a permanent regression test and stop it from shipping again.

## Why this is hard with only GenAI
Plain GenAI does not naturally maintain:
- production failure history
- locked expected behavior before re-run
- prompt/model version history
- deterministic assertions
- repeatable runs on the same cases
- release gates
- exportable evidence
- user-level data isolation

## Killer workflow
1. Paste a bad AI output from testing or production.
2. Store it as a production trace.
3. Convert it into a regression golden case.
4. Add deterministic assertions.
5. Save prompt/model version.
6. Run eval.
7. App says Ship / Do Not Ship.
8. Change prompt/guardrail/retrieval.
9. Re-run same cases.
10. Export proof that the known failure was fixed and did not regress.

## One-line pitch
AI Regression Firewall turns AI failures into permanent tests, so prompt/model changes cannot silently reintroduce bugs.
