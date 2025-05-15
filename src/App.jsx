import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import supabase from './supabaseClient';
import { Workshops } from './components/sidebard/Workshops';
import { Outlet } from 'react-router-dom';



export default function App() {
  const [session, setSession] = useState(null)
  const [workshop, setWorkshop] = useState({error: null, data: []})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchSidebar()
  }, [session])

  async function fetchSidebar() {
    setLoading(true)
    if (!session) {
      setLoading(false)
      return
    }

    // Get workshop of user
    const res = await supabase.from("workshop").select("*, documents (*)").eq("owner_id", session.user.id)
    setWorkshop(res)
    setLoading(false)
  }

  if (!session) {
    return (
      <div className='bg-black h-screen'>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme='dark' providers={[]} />
      </div>
    )
  }

  if (loading) {
    return (
      <h1 className='text-2xl font-bold text-black'>
        LOADING...
      </h1>
    )
  }

  if (workshop.error) {
    return (
      <h1>
        ERROR
      </h1>
    )
  }

  return (
    <div className='bg-[#191919] 50 h-screen w-screen flex flex-col gap-5 justify-center items-center'>
      {/* Table it */}
      <div className='flex max-sm:flex-col w-full h-screen border-2 border-slate-700 text-black'>
        {/* Document List Column */}
        <div className='sm:w-4/11 sm:max-w-80 max-sm:h-2/11 max-sm:border-b-2 sm:border-r-2 overflow-y-scroll no-scrollbar flex flex-col items-center py-3 px-2 gap-2 border-slate-700'>
          <Workshops 
            setWorkshop={setWorkshop} 
            workshops={workshop.data} 
            admin={session.user.id}
          />
        </div>

        {/* Document Column */}
        <div className='w-full'>
          <Outlet context={[session.user.id]} />
        </div>
      </div>
    </div>
  )
}