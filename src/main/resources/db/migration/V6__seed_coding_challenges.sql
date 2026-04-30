-- ════════════════════════════════════════════════════════════════════
-- V6__seed_coding_challenges.sql
-- 15 coding challenges seeded — Easy / Medium / Hard
-- Place at: src/main/resources/db/migration/V6__seed_coding_challenges.sql
-- ════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- EASY — 1. Two Sum
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    '[
        {"input": "nums = [2,7,11,15], target = 9",  "output": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"},
        {"input": "nums = [3,2,4], target = 6",       "output": "[1,2]"},
        {"input": "nums = [3,3], target = 6",         "output": "[0,1]"}
    ]',
    ARRAY['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists'],
    '{
        "javascript": "function twoSum(nums, target) {\n  // Your solution here\n}",
        "python":     "def two_sum(nums: list[int], target: int) -> list[int]:\n    pass",
        "java":       "import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    return {};\n}",
        "go":         "func twoSum(nums []int, target int) []int {\n    return nil\n}"
    }',
    '[
        {"input": "2\n2 7 11 15\n9",  "expectedOutput": "0 1"},
        {"input": "2\n3 2 4\n6",       "expectedOutput": "1 2"},
        {"input": "2\n3 3\n6",         "expectedOutput": "0 1"}
    ]',
    1800
);

-- ────────────────────────────────────────────────────────────────────
-- EASY — 2. Reverse a String
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Reverse a String',
    'Write a function that reverses a string. Return the reversed string.',
    '[
        {"input": "s = \"hello\"", "output": "\"olleh\""},
        {"input": "s = \"Hannah\"", "output": "\"hannaH\""}
    ]',
    ARRAY['1 <= s.length <= 10^5', 's consists of printable ASCII characters'],
    '{
        "javascript": "function reverseString(s) {\n  // Your solution here\n}",
        "python":     "def reverse_string(s: str) -> str:\n    pass",
        "java":       "class Solution {\n    public String reverseString(String s) {\n        return \"\";\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nstring reverseString(string s) {\n    return \"\";\n}",
        "go":         "func reverseString(s string) string {\n    return \"\"\n}"
    }',
    '[
        {"input": "hello",   "expectedOutput": "olleh"},
        {"input": "world",   "expectedOutput": "dlrow"},
        {"input": "abcde",   "expectedOutput": "edcba"},
        {"input": "a",       "expectedOutput": "a"}
    ]',
    900
);

-- ────────────────────────────────────────────────────────────────────
-- EASY — 3. Palindrome Check
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Valid Palindrome',
    'A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.',
    '[
        {"input": "s = \"A man, a plan, a canal: Panama\"", "output": "true"},
        {"input": "s = \"race a car\"", "output": "false"},
        {"input": "s = \" \"", "output": "true"}
    ]',
    ARRAY['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters'],
    '{
        "javascript": "function isPalindrome(s) {\n  // Your solution here\n}",
        "python":     "def is_palindrome(s: str) -> bool:\n    pass",
        "java":       "class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nbool isPalindrome(string s) {\n    return false;\n}",
        "go":         "func isPalindrome(s string) bool {\n    return false\n}"
    }',
    '[
        {"input": "racecar",                        "expectedOutput": "true"},
        {"input": "hello",                          "expectedOutput": "false"},
        {"input": "A man a plan a canal Panama",    "expectedOutput": "true"},
        {"input": " ",                              "expectedOutput": "true"}
    ]',
    900
);

-- ────────────────────────────────────────────────────────────────────
-- EASY — 4. FizzBuzz
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    'FizzBuzz',
    'Given an integer n, return a string array where: answer[i] == "FizzBuzz" if i is divisible by 3 and 5, answer[i] == "Fizz" if divisible by 3, answer[i] == "Buzz" if divisible by 5, otherwise answer[i] == i as a string. (1-indexed)',
    '[
        {"input": "n = 3",  "output": "[\"1\",\"2\",\"Fizz\"]"},
        {"input": "n = 5",  "output": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]"},
        {"input": "n = 15", "output": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]"}
    ]',
    ARRAY['1 <= n <= 10^4'],
    '{
        "javascript": "function fizzBuzz(n) {\n  // Return array of strings\n}",
        "python":     "def fizz_buzz(n: int) -> list[str]:\n    pass",
        "java":       "import java.util.*;\nclass Solution {\n    public List<String> fizzBuzz(int n) {\n        return new ArrayList<>();\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nvector<string> fizzBuzz(int n) {\n    return {};\n}",
        "go":         "func fizzBuzz(n int) []string {\n    return nil\n}"
    }',
    '[
        {"input": "5",  "expectedOutput": "1 2 Fizz 4 Buzz"},
        {"input": "15", "expectedOutput": "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz"},
        {"input": "1",  "expectedOutput": "1"}
    ]',
    900
);

-- ────────────────────────────────────────────────────────────────────
-- EASY — 5. Maximum Subarray (Kadane's)
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000005',
    'Maximum Subarray',
    'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    '[
        {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "[4,-1,2,1] has the largest sum = 6"},
        {"input": "nums = [1]",                      "output": "1"},
        {"input": "nums = [5,4,-1,7,8]",             "output": "23"}
    ]',
    ARRAY['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    '{
        "javascript": "function maxSubArray(nums) {\n  // Your solution here\n}",
        "python":     "def max_sub_array(nums: list[int]) -> int:\n    pass",
        "java":       "class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nint maxSubArray(vector<int>& nums) {\n    return 0;\n}",
        "go":         "func maxSubArray(nums []int) int {\n    return 0\n}"
    }',
    '[
        {"input": "9\n-2 1 -3 4 -1 2 1 -5 4", "expectedOutput": "6"},
        {"input": "1\n1",                       "expectedOutput": "1"},
        {"input": "5\n5 4 -1 7 8",             "expectedOutput": "23"},
        {"input": "3\n-1 -2 -3",               "expectedOutput": "-1"}
    ]',
    1800
);

-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 6. Longest Substring Without Repeating Characters
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000006',
    'Longest Substring Without Repeating Characters',
    'Given a string s, find the length of the longest substring without repeating characters.',
    '[
        {"input": "s = \"abcabcbb\"", "output": "3", "explanation": "\"abc\" has length 3"},
        {"input": "s = \"bbbbb\"",    "output": "1"},
        {"input": "s = \"pwwkew\"",   "output": "3"}
    ]',
    ARRAY['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
    '{
        "javascript": "function lengthOfLongestSubstring(s) {\n  // Sliding window\n}",
        "python":     "def length_of_longest_substring(s: str) -> int:\n    pass",
        "java":       "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nint lengthOfLongestSubstring(string s) {\n    return 0;\n}",
        "go":         "func lengthOfLongestSubstring(s string) int {\n    return 0\n}"
    }',
    '[
        {"input": "abcabcbb", "expectedOutput": "3"},
        {"input": "bbbbb",    "expectedOutput": "1"},
        {"input": "pwwkew",   "expectedOutput": "3"},
        {"input": "",         "expectedOutput": "0"},
        {"input": "abcdef",   "expectedOutput": "6"}
    ]',
    1800
);

-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 7. Valid Parentheses
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000007',
    'Valid Parentheses',
    'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid. Open brackets must be closed by the same type and in the correct order.',
    '[
        {"input": "s = \"()\"",     "output": "true"},
        {"input": "s = \"()[]{}\"", "output": "true"},
        {"input": "s = \"(]\"",     "output": "false"}
    ]',
    ARRAY['1 <= s.length <= 10^4', 's consists of parentheses only ''()[]{}"'],
    '{
        "javascript": "function isValid(s) {\n  // Use a stack\n}",
        "python":     "def is_valid(s: str) -> bool:\n    pass",
        "java":       "import java.util.*;\nclass Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nbool isValid(string s) {\n    return false;\n}",
        "go":         "func isValid(s string) bool {\n    return false\n}"
    }',
    '[
        {"input": "()",      "expectedOutput": "true"},
        {"input": "()[]{}",  "expectedOutput": "true"},
        {"input": "(]",      "expectedOutput": "false"},
        {"input": "([)]",    "expectedOutput": "false"},
        {"input": "{[]}",    "expectedOutput": "true"},
        {"input": "",        "expectedOutput": "true"}
    ]',
    1800
);

-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 8. Binary Search
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000008',
    'Binary Search',
    'Given an array of integers nums sorted in ascending order and an integer target, write a function to search target in nums. If target exists return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.',
    '[
        {"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4"},
        {"input": "nums = [-1,0,3,5,9,12], target = 2", "output": "-1"}
    ]',
    ARRAY['1 <= nums.length <= 10^4', '-10^4 <= nums[i], target <= 10^4', 'All integers in nums are unique', 'nums is sorted in ascending order'],
    '{
        "javascript": "function search(nums, target) {\n  // O(log n) required\n}",
        "python":     "def search(nums: list[int], target: int) -> int:\n    pass",
        "java":       "class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nint search(vector<int>& nums, int target) {\n    return -1;\n}",
        "go":         "func search(nums []int, target int) int {\n    return -1\n}"
    }',
    '[
        {"input": "6\n-1 0 3 5 9 12\n9",  "expectedOutput": "4"},
        {"input": "6\n-1 0 3 5 9 12\n2",  "expectedOutput": "-1"},
        {"input": "1\n5\n5",              "expectedOutput": "0"},
        {"input": "3\n1 3 5\n3",          "expectedOutput": "1"}
    ]',
    1800
);

-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 9. Merge Two Sorted Lists
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000009',
    'Merge Two Sorted Lists',
    'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.',
    '[
        {"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]"},
        {"input": "list1 = [], list2 = []",            "output": "[]"},
        {"input": "list1 = [], list2 = [0]",           "output": "[0]"}
    ]',
    ARRAY['0 <= list length <= 50', '-100 <= Node.val <= 100', 'Both lists are sorted in non-decreasing order'],
    '{
        "javascript": "function mergeTwoLists(list1, list2) {\n  // Merge sorted lists\n}",
        "python":     "def merge_two_lists(list1: list[int], list2: list[int]) -> list[int]:\n    # Input given as arrays for simplicity\n    pass",
        "java":       "import java.util.*;\nclass Solution {\n    public int[] mergeTwoLists(int[] l1, int[] l2) {\n        return new int[]{};\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nvector<int> mergeTwoLists(vector<int> l1, vector<int> l2) {\n    return {};\n}",
        "go":         "func mergeTwoLists(l1 []int, l2 []int) []int {\n    return nil\n}"
    }',
    '[
        {"input": "3\n1 2 4\n3\n1 3 4",  "expectedOutput": "1 1 2 3 4 4"},
        {"input": "0\n\n0\n",            "expectedOutput": ""},
        {"input": "0\n\n1\n0",           "expectedOutput": "0"}
    ]',
    1800
);

-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 10. Climbing Stairs (DP)
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000010',
    'Climbing Stairs',
    'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    '[
        {"input": "n = 2", "output": "2", "explanation": "1+1 or 2"},
        {"input": "n = 3", "output": "3", "explanation": "1+1+1, 1+2, or 2+1"}
    ]',
    ARRAY['1 <= n <= 45'],
    '{
        "javascript": "function climbStairs(n) {\n  // Dynamic programming\n}",
        "python":     "def climb_stairs(n: int) -> int:\n    pass",
        "java":       "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nint climbStairs(int n) {\n    return 0;\n}",
        "go":         "func climbStairs(n int) int {\n    return 0\n}"
    }',
    '[
        {"input": "1",  "expectedOutput": "1"},
        {"input": "2",  "expectedOutput": "2"},
        {"input": "3",  "expectedOutput": "3"},
        {"input": "5",  "expectedOutput": "8"},
        {"input": "10", "expectedOutput": "89"},
        {"input": "45", "expectedOutput": "1836311903"}
    ]',
    1800
);

-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 11. Number of Islands (BFS/DFS)
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000011',
    'Number of Islands',
    'Given an m x n 2D binary grid which represents a map of ''1''s (land) and ''0''s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    '[
        {"input": "grid = [[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]]", "output": "1"},
        {"input": "grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]", "output": "3"}
    ]',
    ARRAY['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', 'grid[i][j] is ''0'' or ''1'''],
    '{
        "javascript": "function numIslands(grid) {\n  // BFS or DFS\n}",
        "python":     "def num_islands(grid: list[list[str]]) -> int:\n    pass",
        "java":       "class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nint numIslands(vector<vector<char>>& grid) {\n    return 0;\n}",
        "go":         "func numIslands(grid [][]byte) int {\n    return 0\n}"
    }',
    '[
        {"input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", "expectedOutput": "1"},
        {"input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", "expectedOutput": "3"},
        {"input": "1 1\n1",                                            "expectedOutput": "1"},
        {"input": "1 1\n0",                                            "expectedOutput": "0"}
    ]',
    2700
);

-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 12. Product of Array Except Self
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000012',
    'Product of Array Except Self',
    'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must write an algorithm that runs in O(n) time and without using the division operation.',
    '[
        {"input": "nums = [1,2,3,4]",  "output": "[24,12,8,6]"},
        {"input": "nums = [-1,1,0,-3,3]", "output": "[0,0,9,0,0]"}
    ]',
    ARRAY['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30', 'The product of any prefix or suffix fits in a 32-bit integer'],
    '{
        "javascript": "function productExceptSelf(nums) {\n  // O(n), no division\n}",
        "python":     "def product_except_self(nums: list[int]) -> list[int]:\n    pass",
        "java":       "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nvector<int> productExceptSelf(vector<int>& nums) {\n    return {};\n}",
        "go":         "func productExceptSelf(nums []int) []int {\n    return nil\n}"
    }',
    '[
        {"input": "4\n1 2 3 4",          "expectedOutput": "24 12 8 6"},
        {"input": "5\n-1 1 0 -3 3",      "expectedOutput": "0 0 9 0 0"},
        {"input": "2\n1 1",              "expectedOutput": "1 1"}
    ]',
    1800
);

-- ────────────────────────────────────────────────────────────────────
-- HARD — 13. Trapping Rain Water
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000013',
    'Trapping Rain Water',
    'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    '[
        {"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"},
        {"input": "height = [4,2,0,3,2,5]",              "output": "9"}
    ]',
    ARRAY['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    '{
        "javascript": "function trap(height) {\n  // Two pointer or DP\n}",
        "python":     "def trap(height: list[int]) -> int:\n    pass",
        "java":       "class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nint trap(vector<int>& height) {\n    return 0;\n}",
        "go":         "func trap(height []int) int {\n    return 0\n}"
    }',
    '[
        {"input": "12\n0 1 0 2 1 0 1 3 2 1 2 1", "expectedOutput": "6"},
        {"input": "6\n4 2 0 3 2 5",              "expectedOutput": "9"},
        {"input": "1\n0",                         "expectedOutput": "0"},
        {"input": "3\n3 0 3",                     "expectedOutput": "3"}
    ]',
    2700
);

-- ────────────────────────────────────────────────────────────────────
-- HARD — 14. Median of Two Sorted Arrays
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000014',
    'Median of Two Sorted Arrays',
    'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    '[
        {"input": "nums1 = [1,3], nums2 = [2]",          "output": "2.00000"},
        {"input": "nums1 = [1,2], nums2 = [3,4]",        "output": "2.50000"}
    ]',
    ARRAY['nums1.length == m', 'nums2.length == n', '0 <= m, n <= 1000', '0 <= m + n', '-10^6 <= nums1[i], nums2[i] <= 10^6'],
    '{
        "javascript": "function findMedianSortedArrays(nums1, nums2) {\n  // O(log(m+n)) required\n}",
        "python":     "def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:\n    pass",
        "java":       "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        return 0.0;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\ndouble findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    return 0.0;\n}",
        "go":         "func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {\n    return 0.0\n}"
    }',
    '[
        {"input": "2\n1 3\n1\n2",    "expectedOutput": "2.00000"},
        {"input": "2\n1 2\n2\n3 4",  "expectedOutput": "2.50000"},
        {"input": "0\n\n1\n1",       "expectedOutput": "1.00000"},
        {"input": "1\n2\n0\n",       "expectedOutput": "2.00000"}
    ]',
    2700
);

-- ────────────────────────────────────────────────────────────────────
-- HARD — 15. Word Break (DP)
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec)
VALUES (
    '00000000-0000-0000-0000-000000000015',
    'Word Break',
    'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
    '[
        {"input": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",       "output": "true"},
        {"input": "s = \"applepenapple\", wordDict = [\"apple\",\"pen\"]",   "output": "true"},
        {"input": "s = \"catsandog\", wordDict = [\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]", "output": "false"}
    ]',
    ARRAY['1 <= s.length <= 300', '1 <= wordDict.length <= 1000', '1 <= wordDict[i].length <= 20', 's and wordDict[i] consist of only lowercase English letters'],
    '{
        "javascript": "function wordBreak(s, wordDict) {\n  // Dynamic programming\n}",
        "python":     "def word_break(s: str, word_dict: list[str]) -> bool:\n    pass",
        "java":       "import java.util.*;\nclass Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        return false;\n    }\n}",
        "cpp":        "#include<bits/stdc++.h>\nusing namespace std;\nbool wordBreak(string s, vector<string>& wordDict) {\n    return false;\n}",
        "go":         "func wordBreak(s string, wordDict []string) bool {\n    return false\n}"
    }',
    '[
        {"input": "leetcode\n2\nleet code",            "expectedOutput": "true"},
        {"input": "applepenapple\n2\napple pen",        "expectedOutput": "true"},
        {"input": "catsandog\n5\ncats dog sand and cat", "expectedOutput": "false"},
        {"input": "a\n1\na",                           "expectedOutput": "true"}
    ]',
    2700
);