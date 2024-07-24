document.addEventListener("keydown", handleShortcut);

function handleShortcut(event) {
  switch (event.key) {
    case "/":
      event.preventDefault();
      const textArea = document.getElementById("newItemText");
      const tagInput = document.getElementById("newItemTag");
      if (textArea) {
        document.activeElement == textArea
          ? tagInput.focus()
          : textArea.focus();
      }
      break;
    case "Enter":
      event.preventDefault();
      const form = document.getElementById("newItem");
      if (form) {
        let form = document.getElementById("newItem");
        form.dispatchEvent(new Event("submit"));
      }
      break;
  }
}
