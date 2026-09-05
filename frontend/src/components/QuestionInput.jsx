function QuestionInput({
  question,
  onQuestionChange,
  onAsk,
  loading,
}) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ask TrustRAG
          </p>

          <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 sm:inline-flex">
            Hybrid Search
          </span>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          What would you like to know?
        </h2>

        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Ask a question about your indexed documents.
          TrustRAG will retrieve, rerank and verify the supporting evidence.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-2 transition focus-within:border-slate-400 focus-within:bg-white">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={question}
            onChange={(event) =>
              onQuestionChange(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !loading &&
                question.trim()
              ) {
                onAsk();
              }
            }}
            placeholder="Ask about policies, procedures, technical details..."
            disabled={loading}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={onAsk}
            disabled={loading || !question.trim()}
            className="flex min-w-28 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
        <span>Dense + BM25 retrieval</span>

        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

        <span>Cross-encoder reranking</span>

        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

        <span>Citation verification</span>
      </div>
    </div>
  );
}

export default QuestionInput;