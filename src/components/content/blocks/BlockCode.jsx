import React, { useEffect, useRef, useState } from 'react'

export const BlockCode = ({block, setChanges}) => {
  const [code, setCode] = useState(block.content)
  const textareaRef = useRef()

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [code]);

  function changeContent(e) {
    setCode(e.target.value)
    setChanges(currChanges => {
      currChanges['updates'][block.id] = e.target.value
      return currChanges
    })
  }

  return (
    <div className='w-full py-6 px-2 bg-[#202020] rounded-sm h-fit flex items-center justify-center' >
      <textarea 
        onChange={changeContent} 
        value={code} 
        ref={textareaRef}
        className='text-md text-[#d4d4d4] font-[courier] font-[700]  w-full resize-none overflow-hidden rounded p-2 border-0 outline-0 '
        rows={1}
      />
    </div>
  )
}
 