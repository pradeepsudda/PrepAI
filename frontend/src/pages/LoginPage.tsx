import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Brain } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { authApi } from '@/services/authApi'
import { useAuthStore } from '@/store/authStore'
 
const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})
type FormData = z.infer<typeof schema>
 
export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const { setAuth }          = useAuthStore()
  const navigate             = useNavigate()
 
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
 
  const mutation = useMutation({
    mutationFn: (d: FormData) => authApi.login(d.email, d.password),
    onSuccess: (res) => {
      setAuth(res.data.token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.fullName.split(' ')[0]}!`)
      navigate('/dashboard')
    },
    onError: () => toast.error('Invalid email or password'),
  })
 
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96
                      bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
 
      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-40 h-30 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="src/assets/prepai.png"   // or your generated image path
              alt="PrepAI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue your prep</p>
        </div>
 
        <div className="card p-7">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
 
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
 
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full"
            >
              {mutation.isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
 
        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
 