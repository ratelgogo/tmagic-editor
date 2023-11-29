/*
 * Tencent is pleased to support the open source community by making TMagicEditor available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import type { DataSchema, DataSourceDeps, Id, MComponent, MNode } from '@tmagic/schema';
import { NodeType } from '@tmagic/schema';

export * from './dom';

dayjs.extend(utc);

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve();
    }, ms);
  });

export const datetimeFormatter = (
  v: string | Date,
  defaultValue = '-',
  format = 'YYYY-MM-DD HH:mm:ss',
): string | number => {
  if (v) {
    let time = null;
    if (['x', 'timestamp'].includes(format)) {
      time = dayjs(v).valueOf();
    } else if ((typeof v === 'string' && v.includes('Z')) || v.constructor === Date) {
      // UTC字符串时间或Date对象格式化为北京时间
      time = dayjs(v).utcOffset(8).format(format);
    } else {
      time = dayjs(v).format(format);
    }

    // 格式化为北京时间
    if (time !== 'Invalid Date') {
      return time;
    }
    return defaultValue;
  }
  return defaultValue;
};

// 驼峰转换横线
export const toLine = (name = '') => name.replace(/\B([A-Z])/g, '-$1').toLowerCase();

export const toHump = (name = ''): string => name.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());

export const emptyFn = (): any => undefined;

/**
 * 通过id获取组件在应用的子孙路径
 * @param {number | string} id 组件id
 * @param {Array} data 要查找的根容器节点
 * @return {Array} 组件在data中的子孙路径
 */
export const getNodePath = (id: Id, data: MNode[] = []): MNode[] => {
  const path: MNode[] = [];

  const get = function (id: number | string, data: MNode[]): MNode | null {
    if (!Array.isArray(data)) {
      return null;
    }

    for (let i = 0, l = data.length; i < l; i++) {
      const item = data[i];

      path.push(item);
      if (`${item.id}` === `${id}`) {
        return item;
      }

      if (item.items) {
        const node = get(id, item.items);
        if (node) {
          return node;
        }
      }

      path.pop();
    }

    return null;
  };

  get(id, data);

  return path;
};

export const filterXSS = (str: string) =>
  str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const getUrlParam = (param: string, url?: string) => {
  const u = url || location.href;
  const reg = new RegExp(`[?&#]${param}=([^&#]+)`, 'gi');

  const matches = u.match(reg);
  let strArr;
  if (matches && matches.length > 0) {
    strArr = matches[matches.length - 1].split('=');
    if (strArr && strArr.length > 1) {
      // 过滤XSS字符
      return filterXSS(strArr[1]);
    }
    return '';
  }
  return '';
};

export const isObject = (obj: any) => Object.prototype.toString.call(obj) === '[object Object]';

export const isPop = (node: MComponent | null): boolean => Boolean(node?.type?.toLowerCase().endsWith('pop'));

export const isPage = (node?: MComponent | null): boolean => {
  if (!node) return false;
  return Boolean(node.type?.toLowerCase() === NodeType.PAGE);
};

export const isNumber = (value: string) => /^(-?\d+)(\.\d+)?$/.test(value);

export const getHost = (targetUrl: string) => targetUrl.match(/\/\/([^/]+)/)?.[1];

export const isSameDomain = (targetUrl = '', source = globalThis.location.host) => {
  const isHttpUrl = /^(http[s]?:)?\/\//.test(targetUrl);

  if (!isHttpUrl) return true;

  return getHost(targetUrl) === source;
};

/**
 * 生成指定位数的GUID，无【-】格式
 * @param digit 位数，默认值8
 * @returns
 */
export const guid = (digit = 8): string =>
  'x'.repeat(digit).replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const getValueByKeyPath: any = (keys: string, value: Record<string | number, any> = {}) => {
  const path = keys.split('.');
  const pathLength = path.length;

  return path.reduce((accumulator, currentValue: any, currentIndex: number) => {
    if (Object.prototype.toString.call(accumulator) === '[object Object]' || Array.isArray(accumulator)) {
      return accumulator[currentValue];
    }

    if (pathLength - 1 === currentIndex) {
      return undefined;
    }

    return {};
  }, value);
};

export const getNodes = (ids: Id[], data: MNode[] = []): MNode[] => {
  const nodes: MNode[] = [];

  const get = function (ids: Id[], data: MNode[]) {
    if (!Array.isArray(data)) {
      return;
    }

    for (let i = 0, l = data.length; i < l; i++) {
      const item = data[i];
      const index = ids.findIndex((id: Id) => `${id}` === `${item.id}`);

      if (index > -1) {
        ids.slice(index, 1);
        nodes.push(item);
      }

      if (item.items) {
        get(ids, item.items);
      }
    }
  };

  get(ids, data);

  return nodes;
};

export const getDepKeys = (dataSourceDeps: DataSourceDeps = {}, nodeId: Id) =>
  Array.from(
    Object.values(dataSourceDeps).reduce((prev, cur) => {
      (cur[nodeId]?.keys || []).forEach((key) => prev.add(key));
      return prev;
    }, new Set<Id>()),
  );

export const getDepNodeIds = (dataSourceDeps: DataSourceDeps = {}) =>
  Array.from(
    Object.values(dataSourceDeps).reduce((prev, cur) => {
      Object.keys(cur).forEach((id) => {
        prev.add(id);
      });
      return prev;
    }, new Set<string>()),
  );

/**
 * 将新节点更新到data或者parentId对应的节点的子节点中
 * @param newNode 新节点
 * @param data 需要修改的数据
 * @param parentId 父节点 id
 */
export const replaceChildNode = (newNode: MNode, data?: MNode[], parentId?: Id) => {
  const path = getNodePath(newNode.id, data);
  const node = path.pop();
  let parent = path.pop();

  if (parentId) {
    parent = getNodePath(parentId, data).pop();
  }

  if (!node) throw new Error('未找到目标节点');
  if (!parent) throw new Error('未找到父节点');

  const index = parent.items?.findIndex((child: MNode) => child.id === node.id);
  parent.items.splice(index, 1, newNode);
};

export const compiledNode = (
  compile: (value: any) => any,
  node: MNode,
  dataSourceDeps: DataSourceDeps = {},
  sourceId?: Id,
) => {
  let keys: Id[] = [];
  if (!sourceId) {
    keys = getDepKeys(dataSourceDeps, node.id);
  } else {
    const dep = dataSourceDeps[sourceId];
    keys = dep?.[node.id].keys || [];
  }

  const keyPrefix = '__magic__';

  keys.forEach((key) => {
    const keyPath = `${key}`.split('.');
    const keyPathLength = keyPath.length;
    keyPath.reduce((accumulator, currentValue: any, currentIndex) => {
      if (keyPathLength - 1 === currentIndex) {
        const cacheKey = `${keyPrefix}${currentValue}`;

        if (typeof accumulator[cacheKey] === 'undefined') {
          accumulator[cacheKey] = accumulator[currentValue];
        }

        try {
          accumulator[currentValue] = compile(accumulator[cacheKey]);
        } catch (e) {
          console.error(e);
          accumulator[currentValue] = '';
        }

        return accumulator;
      }

      if (isObject(accumulator) || Array.isArray(accumulator)) {
        return accumulator[currentValue];
      }

      return {};
    }, node);
  });

  if (Array.isArray(node.items)) {
    node.items.forEach((item) => compiledNode(compile, item, dataSourceDeps));
  }

  return node;
};

export const compiledCond = (op: string, fieldValue: any, value: any, range: [number, number]): boolean => {
  switch (op) {
    case 'is':
      if (fieldValue !== value) return false;
      break;
    case 'not':
      if (fieldValue === value) return false;
      break;
    case '=':
      if (fieldValue !== value) return false;
      break;
    case '!=':
      if (fieldValue === value) return false;
      break;
    case '>':
      if (fieldValue <= value) return false;
      break;
    case '>=':
      if (fieldValue < value) return false;
      break;
    case '<':
      if (fieldValue >= value) return false;
      break;
    case '<=':
      if (fieldValue > value) return false;
      break;
    case 'between':
      if (fieldValue < range[0] || fieldValue > range[1]) return false;
      break;
    case 'not_between':
      if (fieldValue >= range[0] && fieldValue <= range[1]) return false;
      break;
    case 'include':
      if (typeof fieldValue !== 'undefined' && !fieldValue.includes?.(value)) return false;
      break;
    case 'not_include':
      if (typeof fieldValue !== 'undefined' && fieldValue.includes?.(value)) return false;
      break;
    default:
      break;
  }

  return true;
};

export const getDefaultValueFromFields = (fields: DataSchema[]) => {
  const data: Record<string, any> = {};

  const defaultValue: Record<string, any> = {
    string: undefined,
    object: {},
    array: [],
    boolean: undefined,
    number: undefined,
    null: null,
    any: undefined,
  };

  fields.forEach((field) => {
    if (typeof field.defaultValue !== 'undefined') {
      if (field.type === 'array' && !Array.isArray(field.defaultValue)) {
        data[field.name] = defaultValue.array;
        return;
      }

      if (field.type === 'object' && !isObject(field.defaultValue)) {
        if (typeof field.defaultValue === 'string') {
          try {
            data[field.name] = JSON.parse(field.defaultValue);
          } catch (e) {
            data[field.name] = defaultValue.object;
          }
          return;
        }

        data[field.name] = defaultValue.object;
        return;
      }

      data[field.name] = field.defaultValue;
      return;
    }

    if (field.type === 'object') {
      data[field.name] = field.fields ? getDefaultValueFromFields(field.fields) : defaultValue.object;
      return;
    }

    if (field.type) {
      data[field.name] = defaultValue[field.type];
      return;
    }

    data[field.name] = undefined;
  });

  return data;
};

export const DATA_SOURCE_FIELDS_SELECT_VALUE_PREFIX = 'ds-field::';

export const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

export const calculatePercentage = (value: number, percentageStr: string) => {
  const percentage = globalThis.parseFloat(percentageStr) / 100; // 先将百分比字符串转换为浮点数，并除以100转换为小数
  const result = value * percentage;
  return result;
};

export const isPercentage = (value: number | string) => /^(\d+)(\.\d+)?%$/.test(`${value}`);

export const convertToNumber = (value: number | string, parentValue = 0) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && isPercentage(value)) {
    return calculatePercentage(parentValue, value);
  }

  return parseFloat(value);
};
