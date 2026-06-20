# Evidence checklist

## Move 1
- [ ] Two builders/apps
- [ ] Five known-good cases per app
- [ ] Expected outputs written before running the AI
- [ ] Actual outputs
- [ ] By-hand pass/fail grade
- [ ] Whether answer key existed before you asked

## Move 2
- [ ] First commit is hypothesis
- [ ] Has kill-number
- [ ] Timestamped before app code

## Move 3
- [ ] Hand-drawn boundary diagram
- [ ] Deterministic parts named
- [ ] Probabilistic parts named
- [ ] Who grades the grader
- [ ] Failure mode accepted

## Move 4
- [ ] Hand-drawn schema
- [ ] FK from grade to case marked
- [ ] FK from grade to run marked
- [ ] Two-user RLS proof screenshots

## Move 5
- [ ] Two builders use actual deployed tool
- [ ] At least one cold user
- [ ] Failing case they would have shipped
- [ ] Change made because of eval
- [ ] Re-run confirming improvement
- [ ] One surprise with evidence
