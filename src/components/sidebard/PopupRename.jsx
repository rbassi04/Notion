import React, { useRef } from 'react'

export const PopupRename = ({renameSubmit, setRenamePopup, prompt}) => {
  const renameRef = useRef()

  return (
    <div className='absolute left-0 top-0 bottom-0 right-0 bg-slate-800/40 z-40'>
      <div className='absolute px-14 py-10 w-1/2 left-1/2 top-1/2 -translate-1/2 rounded-lg bg-slate-900'>
        <h1 className='text-3xl font-black font-sans text-slate-300 mb-3'>{prompt}</h1>
        <input ref={renameRef} className='bg-slate-700 w-full outline outline-slate-300 px-2 py-1 text-slate-300 font-semibold' />
        <div className='flex justify-center text-slate-300 mt-6 gap-4 '>
          <button onClick={() => renameSubmit(renameRef.current.value)} className='px-3 py-1 rounded outline outline-slate-200 bg-slate-900/50 hover:bg-slate-950 hover:cursor-pointer hover:shadow-lg'>Submit</button>
          <button onClick={() => setRenamePopup(false)} className='px-3 py-1 rounded outline outline-slate-200 bg-slate-900/50 hover:bg-slate-950 hover:cursor-pointer hover:shadow-lg'>Close</button>
        </div>
      </div>
    </div>
  )
}
