# Move 3 boundary guide

Draw this by hand.

## Deterministic box

- User identity
- Feature rows
- Golden cases
- Rubric text
- Eval run records
- Case grade records
- Change log
- Pass/fail tally
- Run-to-run comparison
- RLS policies

## Probabilistic box

- Model judging expected vs actual
- Model writing reason
- Model suggesting fix
- Model estimating missing requirements

## Circle this decision

Who grades the grader?

Recommended answer:
The model gives a provisional verdict, but the builder must verify failures against golden cases they already wrote before the run. The tool is not trusted because it sounds confident; it is trusted only when it flags cases the builder agrees are real failures and then a re-run improves them.

## Failure mode accepted

The model may be too generous or too strict. I reduce this by preserving the human-written golden answer, showing reasons, and requiring before/after behavioral evidence.
