"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  children: ReactNode;
  description?: string | undefined;
  error?: string | undefined;
  label: string;
  name: string;
};

export function FieldShell({
  children,
  description,
  error,
  label,
  name,
}: FieldShellProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

type TextFieldProps<TFieldValues extends FieldValues> =
  Omit<ComponentPropsWithoutRef<typeof Input>, "name"> & {
    control: Control<TFieldValues>;
    description?: string | undefined;
    label: string;
    name: FieldPath<TFieldValues>;
  };

export function TextField<TFieldValues extends FieldValues>({
  className,
  control,
  description,
  label,
  name,
  ...props
}: TextFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldShell
          description={description}
          error={fieldState.error?.message}
          label={label}
          name={name}
        >
          <Input
            {...field}
            {...props}
            className={cn(fieldState.invalid && "border-destructive", className)}
            id={name}
            value={field.value ?? ""}
          />
        </FieldShell>
      )}
    />
  );
}

export function SubmitButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button className={className} disabled={pending} type="submit">
      {pending ? "Saving..." : children}
    </Button>
  );
}
