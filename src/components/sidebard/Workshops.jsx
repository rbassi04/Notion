import React, { useState } from 'react'
import { Workshop } from './Workshop'
import { PopupRename } from './PopupRename'
import { v4 as uuidv4 } from 'uuid';
import supabase from '../../supabaseClient';

export const Workshops = ({workshops, setWorkshop, admin}) => {
  const [newWorkshopPopup, setNewWorkshopPopup] = useState(false)

  async function createWorkshop(wkshop_name) {
    const id = uuidv4()

    // Client side update
    setWorkshop(wkShop => {
      const newWorkshops = [...workshops, {
        id,
        name: wkshop_name,
        owner_id: admin,
        created_at: (new Date()).toString(),
        documents: []
      }]

      return {
        ...wkShop,
        data: newWorkshops
      }
    })

    // Server side update
    const res = await supabase
      .from("workshop")
      .insert({
        id,
        name: wkshop_name,
        owner_id: admin,
      })
    
    if (res.error) {
      setWorkshop(wkShop => ({...wkShop, error: res.error}))
    }

    setNewWorkshopPopup(false)
  }



  return (
    <div className='w-full h-full flex flex-col items-center justify-top py-4 gap-10'>
      {
        workshops.map(
          workshop => 
            <Workshop 
              key={workshop.id} 
              workshop={workshop} 
              setWorkshop={setWorkshop}
              workshop_id = {workshop.id}
              admin={admin}
            />
          )
      }

      <button onClick={() => setNewWorkshopPopup(true)} className='text-xl text-slate-200 font-mono px-3 py-1.5 outline outline-slate-100 hover:cursor-pointer hover:shadow-xl shadow-black/50 transition'>Create Workshop</button>
      
      {
        newWorkshopPopup && (
          <PopupRename prompt={"Name the new Workshop:"} renameSubmit={createWorkshop} setRenamePopup={setNewWorkshopPopup} />
        )
      }
    </div>
  )
}


