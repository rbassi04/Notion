import React, { useEffect, useRef, useState } from 'react'
import supabase from '../../supabaseClient'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { closestCorners, DndContext } from '@dnd-kit/core';
import { BlocksHolder } from './blocks/BlocksHolder';
import { arrayMove } from '@dnd-kit/sortable';
import getMinPositionDistance, { orderBlocks } from './util';
import { debounce } from "lodash"; // or lodash-es

const DEBOUNCE_MS = 1000; // 1 second


export const ShareContent = () => {
  // Defaults
  const defaultChanges = {
    deletes: [], 
    updates: {}, 
    positions: {},
    new_block: []
  }

  const [id] = useOutletContext()

  // States
  const params = useParams();
  const [error, setError] = useState()
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(new Date())
  const [docId, setDocId] = useState(null)

  // (key, value) => (block_id, new content)
  const [changes, setChanges] = useState(defaultChanges)
  const latestChangesRef = useRef(changes);

  const navigate = useNavigate()

  useEffect(() => {
    latestChangesRef.current = changes;
  }, [changes]);

  useEffect(() => {
    function messageRecieved(payload) {
      console.log("PAYLOAD: ", payload.payload)
      if (payload.payload.id === id) return
      broadcastSave(payload.payload)
    }

    if (blocks.length && params.doc_id) {
      const shared_id = params.doc_id

      if (shared_id) {
        const myChannel = supabase.channel(`document:${shared_id}`)
        myChannel
          .on(
            'broadcast',
            {event: 'changes'},
            messageRecieved
          )
          .subscribe()

        myChannel
          .on(
            'broadcast',
            {event: 'share'},
            () => navigate(0)
          )
      }
      else {
        const myChannel = supabase.channel(`document:${shared_id}`)
        myChannel
          .unsubscribe()
      }
    }

    // const interval = setInterval(() => manualSave(), 10000)

    // Unsubscribe from channel
    return () => {
      supabase.channel(`document:${params.shared_id}`).unsubscribe()
      // clearInterval(interval)
    }
  }, [blocks])

  // Define this outside the component to avoid redefining on every render
  const debouncedSave = debounce((saveFn) => {
    saveFn();
  }, DEBOUNCE_MS);

  console.log(changes)
  useEffect(() => {
    console.log("useeffect changes: ", changes)
    if (changes.toBroadcast) {
      debouncedSave(broadcastChanges);
    }

    // Cleanup to cancel debounce on unmount
    return () => debouncedSave.cancel();
  }, [changes, debouncedSave]);

  function broadcastChanges() {
    if (Object.keys(changes['updates']).length || Object.keys(changes['positions']).length || changes['deletes'].length || changes['new_block'].length) {
      // Prepare payload
      for (let delete_id of changes['deletes']) {
        delete changes['updates'][delete_id]
      }

      for (let delete_id of changes['deletes']) {
        delete changes['positions'][delete_id]
      }

      const min = getMinPositionDistance(blocks)

      const changed_cloned = {...changes}
      
      // Check if need to recalibrate positions
      if (min < 0.000001) {
        let index = 100
        for (let block of blocks) {
          // Upadte positions
          changed_cloned['positions'][block.id] = index*100
          index += 1
        }
      }

      if (params.doc_id) {
        supabase.channel(`document:${params.doc_id}`).send({
          type: "broadcast",
          event: 'changes',
          payload: {...changed_cloned, id}
        })
      }
    }
  }

  function broadcastSave(changes) {
    if (!changes) return

    setBlocks(blks => {
      const cloned_changes = {...changes}

      // Insert new blocks
      const insrt_blocks = blks.concat(changes['new_block'])

      // Delete the blocks
      // -- duplicate deletes
      const deletes_dict = {}
      for (let del_id of cloned_changes['deletes']) {
        deletes_dict[del_id] = true
      }
      const del_blocks = insrt_blocks.filter(({id}) => !deletes_dict[id])

      // Update
      const updt_blocks = del_blocks.map(blk => {
        // if the block has an update
        if (blk.id in changes['updates']) {
          return {
            ...blk,
            content: changes['updates'][blk.id]
          }
        }
        return blk
      })

      // Update
      const pos_blocks = updt_blocks.map(blk => {
        // if the block has an update
        if (blk.id in changes['positions']) {
          return {
            ...blk,
            position: changes['positions'][blk.id]
          }
        }
        return blk
      })

      return orderBlocks(pos_blocks)
    })
  }

  async function manualSave() {
    if (Object.keys(changes['updates']).length || Object.keys(changes['positions']).length || changes['deletes'].length || changes['new_block'].length) {
      // Prepare payload
      for (let delete_id of changes['deletes']) {
        delete changes['updates'][delete_id]
      }

      for (let delete_id of changes['deletes']) {
        delete changes['positions'][delete_id]
      }

      const min = getMinPositionDistance(blocks)

      const changed_cloned = {...changes}
      
      // Check if need to recalibrate positions
      if (min < 0.000001) {
        let index = 100
        for (let block of blocks) {
          // Upadte positions
          changed_cloned['positions'][block.id] = index*100
          index += 1
        }
      }

      // update doc_id:


      const {error} = await supabase.rpc("update_blocks", 
        {
          updates: changed_cloned['updates'],
          deletes: changed_cloned['deletes'],
          positions: changed_cloned['positions'],
          new_blocks: changed_cloned['new_block']
        }
      )

      if (error) {
        setError(error)
        return
      } else {
        // supabase.channel(`document:${params.doc_id}`).send({
        //   type: "broadcast",
        //   event: 'changes',
        //   payload: {...changed_cloned, id}
        // })
      }
      setSaved(new Date())
    }
    setChanges(defaultChanges)
  }

  function handleDragEnd(event) {
    const getBlockPos = id => blocks.findIndex(block => block.id === id)

    const {active, over} = event

    if (active.id === over.id) return;

    setBlocks(blocks => {
      // Order by index
      const originalPos = getBlockPos(active.id)
      const newPos = getBlockPos(over.id)

      const indexOrderedArray = arrayMove(blocks, originalPos, newPos)

      // // Update the position
      if (newPos === 0) {
        const prevPosition = 0
        const nextPosition = blocks[0].position
        const newPosition = (prevPosition+nextPosition)/2
        indexOrderedArray[newPos].position = newPosition

        setChanges(changes => ({...changes, toBroadcast: true, positions: {...changes.positions, [indexOrderedArray[newPos].id]: newPosition}}))
      } else if (newPos === blocks.length-1) {
        const prevPosition = blocks[newPos].position
        const nextPosition = blocks[newPos].position+100
        const newPosition = (prevPosition+nextPosition)/2
        indexOrderedArray[newPos].position = newPosition

        setChanges(changes => ({...changes, toBroadcast: true, positions: {...changes.positions, [indexOrderedArray[newPos].id]: newPosition}}))
      } else if (newPos > originalPos) {
        const prevPosition = blocks[newPos].position
        const nextPosition = blocks[newPos+1].position
        const newPosition = (prevPosition+nextPosition)/2
        indexOrderedArray[newPos].position = newPosition

        setChanges(changes => ({...changes, toBroadcast: true, positions: {...changes.positions, [indexOrderedArray[newPos].id]: newPosition}}))
      } else if (newPos < originalPos) {
        const prevPosition = blocks[newPos-1].position
        const nextPosition = blocks[newPos].position
        const newPosition = (prevPosition+nextPosition)/2
        indexOrderedArray[newPos].position = newPosition

        setChanges(changes => ({...changes, toBroadcast: true, positions: {...changes.positions, [indexOrderedArray[newPos].id]: newPosition}}))
      }

      return indexOrderedArray
    })
  }

  useEffect(() => {
    const getBlocks = async (shared_id) => {
      // Get blocks
      setError()
      setLoading(true)
      const { data: docs, error: docError } = await supabase
        .from("documents")
        .select("id")
        .eq("shared_id", shared_id);
      
    if (docs) {
        const docIds = docs.map(d => d.id);
        setDocId(docIds[0])
      
        const { data: blocks, error: blockError } = await supabase
          .from("blocks")
          .select("*")
          .in("doc_id", docIds)
          .order("position");
      
        // now blocks will be from only documents with matching shared_id
        if (blockError) {
          setError(error)
        } else {
          setBlocks(
            blocks.map(row => (
              {...row, content: row['content']}
            ))
          )
          setSaved(new Date())
        }
      } 
      if (docError) {
        setDocId(null)
        setError(docError)
      }
      setLoading(false)
    }
  
    setChanges(defaultChanges)
    getBlocks(params.doc_id)
  }, [params.doc_id])

  if (loading)  {
    return (
      <h1 className='text-3xl font-black text-center text-slate-200 absolute top-1/2 left-1/2 -translate-1/2'>Loading...</h1>
    )
  }

  if (error)  {
    return (
      <div className='px-4'>
        <h1 className='text-3xl font-black'>
          ERROR IN SAVING:
          <br />
          {error.message}
        </h1>
      </div>
    )
  }

  return (
    <div className='h-full flex flex-col font-inter gap-1 justify-top items-center overflow-y-scroll'>
      <div className='w-full bg-[#191919] py-2 px-4 flex flex-wrap items-center justify-end gap-4 text-sm'>
        <p className='text-[#e7e7e7] mr-2'>Share id: {params.doc_id}</p>
        <p className='text-[#e7e7e7]'>Last saved: {saved.getHours() + ":" + saved.getMinutes() + " " + saved.getDate()+1 + "/" + saved.getMonth() + "/" + saved.getFullYear()}</p>
        {/* Save button */}
        <button onClick={manualSave} className='hover:cursor-pointer hover:shadow-lg'>💾</button>
      </div>
      <div className='flex flex-col gap-1 justify-top items-center w-full translate-y-40'>
        <DndContext 
          onDragEnd={handleDragEnd} 
          collisionDetection={closestCorners}
        >
          <BlocksHolder
            blocks={blocks}
            setBlocks={setBlocks} 
            changes={changes}
            setChanges={setChanges}
            setError={setError}
            setLoading={setLoading}
            doc_id={docId}
          />
        </DndContext>
      </div>
    </div>
  )
}

