const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


async function handleApiError(response, fallbackMessage) {
  let message = fallbackMessage;

  try {
    const errorData = await response.json();

    if (errorData.detail) {
      message = errorData.detail;
    }
  } catch {
    // If the backend did not return JSON,
    // keep the fallback message.
  }

  throw new Error(message);
}


export async function getDocuments() {
  const response = await fetch(
    `${API_URL}/api/documents`
  );

  if (!response.ok) {
    await handleApiError(
      response,
      "Failed to load documents."
    );
  }

  return response.json();
}


export async function uploadDocument(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/documents`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    await handleApiError(
      response,
      "Document upload failed."
    );
  }

  return response.json();
}


export async function askQuestion(question) {
  const response = await fetch(
    `${API_URL}/api/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      }),
    }
  );

  if (!response.ok) {
    await handleApiError(
      response,
      "Failed to get an answer."
    );
  }

  return response.json();
}