import { ref } from 'vue'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastOptions {
  type?: ToastType
  title?: string
  message: string
  duration?: number
  actionText?: string
  onAction?: () => void
}

const activeToast = ref<ToastOptions | null>(null)
let toastTimeout: any = null

export function useToast() {
  function showToast(options: ToastOptions | string) {
    if (toastTimeout) clearTimeout(toastTimeout)

    if (typeof options === 'string') {
      activeToast.value = {
        type: 'info',
        message: options,
        duration: 3500,
      }
    } else {
      activeToast.value = {
        type: options.type || 'info',
        title: options.title,
        message: options.message,
        duration: options.duration || 4000,
        actionText: options.actionText,
        onAction: options.onAction,
      }
    }

    const dur = activeToast.value.duration || 4000
    toastTimeout = setTimeout(() => {
      activeToast.value = null
    }, dur)
  }

  function dismissToast() {
    if (toastTimeout) clearTimeout(toastTimeout)
    activeToast.value = null
  }

  return {
    activeToast,
    showToast,
    dismissToast,
  }
}
