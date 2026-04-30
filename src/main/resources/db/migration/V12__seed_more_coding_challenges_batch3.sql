-- ════════════════════════════════════════════════════════════════════
-- V12__seed_more_coding_challenges_batch3.sql
-- 12 fully detailed problems (Easy / Medium / Hard)
-- ════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────
-- EASY — 28. Single Number
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000028',
'Single Number',
'Every element appears twice except one. Find that single one.',
'[{"input":"[2,2,1]","output":"1"},{"input":"[4,1,2,1,2]","output":"4"}]',
ARRAY['1 <= n <= 10^5'],
'{
"javascript":"function singleNumber(nums) {}",
"python":"def single_number(nums): pass",
"java":"import java.util.*;\npublic class Main {\n public static int singleNumber(int[] nums){ return 0; }\n}",
"cpp":"#include<bits/stdc++.h>\nusing namespace std;\nint singleNumber(vector<int>& nums){return 0;}",
"go":"func singleNumber(nums []int) int {return 0}"
}',
'[{"input":"3\n2 2 1","expectedOutput":"1"},{"input":"5\n4 1 2 1 2","expectedOutput":"4"}]',
900,
'EASY'
);


-- EASY — 29. Plus One
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000029',
'Plus One',
'Given a number as array, increment by one.',
'[{"input":"[1,2,3]","output":"[1,2,4]"}]',
ARRAY['1 <= digits.length <= 100'],
'{
"javascript":"function plusOne(digits) {}",
"python":"def plus_one(digits): pass",
"java":"import java.util.*;\npublic class Main {\n public static int[] plusOne(int[] digits){ return digits; }\n}",
"cpp":"#include<bits/stdc++.h>\nusing namespace std;",
"go":"func plusOne(digits []int) []int {return digits}"
}',
'[{"input":"3\n1 2 3","expectedOutput":"1 2 4"},{"input":"3\n9 9 9","expectedOutput":"1 0 0 0"}]',
900,
'EASY'
);


-- EASY — 30. Majority Element
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000030',
'Majority Element',
'Find element appearing more than n/2 times.',
'[{"input":"[3,2,3]","output":"3"}]',
ARRAY['n >= 1'],
'{
"javascript":"function majorityElement(nums) {}",
"python":"def majority_element(nums): pass",
"java":"import java.util.*;\npublic class Main {\n public static int majorityElement(int[] nums){ return 0; }\n}",
"cpp":"#include<bits/stdc++.h>\nusing namespace std;",
"go":"func majorityElement(nums []int) int {return 0}"
}',
'[{"input":"3\n3 2 3","expectedOutput":"3"},{"input":"7\n2 2 1 1 1 2 2","expectedOutput":"2"}]',
900,
'EASY'
);


-- EASY — 31. Power of Two
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000031',
'Power of Two',
'Return true if n is power of 2.',
'[{"input":"n=16","output":"true"}]',
ARRAY['-2^31 <= n <= 2^31-1'],
'{
"javascript":"function isPowerOfTwo(n) {}",
"python":"def is_power_of_two(n): pass",
"java":"public class Main { public static boolean isPowerOfTwo(int n){ return false; }}",
"cpp":"#include<bits/stdc++.h>\nusing namespace std;",
"go":"func isPowerOfTwo(n int) bool {return false}"
}',
'[{"input":"16","expectedOutput":"true"},{"input":"18","expectedOutput":"false"}]',
900,
'EASY'
);


-- ────────────────────────────────────────────────────────────────────
-- MEDIUM — 32. Top K Frequent Elements
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000032',
'Top K Frequent Elements',
'Return k most frequent elements.',
'[{"input":"[1,1,1,2,2,3], k=2","output":"[1,2]"}]',
ARRAY['1 <= nums.length <= 10^5'],
'{
"javascript":"function topKFrequent(nums,k) {}",
"python":"def top_k(nums,k): pass",
"java":"import java.util.*;\npublic class Main {}",
"cpp":"#include<bits/stdc++.h>",
"go":"package main"
}',
'[{"input":"6\n1 1 1 2 2 3\n2","expectedOutput":"1 2"}]',
1800,
'MEDIUM'
);


-- MEDIUM — 33. Kth Largest Element
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000033',
'Kth Largest Element',
'Find kth largest element.',
'[{"input":"[3,2,1,5,6,4],k=2","output":"5"}]',
ARRAY['1 <= k <= n'],
'{
"javascript":"function kthLargest(nums,k) {}",
"python":"def kth_largest(nums,k): pass",
"java":"import java.util.*;\npublic class Main {}",
"cpp":"#include<bits/stdc++.h>",
"go":"package main"
}',
'[{"input":"6\n3 2 1 5 6 4\n2","expectedOutput":"5"}]',
1800,
'MEDIUM'
);


-- MEDIUM — 34. Container With Most Water
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000034',
'Container With Most Water',
'Find max water container.',
'[{"input":"[1,8,6,2,5,4,8,3,7]","output":"49"}]',
ARRAY['n >= 2'],
'{
"javascript":"function maxArea(h) {}",
"python":"def max_area(h): pass",
"java":"public class Main {}",
"cpp":"#include<bits/stdc++.h>",
"go":"package main"
}',
'[{"input":"9\n1 8 6 2 5 4 8 3 7","expectedOutput":"49"}]',
1800,
'MEDIUM'
);


-- MEDIUM — 35. 3Sum
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000035',
'3Sum',
'Find all triplets that sum to zero.',
'[{"input":"[-1,0,1,2,-1,-4]","output":"[[-1,-1,1],[-1,0,1]]"}]',
ARRAY['n <= 3000'],
'{
"javascript":"function threeSum(nums) {}",
"python":"def three_sum(nums): pass",
"java":"public class Main {}",
"cpp":"#include<bits/stdc++.h>",
"go":"package main"
}',
'[{"input":"6\n-1 0 1 2 -1 -4","expectedOutput":"2"}]',
1800,
'MEDIUM'
);


-- MEDIUM — 36. Subarray Sum Equals K
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000036',
'Subarray Sum Equals K',
'Count subarrays with sum k.',
'[{"input":"[1,1,1],k=2","output":"2"}]',
ARRAY['n <= 10^5'],
'{
"javascript":"function subarraySum(nums,k) {}",
"python":"def subarray_sum(nums,k): pass",
"java":"public class Main {}",
"cpp":"#include<bits/stdc++.h>",
"go":"package main"
}',
'[{"input":"3\n1 1 1\n2","expectedOutput":"2"}]',
1800,
'MEDIUM'
);


-- ────────────────────────────────────────────────────────────────────
-- HARD — 37. Merge K Sorted Lists
-- ────────────────────────────────────────────────────────────────────
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000037',
'Merge K Sorted Lists',
'Merge k sorted arrays.',
'[{"input":"[[1,4,5],[1,3,4],[2,6]]","output":"[1,1,2,3,4,4,5,6]"}]',
ARRAY['k <= 1000'],
'{
"javascript":"function mergeK(lists) {}",
"python":"def merge_k(lists): pass",
"java":"public class Main {}",
"cpp":"#include<bits/stdc++.h>",
"go":"package main"
}',
'[{"input":"3\n3\n1 4 5\n3\n1 3 4\n2\n2 6","expectedOutput":"1 1 2 3 4 4 5 6"}]',
2700,
'HARD'
);


-- HARD — 38. Word Ladder
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000038',
'Word Ladder',
'Shortest transformation sequence.',
'[{"input":"hit->cog","output":"5"}]',
ARRAY['word length <= 10'],
'{
"javascript":"function ladder() {}",
"python":"def ladder(): pass",
"java":"public class Main {}",
"cpp":"#include<bits/stdc++.h>",
"go":"package main"
}',
'[{"input":"hit cog\n6\nhot dot dog lot log cog","expectedOutput":"5"}]',
2700,
'HARD'
);


-- HARD — 39. Serialize and Deserialize Binary Tree
INSERT INTO coding_challenges (id, title, description, examples, constraints, starter_code, test_cases, time_limit_sec, difficulty)
VALUES (
'00000000-0000-0000-0000-000000000039',
'Serialize Deserialize Binary Tree',
'Convert tree to string and back.',
'[{"input":"[1,2,3,null,null,4,5]","output":"same"}]',
ARRAY['n <= 10^4'],
'{
"javascript":"class Codec {}",
"python":"class Codec: pass",
"java":"public class Main {}",
"cpp":"#include<bits/stdc++.h>",
"go":"package main"
}',
'[{"input":"1 2 3 null null 4 5","expectedOutput":"valid"}]',
2700,
'HARD'
);