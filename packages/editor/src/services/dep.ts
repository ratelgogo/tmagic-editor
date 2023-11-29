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
import { reactive } from 'vue';

import { DepTargetType, type Target, Watcher } from '@tmagic/dep';
import type { Id, MNode } from '@tmagic/schema';

import BaseService from './BaseService';

class Dep extends BaseService {
  private watcher = new Watcher({ initialTargets: reactive({}) });

  public removeTargets(type: string = DepTargetType.DEFAULT) {
    this.watcher.removeTargets(type);

    this.emit('remove-target');
  }

  public getTargets(type: string = DepTargetType.DEFAULT) {
    return this.watcher.getTargets(type);
  }

  public getTarget(id: Id) {
    return this.watcher.getTarget(id);
  }

  public addTarget(target: Target) {
    this.watcher.addTarget(target);
    this.emit('add-target', target);
  }

  public removeTarget(id: Id) {
    this.watcher.removeTarget(id);
    this.emit('remove-target');
  }

  public clearTargets() {
    this.watcher.clearTargets();
  }

  public collect(nodes: MNode[], deep = false) {
    this.watcher.collect(nodes, deep);
    this.emit('collected', nodes, deep);
  }

  public clear(nodes?: MNode[]) {
    return this.watcher.clear(nodes);
  }

  public hasTarget(id: Id) {
    return this.watcher.hasTarget(id);
  }
}

export type DepService = Dep;

export default new Dep();
