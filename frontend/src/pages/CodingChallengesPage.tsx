import { useState }           from 'react'
import { useNavigate }         from 'react-router-dom'
import { useQuery }            from '@tanstack/react-query'
import { Code2, ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { codingApi }           from '@/services/codingApi'
import { cn }                  from '@/utils/cn'
import type { CodingChallenge } from '@/types'

type Filter = 'ALL' | 'EASY' | 'MEDIUM' | 'HARD'

const DIFFICULTY_META: Record<string, { label: string; color: string; badge: string }> = {
  EASY:   { label: 'Easy',   color: 'text-green-400',  badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  HARD:   { label: 'Hard',   color: 'text-red-400',    badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const PAGE_SIZE = 10

export default function CodingChallengesPage() {
  const navigate          = useNavigate()
  const [filter, setFilter] = useState<Filter>('ALL')
  const [page, setPage]   = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['challenges', filter, page],
    queryFn:  () =>
      codingApi.getChallenges(page, PAGE_SIZE, filter === 'ALL' ? undefined : filter)
        .then(r => r.data),
    staleTime: 60_000,
  })

  const handleFilterChange = (f: Filter) => {
    setFilter(f)
    setPage(0)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Code2 size={24} className="text-brand-400" />
          <h1 className="font-display font-bold text-white text-2xl">Coding Challenges</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Practice algorithmic problems and improve your coding interview skills.
          Click any challenge to open it in the IDE.
        </p>
      </div>

      {/* Difficulty filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-medium transition-colors border',
              filter === f
                ? f === 'ALL'
                  ? 'bg-brand-600 text-white border-brand-500'
                  : f === 'EASY'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : f === 'MEDIUM'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-transparent text-gray-400 border-surface-border hover:border-gray-500 hover:text-gray-300',
            )}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand-400" />
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-gray-500">
          Failed to load challenges. Please try again.
        </div>
      )}

      {data && (
        <>
          <div className="space-y-2">
            {data.content.map((c: CodingChallenge, idx: number) => (
              <ChallengeRow
                key={c.id}
                challenge={c}
                index={page * PAGE_SIZE + idx + 1}
                onClick={() => navigate(`/coding/${c.id}`)}
              />
            ))}

            {data.content.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                No challenges found for this difficulty.
              </div>
            )}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <span className="text-xs text-gray-500">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, data.totalElements)} of {data.totalElements}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={data.first}
                  className="p-1.5 rounded-lg border border-surface-border text-gray-400
                             hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-gray-400">
                  Page {page + 1} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={data.last}
                  className="p-1.5 rounded-lg border border-surface-border text-gray-400
                             hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ChallengeRow({
  challenge,
  index,
  onClick,
}: {
  challenge: CodingChallenge
  index:     number
  onClick:   () => void
}) {
  const meta = DIFFICULTY_META[challenge.difficulty] ?? DIFFICULTY_META.MEDIUM
  const mins = Math.round(challenge.timeLimitSec / 60)

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl
                 bg-surface-card border border-surface-border
                 hover:border-brand-500/40 hover:bg-surface-raised
                 transition-all text-left group"
    >
      <span className="w-8 text-xs text-gray-600 font-mono shrink-0">{index}</span>

      <span className="flex-1 text-sm text-white font-medium group-hover:text-brand-300 transition-colors">
        {challenge.title}
      </span>

      <span className={cn('badge border text-xs shrink-0', meta.badge)}>
        {meta.label}
      </span>

      <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
        <Clock size={12} />
        {mins}m
      </span>
    </button>
  )
}
