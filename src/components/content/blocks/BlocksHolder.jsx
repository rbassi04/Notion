import React, { useEffect, useState } from 'react'
import BlockRenderer from './BlockRenderer'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { blockUtil } from './blockUtil';



const defaultContent = {
  'heading': 'Type here...',
  'text': 'Type here...',
  'subheading': 'Type here...',
  'image': ''
}

export const BlocksHolder = ({blocks, setBlocks, changes, setChanges, setError, setLoading}) => {
  const {doc_id} = useParams()


  async function addBlock(type) {
    const changed_cloned = {...changes}

    // Get new position
    const newPosition = 0

    // Get other attributes of new block
    const newId = uuidv4();
    const content = defaultContent[type] ? defaultContent[type] : ""
    const newBlock = {
      id: newId,
      doc_id,
      type,
      content,
      position: newPosition
    }

    // use setBlocks to add block on client side
    blocks.push(newBlock)

    changed_cloned['new_block'].push(newBlock)

    // No need to handle precision of position, it will be handled before save
    setChanges(changed_cloned)
  }

  
  return (
    <div className='w-full flex flex-col gap-1 items-center'>
      <SortableContext 
        items={blocks} 
        strategy={verticalListSortingStrategy} 
      >
        {
          blocks.map(
            (block, idx) => 
              <BlockRenderer
                key={block.id} 
                idx={idx}
                block={block}
                blocks={blocks}
                setBlocks={setBlocks}
                changes = {changes} 
                setChanges={setChanges} 
                setError={setError} 
                setLoading={setLoading} 
              />
          )
        }
      </SortableContext>
            {
              !blocks.length && (
                <div className=' text-[#d4d4d4] transition flex flex-wrap px-7 mb-4 gap-8 text-xs justify-center items-center w-11/12'>
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
              )
            }
    </div>
  )
}
