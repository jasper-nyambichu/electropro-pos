export default function Footer() {
  return (
    <footer
      id="app-footer"
      className="fixed bottom-0 w-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant z-40 transition-all duration-300"
    >
      <div className="flex justify-between items-center px-gutter py-2">
        <span>Copyright © 2024 ElectroPro POS. All rights reserved.</span>
        <span>Version 1.0</span>
      </div>
    </footer>
  );
}