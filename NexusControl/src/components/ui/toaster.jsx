import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <
// @ts-ignore
    ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...
// @ts-ignore
      props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <
// @ts-ignore
              ToastTitle>{title}</ToastTitle>}
              {description && (
                <
// @ts-ignore
                ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
} 