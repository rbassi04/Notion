import React, { useEffect, useRef, useState } from 'react'
import { Document } from './Document'
import { orderDocuments } from './sidebarUtil'
import { PopupRename } from './PopupRename'
import supabase from '../../supabaseClient'
import { v4 as uuidv4 } from 'uuid';


export const Workshop = ({workshop, setWorkshop, workshop_id, admin}) => {
  const [orderedDocuments, setOrderedDocuments] = useState([])
  const menuRef = useRef()
  const [newDocumentPopup, setNewDocumentPopup] = useState(false)
  

  useEffect(() => {
    setOrderedDocuments(orderDocuments(workshop.documents))
  }, [workshop])

  useEffect(() => {
    function handleClickOutside (e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("click", handleClickOutside, true)

    return () => removeEventListener("click", handleClickOutside, true)
  }, [])
  
  async function newDocument(renameElem) {
    const id = uuidv4()

    // In workshop
    setWorkshop(workshop => {
      const currWorkshop = workshop['data'].reduce(
        (acc, curr) => (curr.id === workshop_id ? curr : acc),
        false
      );
  
      const newDocuments = currWorkshop['documents'];
      newDocuments.push({
        id,
        workshop_id: workshop_id,
        parent_doc_id: null,
        name: renameElem,
        icon: "",
        admin
      })
  
      return {
        ...workshop,
        data: workshop.data.map(wkshop =>
          wkshop.id !== workshop_id
            ? wkshop
            : {
                ...wkshop,
                documents: newDocuments,
              }
        ),
      };
    });
    setNewDocumentPopup(false)

    // Push to supabase
    const {error} = await supabase.from("documents").insert({
      id,
      workshop_id: workshop_id,
      parent_doc_id: null,
      name: renameElem,
      icon: "",
      admin
    })

    if (error) {
      setWorkshop(wkShop => ({...wkShop, error: `Error in renaming: ${error.message}`}))
    }
  }

  return (
    <div className='w-full'>
      <div className='flex justify-between items-center'>
        <h1 className='font-black truncate text-ellipsis text text-xl mb-3 text-center text-[#cfcfcf] font-inter max-sm:text-sm'>
          {workshop.name}
        </h1>

        <div className='flex relative gap-[1px] items-center text-[#cfcfcf]'>
          <button onClick={() => {setNewDocumentPopup(true)}} className='hover:cursor-pointer opacity-20 scale-75 transition hover:scale-100 hover:opacity-100'>➕</button>
        </div>
      </div>
      {
        Object.keys(orderedDocuments).map(document_id => 
          <Document 
            key={document_id} 
            currDocument={orderedDocuments[document_id]} 
            setWorkshop={setWorkshop} 
            workshop_id={workshop_id}
            admin={admin}
          />
        )
      }

      {
        newDocumentPopup && (
          <PopupRename prompt={"Name the new document:"} renameSubmit={newDocument} setRenamePopup={setNewDocumentPopup} />
        )
      }
    </div>
  )
}

// 


