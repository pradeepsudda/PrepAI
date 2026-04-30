-- ════════════════════════════════════════════════════════════════════
-- V10__seed_more_coding_challenges.sql
-- Additional coding challenges (Easy / Medium / Hard)
-- ════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────
-- EASY — 16. Contains Duplicate
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000016',
    'Contains Duplicate',
    'Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.',
    '[
        {"input": "nums = [1,2,3,1]", "output": "true"},
        {"input": "nums = [1,2,3,4]", "output": "false"}
    ]',
    ARRAY['1 <= nums.length <= 10^5'],
    '{
        "javascript": "function containsDuplicate(nums) {\n}",
        "python": "def contains_duplicate(nums):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n    public static boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\nbool containsDuplicate(vector<int>& nums) {\n    return false;\n}",
        "go": "func containsDuplicate(nums []int) bool {\n    return false\n}"
    }',
    '[
        {"input": "4\n1 2 3 1", "expectedOutput": "true"},
        {"input": "4\n1 2 3 4", "expectedOutput": "false"}
    ]',
    900,
    'EASY'
);


-- ────────────────────────────────────────────────────────────────────
-- EASY — 17. Valid Anagram
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000017',
    'Valid Anagram',
    'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    '[
        {"input": "s = \"anagram\", t = \"nagaram\"", "output": "true"},
        {"input": "s = \"rat\", t = \"car\"", "output": "false"}
    ]',
    ARRAY['1 <= s.length <= 10^5'],
    '{
        "javascript": "function isAnagram(s, t) {\n}",
        "python": "def is_anagram(s, t):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n    public static boolean isAnagram(String s, String t) {\n        return false;\n    }\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\nbool isAnagram(string s, string t) {\n    return false;\n}",
        "go": "func isAnagram(s string, t string) bool {\n    return false\n}"
    }',
    '[
        {"input": "anagram\nnagaram", "expectedOutput": "true"},
        {"input": "rat\ncar", "expectedOutput": "false"}
    ]',
    900,
    'EASY'
);


-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 18. Group Anagrams
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000018',
    'Group Anagrams',
    'Given an array of strings strs, group the anagrams together.',
    '[
        {"input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"],[\"bat\"]]"}
    ]',
    ARRAY['1 <= strs.length <= 10^4'],
    '{
        "javascript": "function groupAnagrams(strs) {\n}",
        "python": "def group_anagrams(strs):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n    public static List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\nvector<vector<string>> groupAnagrams(vector<string>& strs) {\n    return {};\n}",
        "go": "func groupAnagrams(strs []string) [][]string {\n    return nil\n}"
    }',
    '[
        {"input": "6\neat tea tan ate nat bat", "expectedOutput": "3"}
    ]',
    1800,
    'MEDIUM'
);


-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 19. Rotate Array
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000019',
    'Rotate Array',
    'Given an array, rotate the array to the right by k steps.',
    '[
        {"input": "nums = [1,2,3,4,5,6,7], k = 3", "output": "[5,6,7,1,2,3,4]"}
    ]',
    ARRAY['1 <= nums.length <= 10^5'],
    '{
        "javascript": "function rotate(nums, k) {\n}",
        "python": "def rotate(nums, k):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n    public static void rotate(int[] nums, int k) {\n    }\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\nvoid rotate(vector<int>& nums, int k) {\n}",
        "go": "func rotate(nums []int, k int) {\n}"
    }',
    '[
        {"input": "7\n1 2 3 4 5 6 7\n3", "expectedOutput": "5 6 7 1 2 3 4"}
    ]',
    1800,
    'MEDIUM'
);


-- ────────────────────────────────────────────────────────────────────
-- HARD — 20. LRU Cache
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000020',
    'LRU Cache',
    'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
    '[
        {"input": "put(1,1), put(2,2), get(1), put(3,3), get(2)", "output": "[1,-1]"}
    ]',
    ARRAY['1 <= capacity <= 3000'],
    '{
        "javascript": "class LRUCache {\n}",
        "python": "class LRUCache:\n    pass",
        "java": "import java.util.*;\npublic class Main {\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\n",
        "go": "package main\n"
    }',
    '[
        {"input": "5\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2", "expectedOutput": "1 -1"}
    ]',
    2700,
    'HARD'
);


-- ────────────────────────────────────────────────────────────────────
-- HARD — 21. Sliding Window Maximum
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
    '00000000-0000-0000-0000-000000000021',
    'Sliding Window Maximum',
    'Given an array nums and a sliding window of size k, return the maximum in each window.',
    '[
        {"input": "nums = [1,3,-1,-3,5,3,6,7], k = 3", "output": "[3,3,5,5,6,7]"}
    ]',
    ARRAY['1 <= nums.length <= 10^5'],
    '{
        "javascript": "function maxSlidingWindow(nums, k) {\n}",
        "python": "def max_sliding_window(nums, k):\n    pass",
        "java": "import java.util.*;\npublic class Main {\n}",
        "cpp": "#include<bits/stdc++.h>\nusing namespace std;\n",
        "go": "package main\n"
    }',
    '[
        {"input": "8\n1 3 -1 -3 5 3 6 7\n3", "expectedOutput": "3 3 5 5 6 7"}
    ]',
    2700,
    'HARD'
);