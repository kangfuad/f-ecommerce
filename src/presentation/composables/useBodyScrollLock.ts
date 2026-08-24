import { watch, onUnmounted, type Ref } from 'vue'

let lockCount = 0
let originalOverflow = ''
let originalPaddingRight = ''

/**
 * Clean composable to lock document body scroll when a Modal or Drawer is open.
 * Compensates for scrollbar width to prevent UI jitter / layout shift.
 */
export function useBodyScrollLock(isLocked: Ref<boolean> | (() => boolean)) {
  const lock = () => {
    if (typeof document === 'undefined') return

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow
      originalPaddingRight = document.body.style.paddingRight

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
      document.body.style.overflow = 'hidden'
    }
    lockCount++
  }

  const unlock = () => {
    if (typeof document === 'undefined') return
    if (lockCount > 0) {
      lockCount--
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }

  watch(
    typeof isLocked === 'function' ? isLocked : () => isLocked.value,
    (locked) => {
      if (locked) {
        lock()
      } else {
        unlock()
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    const isCurrentlyLocked = typeof isLocked === 'function' ? isLocked() : isLocked.value
    if (isCurrentlyLocked) {
      unlock()
    }
  })

  return { lock, unlock }
}
