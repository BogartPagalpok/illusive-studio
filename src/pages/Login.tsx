const handleOAuthLogin = async (provider: 'google' | 'facebook') => { 
    setLoadingProvider(provider); 
    
    // Construct a clean, absolute URL to avoid the Supabase/Vercel concatenation error
    const baseUrl = window.location.origin.endsWith('/') 
      ? window.location.origin.slice(0, -1) 
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: provider, 
      options: { 
        // We add the specific admin route to ensure you land back in the dashboard
        redirectTo: `${baseUrl}/admin`
      } 
    }); 

    if (error) { 
      console.error(`${provider} login error:`, error.message); 
      setLoadingProvider(null); 
    } 
  };
