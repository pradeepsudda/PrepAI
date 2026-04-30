import { useState }    from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Copy, LogIn } from 'lucide-react'
import { roomApi }     from '@/services/roomApi'
import { PageHeader }  from '@/components/ui/PageHeader'
import { EmptyState }  from '@/components/ui/EmptyState'
import toast           from 'react-hot-toast'
 
export default function LiveRoomsPage() {
  const [joinCode, setJoinCode] = useState('')
  const qc                       = useQueryClient()
  const navigate                 = useNavigate()
 
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn:  () => roomApi.getActiveRooms().then(r => r.data),
    refetchInterval: 10_000,
  })
 
  const createMutation = useMutation({
    mutationFn: () => roomApi.createRoom(),
    onSuccess:  (res) => {
      qc.invalidateQueries({ queryKey: ['rooms'] })
      navigate(`/rooms/${res.data.id}`, { state: { room: res.data } })
    },
    onError: () => toast.error('Failed to create room'),
  })
 
  const joinMutation = useMutation({
    mutationFn: (code: string) => roomApi.joinRoom(code),
    onSuccess:  (res) => navigate(`/rooms/${res.data.id}`, { state: { room: res.data } }),
    onError:    () => toast.error('Room not found or no longer active'),
  })
 
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Room code copied!')
  }
 
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Live Interview Rooms"
        subtitle="Practice with peers in real-time"
        action={
          <button onClick={() => createMutation.mutate()} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Room
          </button>
        }
      />
 
      {/* Join by code */}
      <div className="card p-5 mb-8 flex items-center gap-3">
        <input
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter room code (e.g. AB12CD)"
          className="input-field flex-1 font-mono uppercase tracking-widest"
          maxLength={6}
        />
        <button
          onClick={() => joinCode.length === 6 && joinMutation.mutate(joinCode)}
          disabled={joinCode.length !== 6 || joinMutation.isPending}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <LogIn size={16} /> Join Room
        </button>
      </div>
 
      {/* Active rooms */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Active Rooms
      </h2>
 
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 w-24 bg-surface-raised rounded" />
            </div>
          ))}
        </div>
      ) : rooms?.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="No active rooms"
          description="Create a room and invite a friend to practice together"
          action={
            <button onClick={() => createMutation.mutate()} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Create First Room
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {rooms?.map(room => (
            <div key={room.id} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-600/15 flex items-center justify-center">
                <Users size={18} className="text-brand-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium font-mono tracking-wider">{room.roomCode}</p>
                <p className="text-xs text-gray-500">{room.participantCount} participants</p>
              </div>
              <button onClick={() => copyCode(room.roomCode)} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
                <Copy size={12} /> Copy
              </button>
              <button
                onClick={() => navigate(`/rooms/${room.id}`, { state: { room } })}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <LogIn size={12} /> Join
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}