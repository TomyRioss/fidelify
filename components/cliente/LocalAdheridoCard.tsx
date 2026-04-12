import { FiMapPin } from "react-icons/fi";

interface Props {
  name: string;
  address?: string | null;
}

export default function LocalAdheridoCard({ name, address }: Props) {
  return (
    <div className="w-full border-2 border-orange-200 rounded-xl p-4 bg-white">
      <p className="font-semibold text-neutral-900">{name}</p>
      {address && (
        <p className="flex items-center gap-1 text-sm text-neutral-500 mt-3">
          <FiMapPin className="shrink-0 text-orange-500" />
          {address}
        </p>
      )}
    </div>
  );
}
