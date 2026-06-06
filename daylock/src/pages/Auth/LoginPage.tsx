import { useAuthStore } from '../../store/useAuthStore'

export default function LoginPage() {
  const { signInWithGoogle } = useAuthStore()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-md">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8">
        <p className="font-display text-ff-accent uppercase text-2xl tracking-[0.2em]">FORGEFIT</p>

        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Track your lifts.
          </h1>
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Fuel your gains.
          </h1>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <div className="ff-pill flex items-center gap-3 px-4 py-3">
            <span className="text-ff-accent font-bold">01</span>
            <span className="tracking-widest">STRENGTH</span>
          </div>
          <div className="ff-pill flex items-center gap-3 px-4 py-3">
            <span className="text-ff-accent font-bold">02</span>
            <span className="tracking-widest">NUTRITION</span>
          </div>
          <div className="ff-pill flex items-center gap-3 px-4 py-3">
            <span className="text-ff-accent font-bold">03</span>
            <span className="tracking-widest">PRECISION</span>
          </div>
        </div>

        <button onClick={signInWithGoogle} className="ff-btn-primary mt-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <p className="text-ff-muted text-xs text-center">
          Precision tracking for the serious athlete.
        </p>
      </div>
    </div>
  )
}
