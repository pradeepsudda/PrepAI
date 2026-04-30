import { useState, useRef }  from 'react'
import { useMutation }       from '@tanstack/react-query'
import { useNavigate }       from 'react-router-dom'
import { Upload, FileText, ChevronRight, X } from 'lucide-react'
import { resumeApi }         from '@/services/resumeApi'
import { interviewApi }      from '@/services/interviewApi'
import { useInterviewStore } from '@/store/interviewStore'
import { PageHeader }        from '@/components/ui/PageHeader'
import { Badge }             from '@/components/ui/Badge'
import { cn }                from '@/utils/cn'
import type { ResumeProfile, SessionType } from '@/types'
import toast                 from 'react-hot-toast'
 
const SESSION_TYPES: SessionType[] = ['DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'MIXED']
 
export default function ResumePage() {
  const navigate            = useNavigate()
  const { setSession }       = useInterviewStore()
  const fileInputRef         = useRef<HTMLInputElement>(null)
  const [file, setFile]      = useState<File | null>(null)
  const [profile, setProfile] = useState<ResumeProfile | null>(null)
  const [sessionType, setSessionType] = useState<SessionType>('MIXED')
 
  const parseMutation = useMutation({
    mutationFn: (f: File) => resumeApi.parseResume(f),
    onSuccess:  (res) => { setProfile(res.data); toast.success('Resume parsed!') },
    onError:    () => toast.error('Failed to parse resume'),
  })
 
  const startMutation = useMutation({
    mutationFn: () => resumeApi.personalise(profile!, sessionType)
      .then(r => interviewApi.createSession(r.data)),
    onSuccess:  (res) => {
      setSession(res.data)
      navigate(`/interview/${res.data.id}`)
    },
    onError: () => toast.error('Failed to start session'),
  })
 
  const handleFile = (f: File) => {
    if (!f.name.match(/\.(pdf|txt|doc|docx)$/i)) {
      toast.error('Please upload a PDF or text file')
      return
    }
    setFile(f)
    parseMutation.mutate(f)
  }
 
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Resume Personalisation"
        subtitle="Upload your resume for tailored interview questions"
      />
 
      {/* Upload zone */}
      <div
        className={cn(
          'card p-10 flex flex-col items-center justify-center text-center cursor-pointer',
          'border-dashed transition-all',
          parseMutation.isPending ? 'border-brand-500/40 bg-brand-500/5' :
          file ? 'border-green-500/40 bg-green-500/5' :
          'hover:border-brand-500/30 hover:bg-surface-raised/20',
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
 
        {parseMutation.isPending ? (
          <>
            <div className="w-10 h-10 border-2 border-surface-border border-t-brand-500 rounded-full animate-spin mb-3" />
            <p className="text-white font-medium">Analysing resume…</p>
            <p className="text-xs text-gray-500 mt-1">AI is extracting your profile</p>
          </>
        ) : file ? (
          <>
            <FileText size={32} className="text-green-400 mb-3" />
            <p className="text-white font-medium">{file.name}</p>
            <button
              onClick={e => { e.stopPropagation(); setFile(null); setProfile(null) }}
              className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 mt-2"
            >
              <X size={12} /> Remove
            </button>
          </>
        ) : (
          <>
            <Upload size={32} className="text-gray-500 mb-3" />
            <p className="text-white font-medium">Drop your resume here</p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOC, or TXT · Max 5MB</p>
          </>
        )}
      </div>
 
      {/* Parsed profile */}
      {profile && (
        <div className="card p-6 mt-6 space-y-5 animate-slide-up">
          <h2 className="text-sm font-semibold text-white">Extracted Profile</h2>
 
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">Experience</p>
              <p className="text-white font-medium">{profile.experienceYears} years · {profile.seniorityLevel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Roles</p>
              <p className="text-white font-medium">{profile.roles?.slice(0, 2).join(', ')}</p>
            </div>
          </div>
 
          <div>
            <p className="text-xs text-gray-500 mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.techStack?.map(t => (
                <Badge key={t} variant="info">{t}</Badge>
              ))}
            </div>
          </div>
 
          <div>
            <p className="text-xs text-gray-500 mb-2">Focus Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.focusAreas?.map(t => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>
 
          {/* Session type */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Interview Type</p>
            <div className="flex gap-2 flex-wrap">
              {SESSION_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setSessionType(t)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg border transition-all',
                    sessionType === t
                      ? 'bg-brand-600/20 border-brand-500/50 text-brand-400'
                      : 'border-surface-border text-gray-400 hover:text-white',
                  )}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
 
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {startMutation.isPending ? 'Starting…' : 'Start Personalised Session'}
            {!startMutation.isPending && <ChevronRight size={16} />}
          </button>
        </div>
      )}
    </div>
  )
}
 