import { Id, MContainer, MPage, NodeType } from '@tmagic/schema';
import { isPage } from '@tmagic/utils';

import type { MenuButton, Services } from '@editor/type';
import { RefObject, useRef } from 'react';

export const useDeleteMenu = (): MenuButton => ({
  type: 'button',
  text: '删除',
  // icon: DeleteOutlined,
  display: (services: Services) => {
    const node = services?.editorService?.get('node');
    return node?.type !== NodeType.ROOT && !isPage(node);
  },
  handler: (services: Services) => {
    const nodes = services?.editorService?.get('nodes');
    nodes && services?.editorService?.remove(nodes);
  },
});

const canPaste = useRef(false);

export const useCopyMenu = (): MenuButton => ({
  type: 'button',
  text: '复制',
  // icon: markRaw(CopyDocument),
  handler: (services: Services) => {
    const nodes = services?.editorService?.get('nodes');
    nodes && services?.editorService?.copy(nodes);
    canPaste.current = true;
  },
});

export const usePasteMenu = (menu?: RefObject<HTMLDivElement | undefined>): MenuButton => ({
  type: 'button',
  text: '粘贴',
  // icon: CopyOutlined,
  display: () => canPaste.current,
  handler: (services: Services) => {
    const nodes = services?.editorService?.get('nodes');
    if (!nodes || nodes.length === 0) return;

    if (menu?.current) {
      const stage = services?.editorService?.get('stage');
      const rect = menu.current?.getBoundingClientRect();
      const parentRect = stage?.container?.getBoundingClientRect();
      const initialLeft = (rect.left || 0) - (parentRect?.left || 0);
      const initialTop = (rect.top || 0) - (parentRect?.top || 0);
      services?.editorService?.paste({ left: initialLeft, top: initialTop });
    } else {
      services?.editorService?.paste();
    }
  },
});

const moveTo = (id: Id, services?: Services) => {
  if (!services?.editorService) return;

  const nodes = services.editorService.get('nodes') || [];
  const parent = services.editorService.getNodeById(id) as MContainer;

  if (!parent) return;

  services?.editorService.add(nodes, parent);
  services?.editorService.remove(nodes);
};

export const useMoveToMenu = (services?: Services): MenuButton => {
  const root = services?.editorService?.get('root');

  return {
    type: 'button',
    text: '移动至',
    display: (services: Services) => {
      const node = services?.editorService?.get('node');
      const pageLength = services?.editorService?.get('pageLength') || 0;
      return !isPage(node) && pageLength > 1;
    },
    items: (root.value?.items || [])
      .filter((page: MPage) => page.id !== services?.editorService?.get('page')?.id)
      .map((page: MPage) => ({
        text: `${page.name}(${page.id})`,
        type: 'button',
        handler: (services?: Services) => {
          moveTo(page.id, services);
        },
      })),
  };
};
