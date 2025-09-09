import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text, HTML, PhrasingContent } from 'mdast';
import type { VFile } from 'vfile';

interface SidenoteState {
  counter: number;
}

const remarkSidenotes: Plugin<[], Root> = () => {
  return (tree: Root, file: VFile) => {
    const state: SidenoteState = { counter: 0 };
    
    // First pass: handle text nodes that contain sidenotes
    visit(tree, 'text', (node, index, parent) => {
      const text = node.value;
      
      if (text.includes('<sidenote>')) {
        const segments: PhrasingContent[] = [];
        let lastIndex = 0;
        let match;
        const regex = /<sidenote>(.*?)<\/sidenote>/gs;
        
        while ((match = regex.exec(text)) !== null) {
          // Add text before the sidenote
          if (match.index > lastIndex) {
            const textNode: Text = {
              type: 'text',
              value: text.slice(lastIndex, match.index)
            };
            segments.push(textNode);
          }
          
          // Add the sidenote HTML
          state.counter++;
          const content = match[1].trim();
          const sidenoteId = `sn-${state.counter}`;
          
          const htmlNode: HTML = {
            type: 'html',
            value: `<label for="${sidenoteId}" class="sidenote-toggle">⊕</label>
<input type="checkbox" id="${sidenoteId}" class="sidenote-toggle" />
<span class="sidenote">${content}</span>`
          };
          segments.push(htmlNode);
          
          lastIndex = regex.lastIndex;
        }
        
        // Add remaining text after last sidenote
        if (lastIndex < text.length) {
          const textNode: Text = {
            type: 'text',
            value: text.slice(lastIndex)
          };
          segments.push(textNode);
        }
        
        // Replace the current node with the segments
        if (parent && typeof index === 'number') {
          parent.children.splice(index, 1, ...segments);
        }
      }
    });

    // Second pass: handle HTML nodes that might be sidenote tags
    visit(tree, 'html', (node, index, parent) => {
      const html = node.value;
      const regex = /<sidenote>(.*?)<\/sidenote>/gs;
      
      if (regex.test(html)) {
        state.counter++;
        const content = html.match(/<sidenote>(.*?)<\/sidenote>/s)?.[1]?.trim() || '';
        const sidenoteId = `sn-${state.counter}`;
        
        node.value = `<label for="${sidenoteId}" class="sidenote-toggle">⊕</label>
<input type="checkbox" id="${sidenoteId}" class="sidenote-toggle" />
<span class="sidenote">${content}</span>`;
      }
    });
  };
};

export default remarkSidenotes;