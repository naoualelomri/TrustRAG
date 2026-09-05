import {  useEffect, useRef, useState } from "react";
import {
  getDocuments,
  uploadDocument,
  askQuestion,
} from "./services/api";
import DocumentPanel from "./components/DocumentPanel";
import QuestionInput from "./components/QuestionInput";
import AnswerCard from "./components/AnswerCard";
import SourcesList from "./components/SourcesList";
import VerificationPanel from "./components/VerificationPanel";
import ErrorMessage from "./components/ErrorMessage";

function App() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documentError, setDocumentError] = useState("");
  const [queryError, setQueryError] = useState("");

  const fileInputRef = useRef(null);


  useEffect(() => {
      const loadDocuments = async () => {
        try {
          setDocumentError("");
          const result = await getDocuments();

          setDocuments(result.documents || []);
        } catch (error) {
          console.error();
          setDocumentError(
            error.message || "Failed to load documents"
          )
        }
     };

      loadDocuments();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      setDocumentError("");
      setUploading(true);

      const result = await uploadDocument(file);

      setDocuments((currentDocuments) => {
  const uploadedDocument = {
    name: result.filename,
    status: result.status,
    chunks: result.chunks_created,
  };

  const documentAlreadyExists = currentDocuments.some(
    (document) => document.name === result.filename
  );

  if (documentAlreadyExists) {
    return currentDocuments.map((document) =>
      document.name === result.filename
        ? uploadedDocument
        : document
    );
  }

  return [
    ...currentDocuments,
    uploadedDocument,
  ];
});
    } catch (error) {
      console.error(error);
      setDocumentError(error.message || "Document upload failed.");
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      return;
    }

    try {
      setLoading(true);
      setQueryError("");

      setAnswer("");
      setSources([]);
      setVerification(null);

      const result = await askQuestion(question);

      setAnswer(result.answer);
      setSources(result.sources || []);
      setVerification(result.verification || null);

    } catch (error) {
      console.error(error);
      setQueryError(error.message || "Failed to get an answer.");
    } finally {
      setLoading(false);
    }
  };


  return (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              T
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                TrustRAG
              </h1>

              <p className="text-xs text-slate-500">
                Citation-aware document intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            Hybrid Retrieval
          </span>

          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            Grounding Verification
          </span>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Trustworthy document question answering
        </p>

        <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950">
          Ask your documents and verify the evidence behind every answer.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          TrustRAG combines semantic and lexical retrieval,
          cross-encoder reranking, citations and post-generation
          grounding verification.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <DocumentPanel
          documents={documents}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onUpload={handleUpload}
          error={documentError}
        />

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <QuestionInput
            question={question}
            onQuestionChange={setQuestion}
            onAsk={handleAsk}
            loading={loading}
          />

          <ErrorMessage
            message={queryError}
          />

          <AnswerCard
            answer={answer}
            loading={loading}
          />

          {answer && !loading && (
            <>
              <VerificationPanel
                verification={verification}
              />

              <SourcesList
                sources={sources}
              />
            </>
          )}
        </section>
      </div>
    </main>

    <footer className="mx-auto max-w-7xl px-6 pb-8 pt-4 lg:px-8">
      <div className="border-t border-slate-200 pt-5">
        <p className="text-center text-xs text-slate-400">
          TrustRAG · Hybrid retrieval · Reranking · Citation verification
        </p>
      </div>
    </footer>
  </div>
);
}

export default App;