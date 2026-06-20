// components/ui/textarea.tsx
// مكون منطقة نصية متكامل مع دعم تغيير الحجم التلقائي وحالة الخطأ
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** عرض حالة الخطأ */
  error?: boolean
  /** عرض رسالة مساعدة */
  helperText?: string
  /** تمكين تغيير الحجم التلقائي */
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, autoResize, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    // دالة تغيير الحجم التلقائي
    const handleAutoResize = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea && autoResize) {
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [autoResize])

    // دمج الـ refs
    const setRefs = React.useCallback(
      (element: HTMLTextAreaElement | null) => {
        textareaRef.current = element
        if (typeof ref === "function") {
          ref(element)
        } else if (ref) {
          ref.current = element
        }
      },
      [ref]
    )

    // معالج التغيير
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (autoResize) {
          handleAutoResize()
        }
        onChange?.(e)
      },
      [autoResize, handleAutoResize, onChange]
    )

    // تهيئة الحجم عند التحميل
    React.useEffect(() => {
      if (autoResize) {
        handleAutoResize()
      }
    }, [autoResize, handleAutoResize])

    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-y",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={setRefs}
          onChange={handleChange}
          {...props}
        />
        {helperText && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
