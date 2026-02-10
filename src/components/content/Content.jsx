import { useEffect, useRef, useState } from "react";
import supabase from "../../supabaseClient";
import { useOutletContext, useParams } from "react-router-dom";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { BlocksHolder } from "./blocks/BlocksHolder";
import { arrayMove } from "@dnd-kit/sortable";
import getMinPositionDistance, { orderBlocks } from "./util";
import { debounce } from "lodash";
import Chatbot from "../Chatbot"

const DEBOUNCE_MS = 500;

export const Content = () => {
    // Defaults
    const defaultChanges = {
        deletes: [],
        updates: {},
        positions: {},
        new_block: [],
    };

    const [id] = useOutletContext();

    // States
    const params = useParams();
    const [error, setError] = useState();
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(new Date());
    const [sharedId, setSharedId] = useState(null);
    const [broadcastAux, setBroadcastAux] = useState(0);    // toggle to notify changes
    const [prevPayload, setPrevPayload] = useState([]);


    // (key, value) => (block_id, new content)
    const refChanges = useRef(defaultChanges);

    useEffect(() => {
        function messageRecieved(payload) {
            if (id === payload.payload.id) return;
            console.log("payload: ", payload);
            broadcastSave(payload.payload);
        }

        if (
            blocks.length &&
            blocks[0]["documents"] &&
            blocks[0]["documents"]["shared_id"]
        ) {
            const shared_id = blocks[0]["documents"]["shared_id"];
            setSharedId(shared_id);

            if (shared_id) {
                const myChannel = supabase.channel(`document:${shared_id}`);
                myChannel
                    .on("broadcast", { event: "changes" }, messageRecieved)
                    .subscribe();
            } else {
                const myChannel = supabase.channel(`document:${shared_id}`);
                myChannel.unsubscribe();

                setSharedId(false);
            }

            // const interval = setInterval(() => manualSave(), 1000)

            // Unsubscribe from channel
            return () => {
                supabase.channel(`document:${shared_id}`).unsubscribe();
                // clearInterval(interval)
            };
        }
    }, [blocks]);

    // Define this outside the component to avoid redefining on every render
    const debouncedSave = debounce((saveFn) => {
        saveFn();
    }, DEBOUNCE_MS);

    useEffect(() => {
        if (refChanges.current.toBroadcast) {
            debouncedSave(manualSave);
        }

        // Cleanup to cancel debounce on unmount
        return () => debouncedSave.cancel();
    }, [refChanges.current, broadcastAux, debouncedSave]);

    const broadcastSave = (changes) => {
        if (!changes) return;

        setBlocks((blks) => {
            const cloned_changes = { ...changes };

            // Insert new blocks
            const insrt_blocks = blks.concat(changes["new_block"]);

            // Delete the blocks
            // -- duplicate deletes
            const deletes_dict = {};
            for (let del_id of cloned_changes["deletes"]) {
                deletes_dict[del_id] = true;
            }
            const del_blocks = insrt_blocks.filter(
                ({ id }) => !deletes_dict[id]
            );

            // Update
            const updt_blocks = del_blocks.map((blk) => {
                // if the block has an update
                if (blk.id in changes["updates"]) {
                    return {
                        ...blk,
                        content: changes["updates"][blk.id],
                        flip: !blk.flip,
                    };
                }
                return blk;
            });

            // Update
            const pos_blocks = updt_blocks.map((blk) => {
                // if the block has an update
                if (blk.id in changes["positions"]) {
                    return {
                        ...blk,
                        position: changes["positions"][blk.id],
                    };
                }
                return blk;
            });

            return orderBlocks(pos_blocks);
        });
    };

    async function manualSave() {
        const changed_cloned = { ...refChanges.current };
        refChanges.current = defaultChanges;
        if (
            Object.keys(changed_cloned["updates"]).length ||
            Object.keys(changed_cloned["positions"]).length ||
            changed_cloned["deletes"].length ||
            changed_cloned["new_block"].length
        ) {
            // Prepare payload
            for (let delete_id of changed_cloned["deletes"]) {
                delete changed_cloned["updates"][delete_id];
            }

            for (let delete_id of changed_cloned["deletes"]) {
                delete changed_cloned["positions"][delete_id];
            }

            const min = getMinPositionDistance(blocks);

            // Check if need to recalibrate positions
            if (min < 0.000001) {
                let index = 100;
                for (let block of blocks) {
                    // Upadte positions
                    changed_cloned["positions"][block.id] = index * 100;
                    index += 1;
                }
            }

            const { error } = await supabase.rpc("update_blocks", {
                updates: changed_cloned["updates"],
                deletes: changed_cloned["deletes"],
                positions: changed_cloned["positions"],
                new_blocks: changed_cloned["new_block"],
            });

            if (error) {
                setError(error);
                return;
            } else {
                if (sharedId) {
                    supabase.channel(`document:${sharedId}`).send({
                        type: "broadcast",
                        event: "changes",
                        payload: { ...changed_cloned, id },
                    });
                }
            }
            setSaved(new Date());
        }
    }

    function handleDragEnd(event) {
        const getBlockPos = (id) =>
            blocks.findIndex((block) => block.id === id);

        const { active, over } = event;

        if (active.id === over.id) return;

        setBlocks((blocks) => {
            // Order by index
            const originalPos = getBlockPos(active.id);
            const newPos = getBlockPos(over.id);

            const indexOrderedArray = arrayMove(blocks, originalPos, newPos);

            // // Update the position
            if (newPos === 0) {
                const prevPosition = 0;
                const nextPosition = blocks[0].position;
                const newPosition = (prevPosition + nextPosition) / 2;
                indexOrderedArray[newPos].position = newPosition;

                refChanges.current = {
                    ...refChanges.current,
                    toBroadcast: true,
                    positions: {
                        ...refChanges.current.positions,
                        [indexOrderedArray[newPos].id]: newPosition,
                    },
                };
            } else if (newPos === blocks.length - 1) {
                const prevPosition = blocks[newPos].position;
                const nextPosition = blocks[newPos].position + 100;
                const newPosition = (prevPosition + nextPosition) / 2;
                indexOrderedArray[newPos].position = newPosition;

                refChanges.current = {
                    ...refChanges.current,
                    toBroadcast: true,
                    positions: {
                        ...refChanges.current.positions,
                        [indexOrderedArray[newPos].id]: newPosition,
                    },
                };
            } else if (newPos > originalPos) {
                const prevPosition = blocks[newPos].position;
                const nextPosition = blocks[newPos + 1].position;
                const newPosition = (prevPosition + nextPosition) / 2;
                indexOrderedArray[newPos].position = newPosition;

                refChanges.current = {
                    ...refChanges.current,
                    toBroadcast: true,
                    positions: {
                        ...refChanges.current.positions,
                        [indexOrderedArray[newPos].id]: newPosition,
                    },
                };
            } else if (newPos < originalPos) {
                const prevPosition = blocks[newPos - 1].position;
                const nextPosition = blocks[newPos].position;
                const newPosition = (prevPosition + nextPosition) / 2;
                indexOrderedArray[newPos].position = newPosition;

                refChanges.current = {
                    ...refChanges.current,
                    toBroadcast: true,
                    positions: {
                        ...refChanges.current.positions,
                        [indexOrderedArray[newPos].id]: newPosition,
                    },
                };
            }

            return indexOrderedArray;
        });
    }

    useEffect(() => {
        const getBlocks = async (doc_id) => {
            // Get blocks
            setError();
            setLoading(true);
            const { data, error } = await supabase
                .from("blocks")
                .select("*, documents (shared_id)")
                .eq("doc_id", doc_id)
                .order("position");

            if (error) {
                setError(error);
                setLoading(false);
            } else {
                setBlocks(
                    data.map((row) => ({ ...row, content: row["content"] }))
                );
                setLoading(false);
                setSaved(new Date());
            }
        };

        refChanges.current = defaultChanges;
        getBlocks(params.doc_id);
    }, [params.doc_id]);

    if (loading) {
        return (
            <h1 className="text-3xl font-black text-center text-slate-200 absolute top-1/2 left-1/2 -translate-1/2">
                Loading...
            </h1>
        );
    }

    if (error) {
        return (
            <div className="px-4">
                <h1 className="text-3xl font-black">
                    ERROR IN SAVING:
                    <br />
                    {error.message}
                </h1>
                {/* <button onClick={manualSave} className=''>RESAVE</button> */}
                <button
                    onClick={revertToOldSave}
                    className="px-3 py-1 outline-1 bg-slate-400 hover:cursor-pointer"
                >
                    REVERT TO OLD SAVE
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col font-inter gap-1 justify-top items-center overflow-y-scroll">
            <div className="w-full bg-[#191919] py-2 px-4 flex flex-wrap items-center justify-end gap-4 text-sm">
                <p className="text-[#e7e7e7] mr-2">
                    {sharedId &&
                        `Share link: https://notion-cloney.netlify.app/share/${sharedId}`}
                </p>
                <p className="text-[#e7e7e7]">
                    Last saved:{" "}
                    {saved.getHours() +
                        ":" +
                        saved.getMinutes() +
                        " " +
                        saved.getDate() +
                        1 +
                        "/" +
                        saved.getMonth() +
                        "/" +
                        saved.getFullYear()}
                </p>
                {/* Save button */}
                <button
                    onClick={manualSave}
                    className="hover:cursor-pointer hover:shadow-lg"
                >
                    💾
                </button>
            </div>
            <div className="flex flex-col gap-1 justify-top items-center w-full translate-y-40">
                <DndContext
                    onDragEnd={handleDragEnd}
                    collisionDetection={closestCorners}
                >
                    <BlocksHolder
                        blocks={blocks}
                        setBlocks={setBlocks}
                        refChanges={refChanges}
                        setBroadcastAux={setBroadcastAux}
                        setError={setError}
                        setLoading={setLoading}
                        doc_id={params.doc_id}
                    />
                </DndContext>
            </div>
            <div className="absolute right-6 bottom-3">
                <Chatbot />
            </div>
        </div>
    );
};
