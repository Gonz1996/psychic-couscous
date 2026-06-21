"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Option {
  id: string;
  name: string;
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={name} name={name} type={type} step={step} defaultValue={defaultValue} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  error,
  optional,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: Option[];
  error?: string;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
      >
        {optional && <option value="">— Aucun —</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
