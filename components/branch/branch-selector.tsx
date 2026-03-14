"use client";

import { FiMapPin } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBranch } from "@/lib/branch-context";

export function BranchSelector() {
  const { activeBranch, branches, setActiveBranch } = useBranch();

  if (!branches.length) return null;

  function handleChange(id: string | null) {
    if (!id) return;
    const branch = branches.find((b) => b.id === id);
    if (branch) setActiveBranch(branch);
  }

  return (
    <div className="flex items-center gap-2">
      <FiMapPin className="text-neutral-500 shrink-0" />
      <Select value={activeBranch?.id ?? ""} onValueChange={handleChange}>
        <SelectTrigger className="w-48 bg-orange-50 border-orange-200 text-neutral-700 focus:ring-orange-300">
          <SelectValue placeholder="Seleccionar sucursal" />
        </SelectTrigger>
        <SelectContent className="bg-orange-50 border-orange-200">
          {branches.map((b) => (
            <SelectItem
              key={b.id}
              value={b.id}
              className="text-neutral-700 focus:bg-orange-100"
            >
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
