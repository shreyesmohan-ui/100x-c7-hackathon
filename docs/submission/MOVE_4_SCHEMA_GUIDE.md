# Move 4 schema guide

Draw this by hand.

## Tables

User/Auth
  ↓
features
  ↓
golden_cases
  ↓
case_grades
  ↑
eval_runs
  ↓
change_logs

## Most important relationship

`case_grades.golden_case_id` + `case_grades.run_id`

This lets you compare the same golden case across Run 1 and Run 2.

## RLS proof to screenshot

1. Log in as User A.
2. Create feature: "A private eval feature".
3. Add one golden case.
4. Log out.
5. Log in as User B.
6. User B should not see User A's feature/case/run/grade.
7. Screenshot empty result.
