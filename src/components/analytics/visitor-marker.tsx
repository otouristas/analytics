import { Monitor, Smartphone } from "lucide-react";
import { personaOf, type LivePerson } from "@/lib/analytics/realtime";
import { cn } from "@/lib/utils";

export { personaOf };

const FACES = [
  "/avatars/01.jpg",
  "/avatars/02.jpg",
  "/avatars/03.jpg",
  "/avatars/04.jpg",
  "/avatars/05.jpg",
  "/avatars/06.jpg",
  "/avatars/07.jpg",
  "/avatars/08.jpg",
];

export function faceOf(id: string) {
  let n = 0;
  for (const char of id) n = (n * 33 + char.charCodeAt(0)) >>> 0;
  return FACES[n % FACES.length]!;
}

export function hashJitter(id: string) {
  let n = 0;
  for (const char of id) n = (n * 31 + char.charCodeAt(0)) >>> 0;
  return {
    lat: ((n % 17) - 8) * 0.55,
    lng: (((n >> 4) % 17) - 8) * 0.55,
    delay: (n % 12) * 0.12,
  };
}

export function VisitorFigure({
  personId,
  device,
  size = "md",
}: {
  personId: string;
  device: "desktop" | "mobile";
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "size-14" : size === "sm" ? "size-8" : "size-11";
  return (
    <span className="relative inline-flex shrink-0">
      <img
        src={faceOf(personId)}
        alt=""
        className={cn(box, "rounded-full object-cover shadow-[var(--shadow-border)] ring-2 ring-bg")}
      />
      <span className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-surface text-fg shadow-[var(--shadow-border)]">
        {device === "mobile" ? <Smartphone className="size-2.5" /> : <Monitor className="size-2.5" />}
      </span>
    </span>
  );
}

export function VisitorPin({
  person,
  label,
  onSelect,
}: {
  person: LivePerson;
  label?: boolean;
  onSelect?: () => void;
}) {
  const jitter = hashJitter(person.id);
  return (
    <button
      type="button"
      onClick={onSelect}
      className="visitor-pin flex flex-col items-center"
      style={{ animationDelay: `${jitter.delay}s` }}
    >
      <span className="relative">
        <img
          src={faceOf(person.id)}
          alt=""
          className="size-14 rounded-full object-cover ring-2 ring-bg shadow-[var(--shadow-border)]"
        />
        <span className="absolute top-0 right-0 size-3 rounded-full bg-positive ring-2 ring-bg" />
      </span>
      {label && (
        <span className="mt-1 max-w-28 truncate text-center text-xs text-fg">
          {person.city}
        </span>
      )}
    </button>
  );
}

export function VisitorAvatar({
  person,
  live,
  size = "md",
}: {
  person: Pick<LivePerson, "persona" | "device" | "id">;
  live?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <VisitorFigure personId={person.id} device={person.device} size={size} />
      {live && <span className="absolute top-0 right-0 size-2 rounded-full bg-positive ring-2 ring-bg" />}
    </span>
  );
}

export function visitorClass(hidden?: boolean) {
  return cn("pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-full", hidden && "hidden");
}
