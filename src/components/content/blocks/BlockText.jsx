import React, { useEffect, useRef, useState } from 'react'

export const BlockText = ({block, setChanges}) => {
  const [text, setText] = useState(block.content)
  const textareaRef = useRef()

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    setText(block.content)
  }, [block.content])

  function changeContent(e) {
    setText(e.target.value)
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
    <div className='w-full h-fit flex items-center justify-center'>
      <textarea 
        onChange={changeContent} 
        value={text} 
        ref={textareaRef}
        className='text-lg w-full text-[#d4d4d4] resize-none overflow-hidden  rounded p-2  focus:outline-0 focus:border-[0.1px] focus:outline-slate-400'
        rows={1}
      />
    </div>
  )
}
