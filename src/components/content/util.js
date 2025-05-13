export default function getMinPositionDistance (blocks) {
  // Check if minimum distance between positions is below pecision
  let min = Infinity
  // get minimum different between position
  for (let idx = 1; idx < blocks.length; idx++ ) {
    min = Math.min(min, blocks[idx].position-blocks[idx-1].position)
  }

  return min
}



export function orderBlocks(blocks) {
  return blocks.sort((a, b) => a.position - b.position);
}