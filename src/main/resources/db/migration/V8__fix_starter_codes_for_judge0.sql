-- V8__fix_starter_codes_for_judge0.sql
-- Judge0 runs Python 3.8, Java via 'java Main', C++ and Go require main functions.
-- This migration patches all existing starter codes to be runnable.

-- ── Python ───────────────────────────────────────────────────────────────────
-- Python 3.8 doesn't support `list[int]` / `dict[str,int]` as runtime type hints.
-- `from __future__ import annotations` postpones evaluation, making it compatible.
UPDATE coding_challenges
SET starter_code = jsonb_set(
    starter_code,
    '{python}',
    to_jsonb(
        'from __future__ import annotations' || chr(10) ||
        (starter_code->>'python')
    )
)
WHERE starter_code ? 'python';

-- ── C++ ──────────────────────────────────────────────────────────────────────
-- All C++ starters are function-only; without int main() the linker fails.
UPDATE coding_challenges
SET starter_code = jsonb_set(
    starter_code,
    '{cpp}',
    to_jsonb(
        (starter_code->>'cpp') ||
        chr(10) || chr(10) ||
        'int main() {' || chr(10) ||
        '    // TODO: read input, call your function, print output' || chr(10) ||
        '    return 0;' || chr(10) ||
        '}'
    )
)
WHERE starter_code ? 'cpp';

-- ── Go ───────────────────────────────────────────────────────────────────────
-- Go starters are missing `package main` and `func main()`.
UPDATE coding_challenges
SET starter_code = jsonb_set(
    starter_code,
    '{go}',
    to_jsonb(
        'package main' || chr(10) || chr(10) ||
        (starter_code->>'go') ||
        chr(10) || chr(10) ||
        'func main() {' || chr(10) ||
        '    // TODO: read input, call your function, print output' || chr(10) ||
        '}'
    )
)
WHERE starter_code ? 'go';

-- ── Java ─────────────────────────────────────────────────────────────────────
-- Judge0 compiles Java as Main.java and runs `java Main`.
-- Starters use `class Solution` with no main method → NZEC.
-- Rename to public class Main and inject a main stub before the closing brace.
UPDATE coding_challenges
SET starter_code = jsonb_set(
    starter_code,
    '{java}',
    to_jsonb(
        replace(
            regexp_replace((starter_code->>'java'), '\}\s*$', ''),
            'class Solution {',
            'public class Main {'
        ) ||
        chr(10) || chr(10) ||
        '    public static void main(String[] args) throws Exception {' || chr(10) ||
        '        java.util.Scanner sc = new java.util.Scanner(System.in);' || chr(10) ||
        '        // TODO: read input and call your solution method above' || chr(10) ||
        '    }' || chr(10) ||
        '}'
    )
)
WHERE starter_code ? 'java';
