import { EnhancedImportExport } from "@/components/enhanced-import-export";

export default function ImportExport() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Import/Export</h1>
            <p className="text-muted-foreground mt-1">
              Manage your data and create backups
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          <EnhancedImportExport />
        </div>
      </div>
    </div>
  );
}
