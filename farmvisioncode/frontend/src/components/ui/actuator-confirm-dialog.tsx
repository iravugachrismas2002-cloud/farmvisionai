"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { ActuatorStateBadge } from "@/components/ui/actuator-state-badge";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={`
      fixed inset-0 z-50 bg-background/80 backdrop-blur-sm
      data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
      ${className || ""}
    `}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={`
        fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4
        border border-border p-0 shadow-lg rounded-lg
        bg-popover text-popover-foreground
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
        sm:rounded-xl
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`
      flex flex-col space-y-1.5 p-5 text-center sm:text-left border-b border-border
      ${className || ""}
    `}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`
      flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-5 border-t border-border
      ${className || ""}
    `}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={`
      text-lg font-semibold leading-none tracking-tight
      ${className || ""}
    `}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={`
      text-sm text-muted-foreground
      ${className || ""}
    `}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

type ActuatorConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actuatorName: string;
  deviceId: string;
  actuatorType: string;
  currentState: "OFF" | "RUNNING";
  desiredState: "RUNNING" | "OFF";
  expectedAction: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ActuatorConfirmDialog({
  open,
  onOpenChange,
  actuatorName,
  deviceId,
  actuatorType,
  currentState,
  desiredState,
  expectedAction,
  onConfirm,
  onCancel,
}: ActuatorConfirmDialogProps) {
  const isStarting = desiredState === "RUNNING";
  const actionVerb = isStarting ? "Start" : "Stop";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isStarting ? "Start Actuator?" : "Stop Actuator?"}
          </DialogTitle>
          <DialogDescription>
            Confirm the actuator control action before it is sent to the controller.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background/50">
              <ActuatorStateBadge
                state={currentState === "RUNNING" ? "RUNNING" : "OFF"}
                showIcon
                className="text-[10px] px-2 py-1"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{actuatorName}</p>
                <p className="text-xs text-muted-foreground">{deviceId} • {actuatorType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-background/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Current Status</p>
                <p className="text-sm font-medium text-foreground capitalize">{currentState}</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-background/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Expected Action</p>
                <p className="text-sm font-medium text-foreground">{expectedAction}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
              <p className="text-[10px] text-destructive font-medium uppercase tracking-wider">Safety Notice</p>
              <p className="text-sm text-destructive">
                This command will be sent to the ESP32 controller. The dashboard will only update after the controller acknowledges execution.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {actionVerb} {actuatorName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
