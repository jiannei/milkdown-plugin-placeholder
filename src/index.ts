import { createSlice, createTimer } from '@milkdown/ctx'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import type { MilkdownPlugin } from '@milkdown/ctx'

import { InitReady, prosePluginsCtx } from '@milkdown/core'

const placeholderCtx = createSlice('Please input here...', 'placeholder')
const PlaceholderReady = createTimer('PlaceholderReady')

const pluginKey = new PluginKey('MILKDOWN_PLACEHOLDER')

export const placeholder: MilkdownPlugin = (ctx) => {
  ctx.inject(placeholderCtx).record(PlaceholderReady)

  // #1 prepare plugin
  return async () => {
    // #2 run plugin
    await ctx.wait(InitReady)
    const prosePlugins = ctx.get(prosePluginsCtx)

    const update = (view: EditorView) => {
      const doc = view.state.doc
      if (
        doc.childCount === 1
        && doc.firstChild?.isTextblock
        && doc.firstChild?.content.size === 0
        && doc.firstChild?.type.name === 'paragraph'
      )
        view.dom.setAttribute('data-placeholder', ctx.get(placeholderCtx))
      else
        view.dom.removeAttribute('data-placeholder')
    }

    const plugins = [
      ...prosePlugins,
      new Plugin({
        pluginKey,
        view(view) {
          update(view)

          return { update }
        },
      }),
    ]

    ctx.set(prosePluginsCtx, plugins)

    ctx.done(PlaceholderReady)

    // #3 clean up plugin
    return async () => {
      ctx.remove(placeholderCtx).clearTimer(PlaceholderReady)
    }
  }
}
