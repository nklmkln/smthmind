let db;
let dbReq = indexedDB.open("database", 2);

dbReq.onupgradeneeded = function (event) {
  db = event.target.result;

  let items;
  if (!db.objectStoreNames.contains("sentiments")) {
    items = db.createObjectStore("sentiments", { autoIncrement: true });
  } else {
    items = dbReq.transaction.objectStore("sentiments");
  }

  if (!items.indexNames.contains("timestamp")) {
    console.log("createIndex");
    items.createIndex("timestamp", "timestamp");
  }
};

dbReq.onsuccess = function (event) {
  db = event.target.result;
  getAndDisplayItems(db);
};

dbReq.onerror = function (event) {
  alert("error opening database " + event.target.errorCode);
};

function addItem(db, itemText, category) {
  let tx = db.transaction(["sentiments"], "readwrite");
  let store = tx.objectStore("sentiments");
  let item = { text: itemText, type: category, timestamp: Date.now() };
  store.add(item);

  tx.oncomplete = function (event) {
    item.key = event.target.result; // Store the generated key
    getAndDisplayItems(db);
  };
  tx.onerror = function (event) {
    alert("error storing message " + event.target.errorCode);
  };
}

function submitItem() {
  document
    .getElementById("newItem")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      let itemText = document.getElementById("newItemText").value;
      let sentiment = document.querySelector(
        `input[name="sentiment"]:checked`
      ).value;

      addItem(db, itemText, sentiment);
      document.getElementById("newItemText").value = "";
    });
}

function getAndDisplayItems(db) {
  let tx = db.transaction(["sentiments"], "readonly");
  let store = tx.objectStore("sentiments");
  let req = store.openCursor();
  let allItems = [];

  req.onsuccess = function (event) {
    let cursor = event.target.result;
    if (cursor != null) {
      let item = cursor.value;
      item.key = cursor.key;
      allItems.push(cursor.value);
      cursor.continue();
    } else {
      displayItems(allItems);
    }
  };
  req.onerror = function (event) {
    alert("error in cursor request " + event.target.errorCode);
  };
}

function displayItems(items) {
  let itemsList = "";
  let oldDate = "";
  for (let i = items.length - 1; i >= 0; i--) {
    let item = items[i];
    let newDate = new Date(item.timestamp).getDate();

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
      "</div></div><div class='itemDelete' onClick='deleteItem(" +
      item.key +
      ")'>Delete</div></div>";
  }
  document.getElementById("list").innerHTML = itemsList;
}

function deleteItem(key) {
  const tx = db.transaction(["sentiments"], "readwrite");
  const store = tx.objectStore("sentiments");

  const deleteRequest = store.delete(key);

  deleteRequest.onsuccess = function (event) {
    console.log("Item deleted successfully");
    getAndDisplayItems(db);
  };

  deleteRequest.onerror = function (event) {
    console.error("Delete error:", event.target.errorCode);
  };
}
