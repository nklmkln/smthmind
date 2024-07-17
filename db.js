let db;
let dbReq = indexedDB.open("database", 1);

dbReq.onupgradeneeded = function (event) {
  db = event.target.result;
  let notes = db.createObjectStore("messages", { autoIncrement: true });
};

dbReq.onsuccess = function (event) {
  db = event.target.result;
  getAndDisplayItems(db);
};

dbReq.onerror = function (event) {
  alert("error opening database " + event.target.errorCode);
};

function addNote(db, message, category) {
  let tx = db.transaction(["messages"], "readwrite");
  let store = tx.objectStore("messages");
  let item = { text: message, type: category, timestamp: Date.now() };
  store.add(item);
  tx.oncomplete = function () {
    getAndDisplayItems(db);
  };
  tx.onerror = function (event) {
    alert("error storing message " + event.target.errorCode);
  };
}

function submitNote() {
  let note = document.getElementById("note");
  let sentiment = document.querySelector(`input[name="sentiment"]:checked`);
  addNote(db, note.value, sentiment.value);
  note.value = "";
}

function getAndDisplayItems(db) {
  let tx = db.transaction(["messages"], "readonly");
  let store = tx.objectStore("messages");
  let req = store.openCursor();
  let allNotes = [];

  req.onsuccess = function (event) {
    let cursor = event.target.result;
    if (cursor != null) {
      allNotes.push(cursor.value);
      cursor.continue();
    } else {
      displayItems(allNotes);
    }
  };
  req.onerror = function (event) {
    alert("error in cursor request " + event.target.errorCode);
  };
}

function displayItems(items) {
  let itemsList = "";
  oldDate = "";
  for (let i = items.length - 1; i >= 0; i--) {
    let item = items[i];
    newDate = new Date(item.timestamp).getDate();

    if (newDate != oldDate) {
      itemsList +=
        "<div class='date'>" +
        new Date(item.timestamp).getDate() +
        "." +
        new Date(item.timestamp).getMonth() +
        "." +
        new Date(item.timestamp).getFullYear() +
        "</div>";
    }

    oldDate = new Date(item.timestamp).getDate();

    const timeString = new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    itemsList +=
      "<div class='item'><img class='itemSentiment' src='./assets/" +
      item.type +
      ".png' alt='" +
      item.type +
      "' /><div class='itemContent'><div class='itemTime'>" +
      timeString +
      "</div><div class='itemText'>" +
      item.text +
      "</div></div></div>";
  }
  document.getElementById("list").innerHTML = itemsList;
}
