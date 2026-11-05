import { LockDemo } from "./lock-demo";

// The page owns the full-screen sizing, so the demo itself can be dropped
// anywhere and size to its content
export default function Page() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center">
      <LockDemo />
    </div>
  );
}
