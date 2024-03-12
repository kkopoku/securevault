const handleCopyToClipboard = () => {
  // Create a temporary textarea element
  const textarea = document.createElement("textarea");

  // Set the value to the link
  textarea.value = link;

  // Append the textarea to the document
  document.body.appendChild(textarea);

  // Select the text in the textarea
  textarea.select();

  // Copy the selected text to the clipboard
  document.execCommand("copy");

  // Remove the temporary textarea
  document.body.removeChild(textarea);
};

export {handleCopyToClipboard};