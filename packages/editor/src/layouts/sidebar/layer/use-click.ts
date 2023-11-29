import { type ComputedRef, nextTick, type Ref, ref } from 'vue';
import { throttle } from 'lodash-es';

import { Id, MNode } from '@tmagic/schema';

import { LayerNodeStatus, Services, TreeNodeData, UI_SELECT_MODE_EVENT_NAME } from '@editor/type';
import { updateStatus } from '@editor/utils/tree';

import LayerMenu from './LayerMenu.vue';

export const useClick = (
  services: Services | undefined,
  isCtrlKeyDown: Ref<boolean>,
  nodeStatusMap: ComputedRef<Map<Id, LayerNodeStatus> | undefined>,
) => {
  // 触发画布选中
  const select = async (data: MNode) => {
    if (!data.id) {
      throw new Error('没有id');
    }

    if (isCtrlKeyDown.value) {
      multiSelect(data);
    } else {
      await services?.editorService.select(data);
      services?.editorService.get('stage')?.select(data.id);
    }
  };

  const multiSelect = async (data: MNode) => {
    const nodes = services?.editorService.get('nodes') || [];

    const newNodes: Id[] = [];
    let isCancel = false;
    nodes.forEach((node) => {
      if (node.id === data.id) {
        isCancel = true;
        return;
      }

      newNodes.push(node.id);
    });

    // 只剩一个不能取消选中
    if (!isCancel || newNodes.length === 0) {
      newNodes.push(data.id);
    }

    await services?.editorService.multiSelect(newNodes);
    services?.editorService.get('stage')?.multiSelect(newNodes);
  };

  const throttleTime = 300;
  // 鼠标在组件树移动触发高亮
  const highlightHandler = throttle((event: MouseEvent, data: TreeNodeData) => {
    highlight(data);
  }, throttleTime);

  // 触发画布高亮
  const highlight = (data: TreeNodeData) => {
    services?.editorService?.highlight(data);
    services?.editorService?.get('stage')?.highlight(data.id);
  };

  const nodeClickHandler = (event: MouseEvent, data: TreeNodeData) => {
    if (!nodeStatusMap?.value) return;

    if (services?.uiService.get('uiSelectMode')) {
      document.dispatchEvent(new CustomEvent(UI_SELECT_MODE_EVENT_NAME, { detail: data }));
      return;
    }

    if (data.items && data.items.length > 0 && !isCtrlKeyDown.value) {
      updateStatus(nodeStatusMap.value, data.id, {
        expand: true,
      });
    }

    nextTick(() => {
      select(data);
    });
  };

  // 右键菜单
  const menu = ref<InstanceType<typeof LayerMenu>>();

  return {
    menu,

    nodeClickHandler,

    nodeContentmenuHandler(event: MouseEvent, data: TreeNodeData) {
      event.preventDefault();

      const nodes = services?.editorService.get('nodes') || [];
      if (nodes.length < 2 || !nodes.includes(data)) {
        nodeClickHandler(event, data);
      }

      menu.value?.show(event);
    },

    highlightHandler,
  };
};
