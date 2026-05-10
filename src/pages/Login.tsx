import { useState } from 'react'; 
import { supabase } from '../lib/supabase'; 

export default function Login() { 
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null); 

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => { 
    setLoadingProvider(provider); 
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: provider, 
      options: { redirectTo: window.location.origin } 
    }); 
    if (error) { 
      console.error(`${provider} login error:`, error.message); 
      setLoadingProvider(null); 
    } 
  }; 

  return ( 
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-6"> 
      {/* Subtle Background Glow */} 
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none opacity-20 transition-colors duration-1000" style={{ backgroundColor: 'var(--accent, #ffffff)' }} /> 

      <div className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl"> 
        <div className="text-center mb-10"> 
          <h1 className="text-3xl font-heading font-black tracking-wider uppercase mb-2"> 
            Client <span className="text-accent">Portal</span> 
          </h1> 
          <p className="text-xs font-heading tracking-widest text-white/40 uppercase">Verify your identity to access portfolio</p> 
        </div> 

        <div className="flex flex-col gap-4"> 
          {['google', 'facebook'].map((provider) => ( 
            <button 
              key={provider} 
              onClick={() => handleOAuthLogin(provider as any)} 
              disabled={loadingProvider !== null} 
              className="group relative flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all" 
            > 
              {loadingProvider === provider ? ( 
                <span className="animate-spin w-5 h-5 border-2 border-white/40 border-t-white rounded-full" /> 
              ) : ( 
                <span className="font-heading tracking-widest text-xs uppercase font-bold group-hover:text-white transition-colors text-white/70"> 
                  Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)} 
                </span> 
              )} 
            </button> 
          ))} 
        </div> 
        <div className="mt-8 text-center text-[10px] font-heading tracking-widest text-white/30 uppercase"> 
          Secure authentication powered by Supabase 
        </div> 
      </div> 
    </div> 
  ); 
} 
