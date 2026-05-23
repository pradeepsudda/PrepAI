import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/services/authApi'
import { useAuthStore } from '@/store/authStore'
 
const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>
 
export default function RegisterPage() {
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()
 
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
 
  const mutation = useMutation({
    mutationFn: (d: FormData) => authApi.register(d.email, d.password, d.fullName),
    onSuccess: (res) => {
      setAuth(res.data.token, res.data.user)
      toast.success('Account created!')
      navigate('/dashboard')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Registration failed'
      toast.error(msg)
    },
  })
 
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96
                      bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
 
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-40 h-30 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="src/assets/prepai.png" 
              alt="PrepAI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Start your interview preparation</p>
        </div>
 
        <div className="card p-7">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full name</label>
              <input {...register('fullName')} type="text" placeholder="Jane Smith" className="input-field" />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
              <input {...register('password')} type="password" placeholder="Min. 8 characters" className="input-field" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
              {mutation.isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
 
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}