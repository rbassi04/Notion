// Workshop fix
function orderDocuments(workshops) {
  // (key, value) <= (document_id, document)
  const semiOrderedDocuments = {}

  // (key, value) <= (parentId, [childIds])
  const parentToChild = {}

  // (key, value) <= (document_id, document)
  const orderedDocuments = {}
  
  const cloneWorkshops = {...workshops}


  for (let row in cloneWorkshops) {
    semiOrderedDocuments[cloneWorkshops[row].id] = cloneWorkshops[row]
  }

  for (let id in semiOrderedDocuments) {
    // if parent in 
    if (parentToChild[semiOrderedDocuments[id].parent_doc_id]) {
      parentToChild[semiOrderedDocuments[id].parent_doc_id].push(id)
    } else {
      parentToChild[semiOrderedDocuments[id].parent_doc_id] = [id]
    }
  }

  // Recursive
  function recursiveFix(parentId, child) {
    const children = parentToChild[parentId]

    // Edge case -- has no children
    if (!children) {
      return
    }

    // Iterate over all children
    for (let childIdIdx in children) {
      const childId = children[childIdIdx]
      // Add child
      child[childId] = semiOrderedDocuments[childId]
      child[childId]['children'] = {}
      recursiveFix(childId, child[childId]['children'])
    }
  }

  // iterate over all root item
  for (let parentIdIdx in parentToChild[null]) {
    const parentId = parentToChild[null][parentIdIdx]
    orderedDocuments[parentId] = {...semiOrderedDocuments[parentId], children: {}}
    recursiveFix(parentId, orderedDocuments[parentId]['children'])
  }

  return orderedDocuments
}

function getChildDocuments(documents, toRemoveId) {
  const newDocuments = {}

  for (let document in documents) {
    // Dont keep the current parentId and all other parents
    if (document !== toRemoveId) {
      // Check if the allowed document is the current's child
      if (documents[document].parent_doc_id == toRemoveId) {
        newDocuments[document] = {...documents[document], parent_doc_id: null}
      } else {
        newDocuments[document] = {...documents[document]}
      }
    }
  }

  return newDocuments
}

/*
{
    "e2c134e0-30ee-49f3-8a82-af73b6dab5e0": {
        "id": "e2c134e0-30ee-49f3-8a82-af73b6dab5e0",
        "icon": null,
        "name": "document_twestt",
        "workshop_id": 1,
        "parent_doc_id": null,
        "children": {
            "be6086dd-27e6-4104-9522-a7674bc97562": {
                "id": "be6086dd-27e6-4104-9522-a7674bc97562",
                "icon": null,
                "name": "2nd layer",
                "workshop_id": 1,
                "parent_doc_id": "e2c134e0-30ee-49f3-8a82-af73b6dab5e0",
                "children": {
                    "9325af43-b318-4a9e-927e-07f8edf2ca33": {
                        "id": "9325af43-b318-4a9e-927e-07f8edf2ca33",
                        "icon": null,
                        "name": "deep insider",
                        "workshop_id": 1,
                        "parent_doc_id": "be6086dd-27e6-4104-9522-a7674bc97562",
                        "children": {}
                    }
                }
            },
            "e118a87f-fd4a-4518-8d98-432954f06cae": {
                "id": "e118a87f-fd4a-4518-8d98-432954f06cae",
                "icon": null,
                "name": "2ndChild",
                "workshop_id": 1,
                "parent_doc_id": "e2c134e0-30ee-49f3-8a82-af73b6dab5e0",
                "children": {}
            }
        }
    }
}

*/


export {orderDocuments, getChildDocuments}