-- ════════════════════════════════════════════════════════════════════
-- V11__seed_even_more_coding_challenges.sql
-- More coding challenges (Easy / Medium / Hard)
-- ════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────
-- EASY — 22. Missing Number
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000022',
    'Missing Number',
    'Given an array containing n distinct numbers in the range [0, n], return the only number missing from the array.',
    '[
        {"input": "nums = [3,0,1]", "output": "2"},
        {"input": "nums = [0,1]", "output": "2"}
    ]',
    ARRAY['1 <= nums.length <= 10^5'],
    '{
        "javascript": "function missingNumber(nums) {\n}",
        "python": "def missing_number(nums):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n    public static int missingNumber(int[] nums) {\n        return 0;\n    }\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\nint missingNumber(vector<int>& nums) {\n    return 0;\n}",
        "go": "func missingNumber(nums []int) int {\n    return 0\n}"
    }',
    '[
        {"input": "3\n3 0 1", "expectedOutput": "2"},
        {"input": "2\n0 1", "expectedOutput": "2"}
    ]',
    900,
    'EASY'
);


-- ────────────────────────────────────────────────────────────────────
-- EASY — 23. Move Zeroes
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000023',
    'Move Zeroes',
    'Move all 0s to the end of the array while maintaining the relative order of non-zero elements.',
    '[
        {"input": "nums = [0,1,0,3,12]", "output": "[1,3,12,0,0]"}
    ]',
    ARRAY['1 <= nums.length <= 10^5'],
    '{
        "javascript": "function moveZeroes(nums) {\n}",
        "python": "def move_zeroes(nums):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n    public static void moveZeroes(int[] nums) {\n    }\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\nvoid moveZeroes(vector<int>& nums) {\n}",
        "go": "func moveZeroes(nums []int) {\n}"
    }',
    '[
        {"input": "5\n0 1 0 3 12", "expectedOutput": "1 3 12 0 0"}
    ]',
    900,
    'EASY'
);


-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 24. Set Matrix Zeroes
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000024',
    'Set Matrix Zeroes',
    'If an element is 0, set its entire row and column to 0.',
    '[
        {"input": "matrix = [[1,1,1],[1,0,1],[1,1,1]]", "output": "[[1,0,1],[0,0,0],[1,0,1]]"}
    ]',
    ARRAY['m,n <= 200'],
    '{
        "javascript": "function setZeroes(matrix) {\n}",
        "python": "def set_zeroes(matrix):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\n",
        "go": "package main\n"
    }',
    '[
        {"input": "3 3\n1 1 1\n1 0 1\n1 1 1", "expectedOutput": "1 0 1 0 0 0 1 0 1"}
    ]',
    1800,
    'MEDIUM'
);


-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 25. Daily Temperatures
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000025',
    'Daily Temperatures',
    'For each day, tell how many days you have to wait until a warmer temperature.',
    '[
        {"input": "temps = [73,74,75,71,69,72,76,73]", "output": "[1,1,4,2,1,1,0,0]"}
    ]',
    ARRAY['1 <= temps.length <= 10^5'],
    '{
        "javascript": "function dailyTemperatures(temps) {\n}",
        "python": "def daily_temperatures(temps):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\n",
        "go": "package main\n"
    }',
    '[
        {"input": "8\n73 74 75 71 69 72 76 73", "expectedOutput": "1 1 4 2 1 1 0 0"}
    ]',
    1800,
    'MEDIUM'
);


-- ────────────────────────────────────────────────────────────────────
-- HARD — 26. Largest Rectangle in Histogram
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000026',
    'Largest Rectangle in Histogram',
    'Find the area of the largest rectangle in the histogram.',
    '[
        {"input": "heights = [2,1,5,6,2,3]", "output": "10"}
    ]',
    ARRAY['1 <= heights.length <= 10^5'],
    '{
        "javascript": "function largestRectangleArea(heights) {\n}",
        "python": "def largest_rectangle_area(heights):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\n",
        "go": "package main\n"
    }',
    '[
        {"input": "6\n2 1 5 6 2 3", "expectedOutput": "10"}
    ]',
    2700,
    'HARD'
);


-- ────────────────────────────────────────────────────────────────────
-- HARD — 27. Minimum Window Substring
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000027',
    'Minimum Window Substring',
    'Return the smallest substring of s that contains all characters of t.',
    '[
        {"input": "s = \"ADOBECODEBANC\", t = \"ABC\"", "output": "BANC"}
    ]',
    ARRAY['1 <= s.length, t.length <= 10^5'],
    '{
        "javascript": "function minWindow(s, t) {\n}",
        "python": "def min_window(s, t):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\n",
        "go": "package main\n"
    }',
    '[
        {"input": "ADOBECODEBANC\nABC", "expectedOutput": "BANC"}
    ]',
    2700,
    'HARD'
);