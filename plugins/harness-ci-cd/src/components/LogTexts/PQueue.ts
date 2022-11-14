/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export type PromiseThunk = (signal: AbortSignal) => Promise<unknown>
import { v4 as uuid } from 'uuid'

export class PQueue {
  private queue: Array<() => void> = []
  private runningCount = 0
  private concurrency = Infinity
  private controllerMap = new Map<string, AbortController>()

  constructor(concurrency?: number) {
    if (typeof concurrency === 'number' && concurrency >= 1) {
      this.concurrency = concurrency
    }
  }

  add(fn: PromiseThunk): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const run = (): void => {
        this.runningCount++
        const uid = uuid()
        const controller = new AbortController()
        this.controllerMap.set(uid, controller)
        fn(controller.signal).then(
          (value: unknown) => {
            resolve(value)
            this.controllerMap.delete(uid)
            this.runningCount--
            this.next()
          },
          (err: Error) => {
            this.controllerMap.delete(uid)
            if (err instanceof DOMException && err.name === 'AbortError') {
              // do nothing
            } else {
              reject(err)
            }
            this.runningCount--
            this.next()
          }
        )
      }

      if (this.runningCount < this.concurrency) {
        run()
      } else {
        this.queue.push(run)
      }
    })
  }

  cancel(): void {
    this.controllerMap.forEach(controller => {
      controller.abort()
    })
    this.controllerMap.clear()
  }

  private next(): void {
    if (this.runningCount >= this.concurrency) {
      return
    }

    if (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) {
        task()
      }
    }
  }
}
