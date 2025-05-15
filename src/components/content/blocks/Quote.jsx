import React, { useEffect, useRef, useState } from 'react'

export const Quote = ({block, setChanges}) => {
  const [quote, setQuote] = useState(block.content)
  const textareaRef = useRef()

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [quote]);
  
  useEffect(() => {
    setQuote(block.content)
  }, [block.content])

  function changeContent(e) {
    setQuote(e.target.value)
    setChanges(currChanges => ({
        ...currChanges, 
        updates: {
          ...currChanges['updates'],
          [block.id]: e.target.value
        },
        toBroadcast: true
      })
    )
  }

  return (
    <div className='w-full h-full flex gap-1 items-center justify-center relative' >
      <div className='w-1 top-3 bottom-3 left-0 absolute ml-1 bg-slate-300 text-slate-300'>|</div>
      <textarea 
        onChange={changeContent} 
        value={quote} 
        ref={textareaRef}
        className='text-xl ml-3 text-[#d4d4d4] font-[500] w-full resize-none overflow-hidden rounded p-2 focus:outline-0 focus:border-[1px] focus:outline-slate-400'
        rows={1}
      />
    </div>
  )
}
 