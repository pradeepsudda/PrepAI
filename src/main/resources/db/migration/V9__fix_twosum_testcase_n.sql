-- V9__fix_twosum_testcase_n.sql
-- Two Sum test cases had "2" as the first line for ALL 3 cases.
-- The first line represents N (array length), so TC1 and TC2 were wrong:
--   TC1 array [2,7,11,15] has 4 elements  → first line must be "4"
--   TC2 array [3,2,4]     has 3 elements  → first line must be "3"
--   TC3 array [3,3]       has 2 elements  → first line "2" was already correct

UPDATE coding_challenges
SET test_cases = '[
    {"input": "4\n2 7 11 15\n9", "expectedOutput": "0 1"},
    {"input": "3\n3 2 4\n6",     "expectedOutput": "1 2"},
    {"input": "2\n3 3\n6",       "expectedOutput": "0 1"}
]'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000001';
