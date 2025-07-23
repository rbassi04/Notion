import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PopupRename } from "./PopupRename";
import supabase from "../../supabaseClient";
import { v4 as uuidv4 } from "uuid";

export const Document = ({ currDocument, setWorkshop, workshop_id, admin }) => {
    const [displayChildren, setDisplayChildren] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [renamePopup, setRenamePopup] = useState(false);
    const [newDocumentPopup, setNewDocumentPopup] = useState(false);
    const menuRef = useRef();
    const navigate = useNavigate();

    const isLeafDocument = Object.keys(currDocument.children).length;

    const toggleDisplayChildren = () => setDisplayChildren((curr) => !curr);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        }

        document.addEventListener("click", handleClickOutside, true);

        return () => removeEventListener("click", handleClickOutside, true);
    }, []);

    async function deleteDocument() {
        // in workshop
        setWorkshop((workshop) => {
            const currWorkshop = workshop["data"].reduce(
                (acc, curr) => (curr.id === workshop_id ? curr : acc),
                false
            );

            const documents = currWorkshop["documents"];
            const newDocuments = documents.filter(
                (doc) => doc.id !== currDocument.id
            );

            return {
                ...workshop,
                data: workshop.data.map((wkshop) =>
                    wkshop.id !== workshop_id
                        ? wkshop
                        : {
                              ...wkshop,
                              documents: newDocuments,
                          }
                ),
            };
        });

        function collectChildrenIds(currDoc) {
            if (!Object.keys(currDoc.children).length) {
                return;
            }

            for (let childDoc in currDoc.children) {
                toDeleteIds.push(currDoc.children[childDoc].id);
                collectChildrenIds(currDoc.children[childDoc]);
            }
        }

        // Collect all children to delete
        let toDeleteIds = [currDocument.id];
        collectChildrenIds(currDocument);

        const { error } = await supabase
            .from("documents")
            .delete()
            .in("id", toDeleteIds);

        if (error) {
            setWorkshop((wkShop) => ({
                ...wkShop,
                error: `Error in renaming: ${error.message}`,
            }));
        }
    }

    async function newDocument(renameElem) {
        const id = uuidv4();
        // In workshop
        setWorkshop((workshop) => {
            const currWorkshop = workshop["data"].reduce(
                (acc, curr) => (curr.id === workshop_id ? curr : acc),
                false
            );

            const newDocuments = currWorkshop["documents"];
            newDocuments.push({
                id,
                workshop_id: workshop_id,
                parent_doc_id: currDocument.id,
                name: renameElem,
                icon: "",
                admin,
            });

            return {
                ...workshop,
                data: workshop.data.map((wkshop) =>
                    wkshop.id !== workshop_id
                        ? wkshop
                        : {
                              ...wkshop,
                              documents: newDocuments,
                          }
                ),
            };
        });
        setNewDocumentPopup(false);
        // Push to supabase
        const { error } = await supabase.from("documents").insert({
            id,
            icon: "",
            name: renameElem,
            parent_doc_id: currDocument.id,
            workshop_id: workshop_id,
            admin,
        });

        if (error) {
            setWorkshop((wkShop) => ({
                ...wkShop,
                error: `Error in renaming: ${error.message}`,
            }));
        }
    }

    async function renameSubmit(renameElem) {
        setWorkshop((workshop) => {
            const currWorkshop = workshop["data"].reduce(
                (acc, curr) => (curr.id === workshop_id ? curr : acc),
                false
            );

            const documents = currWorkshop["documents"];
            const newDocuments = documents.map((doc) =>
                doc.id !== currDocument.id ? doc : { ...doc, name: renameElem }
            );

            return {
                ...workshop,
                data: workshop.data.map((wkshop) =>
                    wkshop.id !== workshop_id
                        ? wkshop
                        : {
                              ...wkshop,
                              documents: newDocuments,
                          }
                ),
            };
        });

        // Post rename in supabase
        const { error } = await supabase
            .from("documents")
            .update({ name: renameElem })
            .eq("id", currDocument.id);

        if (error) {
            setWorkshop((wkShop) => ({
                ...wkShop,
                error: `Error in renaming: ${error.message}`,
            }));
        }

        setRenamePopup(false);
    }

    async function shareDocument() {
        // Is it currently being shared?
        const new_shared_id = currDocument.shared_id ? null : uuidv4();

        // Update client side
        setWorkshop((workshop) => {
            const currWorkshop = workshop["data"].reduce(
                (acc, curr) => (curr.id === workshop_id ? curr : acc),
                false
            );

            const newDocuments = currWorkshop["documents"].map((doc) =>
                doc.id !== currDocument.id
                    ? doc
                    : { ...doc, shared_id: new_shared_id }
            );

            return {
                ...workshop,
                data: workshop.data.map((wkshop) =>
                    wkshop.id !== workshop_id
                        ? wkshop
                        : {
                              ...wkshop,
                              documents: newDocuments,
                          }
                ),
            };
        });

        // Supabase update it
        const { error } = await supabase
            .from("documents")
            .update({ shared_id: new_shared_id })
            .eq("id", currDocument.id);

        if (error) {
            setWorkshop((wkShop) => ({ ...wkShop, error }));
        } else {
            window.location.reload();
            supabase.channel(`document:${currDocument.shared_id}`).send({
                type: "broadcast",
                event: "share",
                payload: "refresh",
            });
        }

        // Provide the link
        setShowMenu(false);
    }

    return (
        <div>
            {/* Current node */}
            <div className="flex gap-1 px-1 mb-1 rounded-md font-inter text-[#e4e4e4] ">
                {isLeafDocument ? (
                    <button
                        onClick={toggleDisplayChildren}
                        className="text-xs hover:font-black hover:cursor-pointer hover:scale-125 transition"
                    >
                        {displayChildren ? (
                            "▼"
                        ) : (
                            <span className="text-[9px]">▶</span>
                        )}
                    </button>
                ) : (
                    <p className="">{"-"}</p>
                )}
                <div className="w-full flex justify-between">
                    <Link
                        to={`/document/${currDocument.id}`}
                        className="text-ellipsis truncate w-full pl-[6px] mr-2 rounded-sm hover:cursor-pointer hover:bg-[#272727]"
                    >
                        {currDocument.name}
                    </Link>
                    <div
                        ref={menuRef}
                        className="flex relative gap-[1px] items-center"
                    >
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="hover:cursor-pointer opacity-20 scale-75 transition hover:scale-100 hover:opacity-100"
                        >
                            ...
                        </button>
                        <button
                            onClick={() => {
                                setNewDocumentPopup(true);
                            }}
                            className="hover:cursor-pointer opacity-20 scale-75 transition hover:scale-100 hover:opacity-100"
                        >
                            ➕
                        </button>
                        {showMenu && (
                            <div className="flex flex-col justify-start gap-[2px] rounded-md absolute top-full right-0 z-10 bg-slate-800 px-1 py-3 ">
                                <button
                                    onClick={() => {
                                        setRenamePopup(true);
                                        setShowMenu(false);
                                    }}
                                    className="hover:cursor-pointer scale-75 transition hover:scale-85 hover:opacity-100 w-full text-left"
                                >
                                    Rename
                                </button>
                                <button
                                    onClick={deleteDocument}
                                    className="hover:cursor-pointer scale-75 transition hover:scale-85 hover:opacity-100 w-full text-left"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={shareDocument}
                                    className="hover:cursor-pointer scale-75 transition hover:scale-85 hover:opacity-100 w-full text-left"
                                >
                                    {currDocument.shared_id
                                        ? "unShare"
                                        : "Share"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Children */}
            <div className="pl-3 ">
                {displayChildren ? (
                    Object.keys(currDocument.children).map((child_id) => (
                        <Document
                            key={child_id}
                            currDocument={currDocument.children[child_id]}
                            id={child_id}
                            setWorkshop={setWorkshop}
                            workshop_id={workshop_id}
                            admin={admin}
                        />
                    ))
                ) : (
                    <p></p>
                )}
            </div>

            {renamePopup && (
                <PopupRename
                    prompt={"Rename your document:"}
                    renameSubmit={renameSubmit}
                    setRenamePopup={setRenamePopup}
                />
            )}

            {newDocumentPopup && (
                <PopupRename
                    prompt={"Name the new document:"}
                    renameSubmit={newDocument}
                    setRenamePopup={setNewDocumentPopup}
                />
            )}
        </div>
    );
};
