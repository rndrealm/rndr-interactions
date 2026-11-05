import { MobileSheetDemo } from "./mobile-sheet-demo";

// The page owns the full-screen sizing, so the demo itself can be dropped
// anywhere and size to its content
export default function Page() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <MobileSheetDemo />
    </div>
  );
}
