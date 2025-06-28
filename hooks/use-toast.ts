import { toast as sonnerToast } from "sonner"
import type { ExternalToast } from "sonner"

// Define toast types based on Sonner's API
type ToastOptions = ExternalToast & {
  id?: string | number
}

// Support for legacy toast format with title and description
type LegacyToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "info"
} & ToastOptions

type SonnerPromiseReturn<T = any> =
  | (string & { unwrap: () => Promise<T> })
  | (number & { unwrap: () => Promise<T> })
  | { unwrap: () => Promise<T> };

type ToastFunction = {
  (message: string, options?: ToastOptions): string | number
  (props: LegacyToastProps): string | number
  success: (message: string, options?: ToastOptions) => string | number
  error: (message: string, options?: ToastOptions) => string | number
  warning: (message: string, options?: ToastOptions) => string | number
  info: (message: string, options?: ToastOptions) => string | number
  loading: (message: string, options?: ToastOptions) => string | number
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    options?: {
      loading?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    } & ToastOptions
  ) => SonnerPromiseReturn<T>
  custom: (jsx: React.ReactNode, options?: ToastOptions) => string | number
  dismiss: (id?: string | number) => void
}

// Create the toast function that wraps Sonner
const toast: ToastFunction = Object.assign(
  (messageOrProps: string | LegacyToastProps, options?: ToastOptions) => {
    // Handle legacy format with title and description
    if (typeof messageOrProps === 'object' && messageOrProps !== null) {
      const { title, description, variant = "default", ...restOptions } = messageOrProps
      const message = title || description || 'Notification'
      const finalOptions = {
        ...restOptions,
        ...(description && title ? { description } : {}),
      }
      
      // Map variant to appropriate Sonner toast type
      switch (variant) {
        case "destructive":
          return sonnerToast.error(message, finalOptions)
        case "success":
          return sonnerToast.success(message, finalOptions)
        case "warning":
          return sonnerToast.warning(message, finalOptions)
        case "info":
          return sonnerToast.info(message, finalOptions)
        case "default":
        default:
          return sonnerToast(message, finalOptions)
      }
    }
    
    // Handle string message format
    return sonnerToast(messageOrProps, options)
  },
  {
    success: (message: string, options?: ToastOptions) =>
      sonnerToast.success(message, options),
    error: (message: string, options?: ToastOptions) =>
      sonnerToast.error(message, options),
    warning: (message: string, options?: ToastOptions) =>
      sonnerToast.warning(message, options),
    info: (message: string, options?: ToastOptions) =>
      sonnerToast.info(message, options),
    loading: (message: string, options?: ToastOptions) =>
      sonnerToast.loading(message, options),
    promise: <T>(
      promise: Promise<T> | (() => Promise<T>),
      options?: {
        loading?: string
        success?: string | ((data: T) => string)
        error?: string | ((error: any) => string)
      } & ToastOptions
    ) => sonnerToast.promise(promise, options),
    custom: (jsx: React.ReactNode, options?: ToastOptions) =>
      sonnerToast.custom(jsx, options),
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  }
)

// Hook for using toast (simplified as Sonner handles state internally)
function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  }
}

export { useToast, toast }