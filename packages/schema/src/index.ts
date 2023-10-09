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
export type Method = 'get' | 'GET' | 'delete' | 'DELETE' | 'post' | 'POST' | 'put' | 'PUT';

export interface HttpOptions {
  url: string;
  params?: Record<string, string>;
  data?: Record<string, any>;
  headers?: Record<string, string>;
  method?: Method;
  [key: string]: any;
}

export type RequestFunction = (options: HttpOptions) => Promise<any>;

export interface AppCore {
  dsl?: MApp;
  platform?: string;
  jsEngine?: string;
  request?: RequestFunction;
  [key: string]: any;
}

export enum NodeType {
  CONTAINER = 'container',
  PAGE = 'page',
  ROOT = 'app',
}

export type Id = string | number;

// 事件联动的动作类型
export enum ActionType {
  /** 联动组件 */
  COMP = 'comp',
  /** 联动代码 */
  CODE = 'code',
  /** 数据源 */
  DATA_SOURCE = 'data-source',
}

export interface DataSourceDeps {
  [dataSourceId: string | number]: Dep;
}

/** 事件类型(已废弃，后续不建议继续使用) */
export interface DeprecatedEventConfig {
  /** 待触发的事件名称 */
  name: string;
  /** 被选中组件ID */
  to: Id;
  /** 触发事件后执行被选中组件的方法 */
  method: string;
}

export interface EventConfig {
  /** 待触发的事件名称 */
  name: string;
  /** 动作响应配置 */
  actions: EventActionItem[];
}

export interface CodeItemConfig {
  /** 动作类型 */
  actionType: ActionType;
  /** 代码ID */
  codeId: Id;
  /** 代码参数 */
  params?: object;
}

export interface CompItemConfig {
  /** 动作类型 */
  actionType: ActionType;
  /** 被选中组件ID */
  to: Id;
  /** 触发事件后执行被选中组件的方法 */
  method: string;
}

export interface DataSourceItemConfig {
  /** 动作类型 */
  actionType: ActionType;
  /** [数据源id, 方法] */
  dataSourceMethod: [string, string];
  /** 代码参数 */
  params?: object;
}

export type EventActionItem = CompItemConfig | CodeItemConfig | DataSourceItemConfig;

export interface MComponent {
  /** 组件ID，默认为${type}_${number}}形式, 如：page_123 */
  id: Id;
  /** 组件类型 */
  type?: string;
  /** 组件显示名称 */
  name?: string;
  /** 组件根Dom上的class */
  className?: string;
  /* 关联事件集合 */
  events?: EventConfig[] | DeprecatedEventConfig[];
  /** 组件根Dom的style */
  style?: {
    [key: string]: any;
  };
  [key: string]: any;
}

export interface MContainer extends MComponent {
  /** 容器类型，默认为'container' */
  type?: NodeType.CONTAINER | string;
  /** 容器子元素 */
  items: (MComponent | MContainer)[];
}

export interface MPage extends MContainer {
  /** 页面类型 */
  type: NodeType.PAGE;
}

export interface MApp extends MComponent {
  /** App页面类型，app作为整个结构的根节点；有且只有一个 */
  type: NodeType.ROOT;
  /** */
  items: MPage[];
  /** 代码块 */
  codeBlocks?: CodeBlockDSL;

  dataSources?: DataSourceSchema[];

  dataSourceDeps?: DataSourceDeps;
  dataSourceCondDeps?: DataSourceDeps;
}

export interface CodeBlockDSL {
  [id: Id]: CodeBlockContent;
}

export interface CodeBlockContent {
  /** 代码块名称 */
  name: string;
  /** 代码块内容 */
  content: ((...args: any[]) => any) | string;
  /** 参数定义 */
  params: CodeParam[] | [];
  /** 注释 */
  desc?: string;
  /** 扩展字段 */
  [propName: string]: any;
}

export interface CodeParam {
  /** 参数名 */
  name: string;
  /** 扩展字段 */
  [propName: string]: any;
}

export interface PastePosition {
  left?: number;
  top?: number;
}

export type MNode = MComponent | MContainer | MPage | MApp;

export enum HookType {
  /** 代码块钩子标识 */
  CODE = 'code',
}

export interface DataSchema {
  type?: 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string' | 'any';
  /** 键名 */
  name: string;
  /** 展示名称 */
  title?: string;
  /** 实体描述，鼠标hover时展示 */
  description?: string;
  /** 默认值 */
  defaultValue?: any;
  /** 是否可用 */
  enable?: boolean;
  /** type === 'object' || type === 'array' */
  fields?: DataSchema[];
}

export interface MockSchema {
  title: string;
  description?: string;
  enable: boolean;
  data: Record<string | number, any>;
}

export interface DataSourceSchema {
  /** 数据源类型，根据类型来实例化；例如http则使用new HttpDataSource */
  type: string;
  /** 实体ID */
  id: string;
  /** 实体名称，用于关联时展示 */
  title?: string;
  /** 实体描述，鼠标hover时展示 */
  description?: string;
  /** 字段列表 */
  fields: DataSchema[];
  /** 方法列表 */
  methods: CodeBlockContent[];
  /** mock数据 */
  mocks?: MockSchema[];
  /** 扩展字段 */
  [key: string]: any;
}

export interface Dep {
  [nodeId: Id]: {
    /** 组件名称 */
    name: string;
    keys: (string | number)[];
  };
}
