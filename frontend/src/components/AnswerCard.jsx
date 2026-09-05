function AnswerCard({
  answer,
  loading,
}) {
  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900">
            <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">
              TrustRAG is reasoning over your documents
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Retrieving relevant evidence, reranking candidates and
              verifying the generated answer.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
                Retrieving
              </span>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
                Reranking
              </span>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
                Verifying
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-12 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
          AI
        </div>

        <p className="mt-4 text-sm font-medium text-slate-700">
          Your grounded answer will appear here
        </p>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          Upload a document and ask a question to retrieve evidence,
          generate an answer and verify its grounding.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Answer
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Generated from retrieved document evidence
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          RAG response
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
            T
          </div>

          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnswerCard;