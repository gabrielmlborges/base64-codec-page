"use strict";

const formEncodeText = document.getElementById("formEncodeText");
const formDecodeText = document.getElementById("formDecodeText");
const formEncodeBuffered = document.getElementById("formEncodeBuffered");
const formDecodeBuffered = document.getElementById("formDecodeBuffered");
const formEncodeStreamed = document.getElementById("formEncodeStreamed");
const formDecodeStreamed = document.getElementById("formDecodeStreamed");
const textEncodeInput = document.getElementById("encodeText");
const textDecodeInput = document.getElementById("decodeText");
const textEncodeOutput = document.getElementById("outputEncodeText");
const textDecodeOutput = document.getElementById("outputDecodeText");
const bufferedEncodeFile = document.getElementById("encodeBufferedFile");
const bufferedDecodeFile = document.getElementById("decodeBufferedFile");
const streamedEncodeFile = document.getElementById("encodeStreamedFile");
const streamedDecodeFile = document.getElementById("decodeStreamedFile");
const errorDialog = document.getElementById("errorDialog");
const errorDialogStatus = document.getElementById("errorDialogStatus");
const errorDialogBody = document.getElementById("errorDialogBody");
const API_URL = "https://base64codecapi.onrender.com";

function showError(error) {
  errorDialogStatus.textContent = `Status: ${error.status ?? "—"}`;
  errorDialogBody.textContent = error.message || "Unknown error";
  errorDialog.showModal();
}

function triggerDownload(blob, filename, anchorId) {
  const url = URL.createObjectURL(blob);
  const a = document.getElementById(anchorId);
  a.href = url;
  a.download = filename;
  a.textContent = `Download ${filename}`;
  a.hidden = false;
  URL.revokeObjectURL(url);
}

async function throwIfNotOk(response) {
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = [body.title, body.detail].filter(Boolean).join(": ") || message;
    } catch {}
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
}

async function postText(endpoint, text, outputElement, responseKey) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  await throwIfNotOk(response);
  const result = await response.json();
  outputElement.textContent = result[responseKey];
}

async function postFile(endpoint, file, outputFilename, anchorId) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });
  await throwIfNotOk(response);
  const blob = await response.blob();
  triggerDownload(blob, outputFilename, anchorId);
}

formEncodeBuffered.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = bufferedEncodeFile.files[0];
  try {
    await postFile(
      "/encode/buffered",
      file,
      `${file.name}.txt`,
      "outputEncodeBuffered",
    );
  } catch (error) {
    showError(error);
  }
});

formDecodeBuffered.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = bufferedDecodeFile.files[0];
  try {
    const baseName = file.name.replace(/\.txt$/, "");
    await postFile("/decode/buffered", file, baseName, "outputDecodeBuffered");
  } catch (error) {
    showError(error);
  }
});

formEncodeStreamed.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = streamedEncodeFile.files[0];
  try {
    await postFile(
      "/encode/streamed",
      file,
      `${file.name}.txt`,
      "outputEncodeStreamed",
    );
  } catch (error) {
    showError(error);
  }
});

formDecodeStreamed.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = streamedDecodeFile.files[0];
  try {
    const baseName = file.name.replace(/\.txt$/, "");
    await postFile("/decode/streamed", file, baseName, "outputDecodeStreamed");
  } catch (error) {
    showError(error);
  }
});

formEncodeText.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await postText(
      "/encode/text",
      textEncodeInput.value,
      textEncodeOutput,
      "encodedText",
    );
  } catch (error) {
    showError(error);
  }
});

formDecodeText.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await postText(
      "/decode/text",
      textDecodeInput.value,
      textDecodeOutput,
      "decodedText",
    );
  } catch (error) {
    showError(error);
  }
});

document.querySelectorAll("[data-copy-target]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const target = document.getElementById(btn.dataset.copyTarget);
    const text =
      target.tagName === "TEXTAREA" ? target.value : target.textContent;
    await navigator.clipboard.writeText(text);
    btn.textContent = "Copied!";
    btn.classList.add("text-green-500");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("text-green-500");
    }, 1500);
  });
});
