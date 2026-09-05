function VerificationPanel({ verification }) {
  if (!verification) {
    return null;
  }

  const getStatusConfig = (status) => {
    if (status === "SUPPORTED") {
      return {
        label: "Grounded",
        icon: "✓",
        container:
          "border-emerald-200 bg-emerald-50",
        badge:
          "bg-emerald-100 text-emerald-700",
        text:
          "text-emerald-700",
      };
    }

    if (status === "PARTIALLY_SUPPORTED") {
      return {
        label: "Partially grounded",
        icon: "!",
        container:
          "border-amber-200 bg-amber-50",
        badge:
          "bg-amber-100 text-amber-700",
        text:
          "text-amber-700",
      };
    }

    if (status === "ERROR") {
      return {
        label: "Verification unavailable",
        icon: "!",
        container:
          "border-slate-200 bg-slate-50",
        badge:
          "bg-slate-200 text-slate-600",
        text:
          "text-slate-600",
      };
    }

    return {
      label: "Unsupported",
      icon: "✕",
      container:
        "border-red-200 bg-red-50",
      badge:
        "bg-red-100 text-red-700",
      text:
        "text-red-700",
    };
  };

  const globalStatus =
    getStatusConfig(verification.status);

  return (
    <div className="mt-8">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Grounding verification
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Checks whether the generated claims are supported by retrieved evidence.
        </p>
      </div>

      <div
        className={`rounded-2xl border p-5 ${globalStatus.container}`}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${globalStatus.badge}`}
            >
              {globalStatus.icon}
            </div>

            <div>
              <p
                className={`text-sm font-semibold ${globalStatus.text}`}
              >
                {globalStatus.label}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Verification status: {verification.status}
              </p>
            </div>
          </div>

          {verification.total_claims > 0 && (
            <div className="rounded-xl bg-white/70 px-4 py-2.5 text-center ring-1 ring-black/5">
              <p className="text-lg font-semibold text-slate-800">
                {verification.supported_claims}
                <span className="text-slate-400">
                  {" "}
                  / {verification.total_claims}
                </span>
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                supported claims
              </p>
            </div>
          )}
        </div>

        {verification.message && (
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {verification.message}
          </p>
        )}
      </div>

      {verification.claims?.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-700">
              Claim-level verification
            </p>

            <span className="text-xs text-slate-400">
              {verification.claims.length} claims analyzed
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {verification.claims.map(
              (claim, index) => {
                const claimStatus =
                  getStatusConfig(claim.status);

                return (
                  <div
                    key={`${claim.claim}-${index}`}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${claimStatus.badge}`}
                        >
                          {claimStatus.icon}
                        </div>

                        <p className="text-sm leading-6 text-slate-700">
                          {claim.claim}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${claimStatus.badge}`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    {claim.reason && (
                      <p className="mt-3 pl-10 text-xs leading-5 text-slate-500">
                        {claim.reason}
                      </p>
                    )}

                    {claim.source_ids?.length >
                      0 && (
                      <div className="mt-3 flex flex-wrap gap-2 pl-10">
                        {claim.source_ids.map(
                          (sourceId) => (
                            <span
                              key={sourceId}
                              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500"
                            >
                              {sourceId}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationPanel;