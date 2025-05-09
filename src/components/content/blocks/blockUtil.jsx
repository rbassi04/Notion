
import { BlockSubHeading } from './BlockSubHeading';
import { BlockText } from './BlockText';
import { BlockHeading } from './BlockHeading';
import { Quote } from './Quote';
import { BlockCode } from './BlockCode';

export class blockUtil{
  static blockParser(block, setChanges) {
    if (!block || !block.type) {
      return <p className="text-red-400 text-sm text-center">Invalid block data</p>;
    }

    const commonProps = {block, setChanges}

    switch (block.type) {
      case 'text':
        return <BlockText {...commonProps} />;
      case 'heading':
        return <BlockHeading {...commonProps} />;
      case 'subheading':
        return <BlockSubHeading {...commonProps} />;
      case 'quote':
        return <Quote {...commonProps} />
      case 'code':
        return <BlockCode {...commonProps} />
      default:
        return <h1 className='w-full text-md font-thin text-center text-[#d4d4d4]'>Unsupported block type: {block.type}</h1>;
    }
  }

  static blockTypes() {
    return ['text', 'subheading', 'heading', 'quote', 'code']
  }
}
