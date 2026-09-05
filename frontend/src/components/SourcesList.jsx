function SourcesList({ sources }) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sources
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Retrieved evidence used to generate the answer.
          </p>
        </div>

        <span className="text-xs text-slate-400">
          {sources.length} sources
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sources.map((source) => (
          <div
            key={`${source.source_id}-${source.chunk_id}`}
            className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                {source.source_id}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {source.document}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    Page {source.page}
                  </span>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Used in answer
                  </span>
                </div>

                {source.chunk_id && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Chunk ID
                    </p>

                    <p className="mt-1 truncate font-mono text-xs text-slate-400">
                      {source.chunk_id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SourcesList;