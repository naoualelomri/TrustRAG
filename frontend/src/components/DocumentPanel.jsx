import ErrorMessage from "./ErrorMessage";

function DocumentPanel({
  documents,
  uploading,
  fileInputRef,
  onUpload,
  error,
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Documents
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Your indexed knowledge base
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {documents.length} indexed
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {documents.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
            <p className="text-sm font-medium text-slate-600">
              No documents yet
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Upload a PDF to start building your searchable knowledge base.
            </p>
          </div>
        )}

        {documents.map((document, index) => (
          <div
            key={`${document.name}-${index}`}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold tracking-wide text-slate-600">
                PDF
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {document.name}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Indexed
                  </span>

                  {document.chunks !== undefined && (
                    <span className="text-xs text-slate-400">
                      {document.chunks} chunks
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onUpload}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mt-5 flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? "Indexing document..." : "+ Upload PDF"}
      </button>

      <p className="mt-2 text-center text-xs text-slate-400">
        PDF files only
      </p>

      <ErrorMessage message={error} />
    </aside>
  );
}

export default DocumentPanel;