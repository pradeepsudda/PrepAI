import { useState, useMemo }  from 'react'
import { useQuery, useMutation,useQueryClient }  from '@tanstack/react-query'
import {
  Sparkles, BookOpen, Play, Code2,
  FileText, Globe, Github, Clock,
  ChevronDown, ChevronUp, ExternalLink,
  Zap, Target, RefreshCw, Search,
  CheckCircle2, AlertCircle, Filter,
  Brain, Layers, Users, Shuffle,
  RotateCcw,
} from 'lucide-react'
import { resourcesApi } from '@/services/resourceApi'
import { PageHeader }    from '@/components/ui/PageHeader'
import { cn }            from '@/utils/cn'
import toast             from 'react-hot-toast'
import type { ResourceItem, ResourceSection, ResourcesResponse } from '@/types'

// ── Types matching actual backend JSON ───────────────────────
// (already in your types/index.ts — shown here for reference)
// difficulty can be "ALL" from AI — treat as INTERMEDIATE
// quickWins may be at any position in JSON — always use optional chaining

// ── Config ───────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'DSA',           label: 'DSA',           icon: '🧩', color: 'text-blue-400',   border: 'border-blue-500/40 bg-blue-500/5'   },
  { id: 'SYSTEM_DESIGN', label: 'System Design', icon: '🏗️', color: 'text-purple-400', border: 'border-purple-500/40 bg-purple-500/5' },
  { id: 'BEHAVIORAL',    label: 'Behavioral',    icon: '🗣️', color: 'text-green-400',  border: 'border-green-500/40 bg-green-500/5'  },
  { id: 'MIXED',         label: 'Mixed',         icon: '⚡', color: 'text-amber-400',  border: 'border-amber-500/40 bg-amber-500/5'  },
]

const DEPTHS = [
  { id: 'QUICK',         label: 'Quick Prep',    sub: '1-2 weeks'  },
  { id: 'THOROUGH',      label: 'Thorough',      sub: '4-6 weeks'  },
  { id: 'COMPREHENSIVE', label: 'Full Prep',      sub: '2-3 months' },
]

const DIFF_CONFIG: Record<string, string> = {
  BEGINNER:     'bg-green-500/10 text-green-400 border-green-500/20',
  INTERMEDIATE: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ADVANCED:     'bg-red-500/10 text-red-400 border-red-500/20',
  ALL:          'bg-gray-500/10 text-gray-400 border-gray-500/20',  
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  VIDEO:         { label: 'Video',     icon: <Play size={11} />,      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20'       },
  ARTICLE:       { label: 'Article',   icon: <FileText size={11} />,  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20'     },
  COURSE:        { label: 'Course',    icon: <BookOpen size={11} />,  color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  PRACTICE:      { label: 'Practice',  icon: <Code2 size={11} />,     color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20'   },
  BOOK:          { label: 'Book',      icon: <BookOpen size={11} />,  color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20'   },
  DOCUMENTATION: { label: 'Docs',      icon: <FileText size={11} />,  color: 'text-gray-300',   bg: 'bg-gray-500/10 border-gray-500/20'     },
  REPO:          { label: 'Repo',      icon: <Github size={11} />,    color: 'text-gray-300',   bg: 'bg-gray-500/10 border-gray-500/20'     },
}

// Fallback for unknown types
const DEFAULT_TYPE = { label: 'Resource', icon: <Globe size={11} />, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' }

// ── Main Component ────────────────────────────────────────────

export default function ResourcesPage() {
  const qc = useQueryClient()

  const [selectedCats,  setSelectedCats]  = useState<string[]>(['DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'MIXED'])
  const [prepDepth,     setPrepDepth]     = useState<'QUICK' | 'THOROUGH' | 'COMPREHENSIVE'>('THOROUGH')
  const [specificTopic, setTopic]         = useState('')
  const [search,        setSearch]        = useState('')
  const [typeFilter,    setTypeFilter]    = useState('ALL')
  const [diffFilter,    setDiffFilter]    = useState('ALL')
  const [expandedSecs,  setExpanded]      = useState<Set<number>>(new Set([0, 1, 2]))
  const [hasGenerated,  setHasGenerated]  = useState(false)

  const [queryParams, setQueryParams] = useState<{
    categories: string[]
    prepDepth:  string
    topic?:     string
  } | null>(null)

  // Initial auto-load on mount
  const { data: resources, isLoading, isError, refetch } = useQuery({
    queryKey: ['resources', queryParams],
    queryFn:  () => {
      if (queryParams) {
        return resourcesApi.generate({
          categories:    queryParams.categories,
          prepDepth:     queryParams.prepDepth as 'QUICK' | 'THOROUGH' | 'COMPREHENSIVE',
          specificTopic: queryParams.topic,
        }).then((r: { data: any }) => r.data)
      }
      // Default load on page open
      return resourcesApi.generate({
        categories: ['DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'MIXED'],
        prepDepth:  'THOROUGH',
      }).then((r: { data: any }) => r.data)
    },
    // Don't auto-fetch until user explicitly clicks generate
    enabled:         hasGenerated,
    staleTime:       1000 * 60 * 30,   // 30 min
    retry:           1,
    refetchOnWindowFocus: false,
  })

  const handleGenerate = () => {
    setQueryParams({
      categories: selectedCats,
      prepDepth,
      topic:      specificTopic.trim() || undefined,
    })
    setHasGenerated(true)
    setExpanded(new Set([0, 1, 2]))
  }

  const handleRefresh = async () => {
    try {
      await resourcesApi.clearCache()
    } catch { /* ignore if no cache */ }
    qc.invalidateQueries({ queryKey: ['resources'] })
    refetch()
    toast.success('Refreshed!')
  }

  const toggleCat = (id: string) =>
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )

  const toggleSection = (i: number) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  // ── ✅ FIX: safe filtering with null guards ───────────────────
  const filteredSections: ResourceSection[] = useMemo(() => {
    if (!resources?.sections) return []

    return resources.sections
      .map((sec: { resources: any }) => ({
        ...sec,
        // Guard against null resources array
        resources: (sec.resources ?? []).filter((r: { title: any; description: any; topics: any; type: string; difficulty: string }) => {
          if (!r) return false
          const matchSearch = !search ||
            (r.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (r.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (r.topics ?? []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
          const matchType  = typeFilter === 'ALL' || r.type === typeFilter
          const matchDiff  = diffFilter === 'ALL' || r.difficulty === diffFilter
          return matchSearch && matchType && matchDiff
        }),
      }))
      .filter((sec: { resources: string | any[] }) => sec.resources.length > 0)
  }, [resources, search, typeFilter, diffFilter])

  const totalResources = filteredSections.reduce((s, sec) => s + sec.resources.length, 0)

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="AI Resources"
        subtitle="Personalised study materials based on your interview performance"
        action={hasGenerated && !isLoading && (
          <button
            onClick={handleRefresh}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        )}
      />

      {/* ── Config card ── */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <Brain size={15} className="text-brand-400" />
          Customise Your Learning Path
        </h2>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Category selector */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Interview Categories</p>
            <div className="space-y-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCat(cat.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all',
                    selectedCats.includes(cat.id)
                      ? `${cat.border} text-white`
                      : 'border-surface-border text-gray-500 hover:text-gray-300 hover:bg-surface-raised',
                  )}
                >
                  <span>{cat.icon}</span>
                  <span className={selectedCats.includes(cat.id) ? cat.color : ''}>{cat.label}</span>
                  {selectedCats.includes(cat.id) && (
                    <CheckCircle2 size={13} className={cn('ml-auto', cat.color)} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Depth selector */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Preparation Depth</p>
            <div className="space-y-2">
              {DEPTHS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setPrepDepth(d.id as typeof prepDepth)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all',
                    prepDepth === d.id
                      ? 'border-brand-500/40 bg-brand-500/5 text-white'
                      : 'border-surface-border text-gray-500 hover:text-gray-300 hover:bg-surface-raised',
                  )}
                >
                  <span>{d.label}</span>
                  <span className={cn('text-xs', prepDepth === d.id ? 'text-brand-400' : 'text-gray-600')}>
                    {d.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic + generate button */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">
                Specific Topic <span className="text-gray-600">(optional)</span>
              </p>
              <input
                value={specificTopic}
                onChange={e => setTopic(e.target.value)}
                placeholder='e.g. "dynamic programming", "kafka"'
                className="input-field text-sm"
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
              <p className="text-xs text-gray-600 mt-1">
                Leave blank to use your analytics automatically
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || selectedCats.length === 0}
              className="btn-primary flex items-center justify-center gap-2 py-3 mt-auto disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {hasGenerated ? 'Regenerate' : 'Generate My Resources'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty state — before first generate ── */}
      {!hasGenerated && !isLoading && (
        <div className="card p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20
                          flex items-center justify-center text-3xl">
            🧠
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Your Personalised Resource Guide
            </h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Select your categories, pick a prep depth, and click Generate.
              The AI will analyse your interview scores and create a tailored study plan.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="btn-primary flex items-center gap-2 mt-2"
          >
            <Sparkles size={15} /> Generate Resources
          </button>
        </div>
      )}

      {/* ── Loading state ── */}
      {isLoading && (
        <div className="card p-16 flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-surface-border" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent
                            border-t-brand-500 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-brand-600/10
                            flex items-center justify-center text-2xl">
              🧠
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">Analysing your performance…</p>
            <p className="text-sm text-gray-500 mt-1">
              AI is reviewing your weak areas and curating resources
            </p>
          </div>
          <div className="flex gap-3 text-xs text-gray-600">
            {['Analysing scores', 'Curating resources', 'Personalising plan'].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5 animate-pulse"
                style={{ animationDelay: `${i * 0.4}s` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {isError && !isLoading && (
        <div className="card p-10 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-red-400" />
          <div>
            <p className="text-white font-medium">Failed to generate resources</p>
            <p className="text-sm text-gray-500 mt-1">
              This usually happens if the AI response is too large. Try selecting fewer
              categories or using "Quick Prep" depth.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSelectedCats(['DSA']); setPrepDepth('QUICK') }}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <RotateCcw size={13} /> Reset to defaults
            </button>
            <button onClick={handleGenerate} className="btn-primary text-sm">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {resources && !isLoading && !isError && (
        <div className="space-y-5 animate-fade-in">

          {/* ── Summary banner ── */}
          <SummaryBanner resources={resources} />

          {/* ── Filters ── */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search resources, topics…"
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-gray-500" />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-surface-raised border border-surface-border text-white text-xs
                           px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="ALL">All types</option>
                {Object.keys(TYPE_CONFIG).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <select
              value={diffFilter}
              onChange={e => setDiffFilter(e.target.value)}
              className="bg-surface-raised border border-surface-border text-white text-xs
                         px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>

            <span className="text-xs text-gray-500 ml-auto whitespace-nowrap">
              {totalResources} resource{totalResources !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── No filter results ── */}
          {filteredSections.length === 0 && (search || typeFilter !== 'ALL' || diffFilter !== 'ALL') && (
            <div className="card p-10 text-center">
              <p className="text-gray-400 mb-3">No resources match your filters</p>
              <button
                onClick={() => { setSearch(''); setTypeFilter('ALL'); setDiffFilter('ALL') }}
                className="btn-ghost text-sm"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* ── Sections ── */}
          {filteredSections
            .slice()
            .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
            .map((section, idx) => (
              <SectionCard
                key={`${section.sectionTitle}-${idx}`}
                section={section}
                index={idx}
                isExpanded={expandedSecs.has(idx)}
                onToggle={() => toggleSection(idx)}
              />
            ))
          }
        </div>
      )}
    </div>
  )
}


// ════════════════════════════════════════════════════════════════
// SUMMARY BANNER — null-safe throughout
// ════════════════════════════════════════════════════════════════
function SummaryBanner({ resources }: { resources: ResourcesResponse }) {
  const [studyPlanOpen, setStudyPlanOpen] = useState(false)

  return (
    <div className="card p-5 border-brand-500/20 bg-brand-500/3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-600/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-brand-400" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white">Your AI Analysis</h3>
            {resources.estimatedPrepTime && (
              <span className="text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20
                               px-2 py-0.5 rounded-lg">
                ⏱ {resources.estimatedPrepTime}
              </span>
            )}
          </div>

          {/* Summary text */}
          {resources.personalizedSummary && (
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {resources.personalizedSummary}
            </p>
          )}

          {/* Quick wins */}
          {resources.quickWins && resources.quickWins.length > 0 && (
            <div className="bg-surface-raised rounded-xl p-4 border border-surface-border mb-3">
              <p className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
                <Zap size={12} /> Quick Wins — Do These Now
              </p>
              <div className="space-y-2">
                {resources.quickWins.map((win, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={cn(
                      'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                      'text-xs font-bold mt-0.5',
                      i === 0 ? 'bg-red-500/20 text-red-400' :
                      i === 1 ? 'bg-amber-500/20 text-amber-400' :
                                'bg-green-500/20 text-green-400',
                    )}>
                      {i + 1}
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">{win}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study plan — collapsible */}
          {resources.studyPlan && (
            <button
              onClick={() => setStudyPlanOpen(!studyPlanOpen)}
              className="flex items-center gap-1.5 text-xs text-gray-500
                         hover:text-gray-300 transition-colors"
            >
              <Target size={11} />
              {studyPlanOpen ? 'Hide' : 'Show'} full study plan
              {studyPlanOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}

          {studyPlanOpen && resources.studyPlan && (
            <div className="mt-2 p-3 bg-surface-raised rounded-xl border border-surface-border">
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                {resources.studyPlan}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ════════════════════════════════════════════════════════════════
// SECTION CARD
// ════════════════════════════════════════════════════════════════
function SectionCard({
  section, index, isExpanded, onToggle,
}: {
  section:    ResourceSection
  index:      number
  isExpanded: boolean
  onToggle:   () => void
}) {
  const priorityLabel =
    index === 0 ? '🎯 Priority' :
    index === 1 ? '⚡ Important' :
    `#${index + 1}`

  const priorityStyle =
    index === 0 ? 'text-red-400 bg-red-500/10 border-red-500/20' :
    index === 1 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
    'text-gray-400 bg-surface-raised border-surface-border'

  return (
    <div className="card overflow-hidden">
      {/* Section header — always clickable */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left
                   hover:bg-surface-raised/30 transition-colors"
      >
        <span className={cn('badge border text-xs flex-shrink-0 whitespace-nowrap', priorityStyle)}>
          {priorityLabel}
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">
            {section.sectionTitle || 'Resources'}
          </h3>
          {section.sectionDescription && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {section.sectionDescription}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500">
            {(section.resources ?? []).length} resource{(section.resources ?? []).length !== 1 ? 's' : ''}
          </span>
          {isExpanded
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Resources grid */}
      {isExpanded && (
        <div className="border-t border-surface-border p-5">
          {(!section.resources || section.resources.length === 0) ? (
            <p className="text-xs text-gray-600 text-center py-4">No resources in this section</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {section.resources.map((resource, i) => (
                resource ? <ResourceCard key={i} resource={resource} /> : null
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


// ════════════════════════════════════════════════════════════════
// RESOURCE CARD — null-safe, handles unknown type/difficulty
// ════════════════════════════════════════════════════════════════
function ResourceCard({ resource }: { resource: ResourceItem }) {
  // ✅ Safe fallback for any type the AI returns
  const typeConf = TYPE_CONFIG[resource.type] ?? DEFAULT_TYPE

  // ✅ Safe fallback for "ALL" or any unknown difficulty
  const diffStyle = DIFF_CONFIG[resource.difficulty] ?? DIFF_CONFIG.INTERMEDIATE

  // Ensure URL has protocol
  const safeUrl = resource.url
    ? (resource.url.startsWith('http') ? resource.url : `https://${resource.url}`)
    : '#'

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200',
        'hover:border-brand-500/40 hover:bg-brand-500/3 cursor-pointer',
        resource.isPriority
          ? 'border-brand-500/30 bg-brand-500/5'
          : 'border-surface-border bg-surface-raised',
      )}
    >
      {/* Badges row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cn('badge border text-xs', typeConf.bg, typeConf.color)}>
          {typeConf.icon}
          <span className="ml-1">{typeConf.label}</span>
        </span>

        <span className={cn('badge border text-xs', diffStyle)}>
          {resource.difficulty ?? 'GENERAL'}
        </span>

        {resource.isPriority && (
          <span className="badge text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400">
            ⭐ Top Pick
          </span>
        )}

        <ExternalLink
          size={13}
          className="ml-auto text-gray-600 group-hover:text-brand-400 transition-colors"
        />
      </div>

      {/* Title + platform */}
      <div>
        <h4 className="text-sm font-semibold text-white group-hover:text-brand-300
                        transition-colors leading-snug">
          {resource.title ?? 'Resource'}
        </h4>
        {resource.platform && (
          <p className="text-xs text-gray-500 mt-0.5 font-medium">{resource.platform}</p>
        )}
      </div>

      {/* Description */}
      {resource.description && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
          {resource.description}
        </p>
      )}

      {/* Why recommended */}
      {resource.whyRecommended && (
        <div className="flex items-start gap-1.5 p-2.5 bg-surface-card rounded-lg
                        border border-surface-border">
          <Sparkles size={10} className="text-brand-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-400 leading-relaxed">{resource.whyRecommended}</p>
        </div>
      )}

      {/* Footer — time + topics */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        {resource.estimatedTime && (
          <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
            <Clock size={11} /> {resource.estimatedTime}
          </span>
        )}

        {resource.topics && resource.topics.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {resource.topics.slice(0, 2).map(t => (
              <span
                key={t}
                className="text-xs bg-surface-card border border-surface-border
                           text-gray-500 px-1.5 py-0.5 rounded-md"
              >
                {t}
              </span>
            ))}
            {resource.topics.length > 2 && (
              <span className="text-xs text-gray-600">+{resource.topics.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </a>
  )
}