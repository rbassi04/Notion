import React, { useEffect, useRef, useState } from 'react'

export const BlockSubHeading = ({block, setChanges}) => {
  const [heading, setHeading] = useState(block.content)
  const textareaRef = useRef()

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [heading]);

  useEffect(() => {
    setHeading(block.content)
  }, [block.content])
    
  function changeContent(e) {
    setHeading(e.target.value)
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
    <div className='w-full h-fit  flex items-center justify-center' >
      <textarea 
        onChange={changeContent} 
        value={heading} 
        ref={textareaRef}
        className='text-2xl text-[#d4d4d4] font-[700] w-full resize-none overflow-hidden rounded p-2 focus:outline-0 focus:border-[1px] focus:outline-slate-400'
        rows={1}
      />
    </div>
  )
}
 