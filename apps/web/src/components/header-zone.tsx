import { cn } from "@lms-platform/ui/lib/utils";

interface HeaderZoneProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  label?: string;
  className?: string;
}

export const HeaderZone = ({
  title,
  description,
  action,
  children,
  label,
  className,
}: React.ComponentProps<"div"> & HeaderZoneProps) => {
  return (
    <div className={cn("relative border border-border mb-8 w-full", className)}>
      <span className="absolute top-0 left-0 size-2 border-l border-t border-foreground/20 z-10" />
      <span className="absolute top-0 right-0 size-2 border-r border-t border-foreground/20 z-10" />
      <span className="absolute bottom-0 left-0 size-2 border-l border-b border-foreground/20 z-10" />
      <span className="absolute bottom-0 right-0 size-2 border-r border-b border-foreground/20 z-10" />

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
          )}
          <h1 className="text-xl font-medium">{title}</h1>
        </div>
        {action && action}
      </div>

      {description && (
        <div className="border-t border-border px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {description}
          </span>
        </div>
      )}

      {children}
    </div>
  );
};
