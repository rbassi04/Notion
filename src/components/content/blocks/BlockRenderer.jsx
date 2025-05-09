import React from 'react'
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { blockUtil } from './blockUtil';

const defaultContent = {
  'heading': 'Type here...',
  'text': 'Type here...',
  'subheading': 'Type here...',
  'image': ''
}

// BlockRenderer.jsx
export default function BlockRenderer({ idx, block, blocks, setBlocks, changes, setChanges }) {
  const {doc_id} = useParams()
  const {attributes, listeners, setNodeRef, 
    transform, transition} = useSortable({id: block.id})

  const style ={
    transition, 
    transform: CSS.Transform.toString(transform)
  }

  async function deleteBlock(id) {
    // Update changes
    setChanges(changes => {
      changes["deletes"].push(id)
      return changes
    })

    // Update blocks
    setBlocks(blocks => blocks.filter(_block => _block.id !== id))

  }

  async function addBlock(type) {
    const changed_cloned = {...changes}

    // Get new position
    const prevPos = blocks[idx].position
    const nextPos = (idx >= blocks.length - 1) ? prevPos+100 : blocks[idx+1].position
    const newPosition = (nextPos+prevPos)/2

    // Get other attributes of new block
    const newId = uuidv4();
    const content = defaultContent[type] ? defaultContent[type] : ""
    const newBlock = {
      id: newId,
      doc_id: doc_id,
      type,
      content,
      position: newPosition
    }

    // use setBlocks to add block on client side
    setBlocks(blocks => {
      if (idx === blocks.length) {
        blocks.push(newBlock)
        return blocks
      } else {
        blocks.splice(idx+1, 0, newBlock)
        return blocks
      }
    })

    changed_cloned['new_block'].push(newBlock)
    changed_cloned['positions'][block.id]

    // No need to handle precision of position, it will be handled before save
    setChanges(changed_cloned)
  }

  return (
    <>
      <div
        
        style={style}
        className='w-11/12 flex items-center justify-center'
      >
        <h1
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          className='text-[#d4d4d4] text-xl hover:cursor-grab active:cursor-grabbing'
        >⠿</h1>
        <button id={`trash:${block.id}`} onClick={() => deleteBlock(block.id)} className='scale-50 opacity-20 transition hover:scale-100 hover:opacity-100'>🗑️</button>
        <div className='w-full hover:shadow-2xl hover:shadow-slate-950/40 flex'>
          {blockUtil.blockParser(block, setChanges)}
        </div>
      </div>
      
      <div className='not-hover:opacity-0 hover:opacity-100 text-[#d4d4d4] transition flex flex-wrap px-7 mb-4 gap-8 text-xs justify-center items-center w-11/12'>
        {
          blockUtil.blockTypes().map(
            type => (
              <button key={type} onClick={() => addBlock(type)} className='px-3 py-0.5 border-y-[1px] bg-slate-500/30 hover:cursor-pointer hover:shadow-lg hover:bg-slate-900'>
                + {type.toUpperCase()}
              </button>
            )
          )
        }
      </div>
    </>
  )
}

