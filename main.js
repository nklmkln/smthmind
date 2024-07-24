var db = new Dexie("ThoughtsDatabase");

db.version(1).stores({
  thoughts: `
      timestamp,
      tag,
      mood`,
});

db.open()
  .then(() => {
    getAndDisplayThoughts();
  })
  .catch((error) => {
    console.error("Failed to open database:", error);
  });

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("newItem")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      let itemText = document.getElementById("newItemText").value;
      let itemTag = document.getElementById("newItemTag").value.toUpperCase();
      let itemMood = document.querySelector(
        `input[name="sentiment"]:checked`
      ).value;

      db.thoughts
        .add({
          timestamp: Date.now(),
          tag: itemTag,
          mood: itemMood,
          text: itemText,
        })
        .then(getAndDisplayThoughts);
      umami.track("record added");

      document.getElementById("newItemText").value = "";
      document.getElementById("newItemTag").value = "";
      document.querySelector(`input[name="sentiment"]:checked`).checked = false;
    });
});

function getAndDisplayThoughts() {
  db.thoughts.reverse().toArray().then(displayThoughts);
  document.getElementById("clearFilter").innerHTML = "";
  document.getElementById("listFilter").innerHTML = "MY THOUGHTS";
  document.getElementById("exportLink").innerHTML = "↓ Export";
}

function filterThoughts(filter, value) {
  db.thoughts
    .where(filter)
    .equals(value)
    .reverse()
    .toArray()
    .then(displayThoughts);

  document.getElementById("clearFilter").innerHTML = "Clear";
  document.getElementById("listFilter").innerHTML = value;
  document.getElementById("exportLink").innerHTML = "";
}

function displayThoughts(items) {
  let itemsList = "";
  let oldDate = "";
  if (items.length == 0) {
    document.getElementById("list").innerHTML =
      "<div id='emptyState'><img src='assets/empty.png' alt='smthmind logo' /><p>Record your thoughts and mood for reflection. Everything is stored locally in your browser. Export data when you need it.</p></div>";
  } else {
    for (let i = 0; i < items.length; i++) {
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

      const itemTag =
        item.tag == ""
          ? ""
          : ` → <div class='itemTag' onClick='filterThoughts("tag", "${item.tag}")'>${item.tag}</div>`;

      itemsList +=
        "<div class='item'><img class='itemSentiment' src='assets/" +
        item.mood +
        ".png' alt='" +
        item.mood +
        "' /><div class='itemContent'><div class='itemHeader'><div class='itemData'>" +
        timeString +
        itemTag +
        "</div><div class='itemDelete' onClick='deleteItem(" +
        item.timestamp +
        ")'>Delete</div></div><div class='itemText'>" +
        item.text +
        "</div></div></div>";
    }
    document.getElementById("list").innerHTML = itemsList;
    document.getElementById("listHeader").style.display = "flex";
  }
}

function deleteItem(timestamp) {
  db.thoughts.delete(timestamp).then(getAndDisplayThoughts);
}

document.addEventListener("DOMContentLoaded", () => {
  const exportLink = document.getElementById("exportLink");

  exportLink.onclick = async () => {
    try {
      const blob = await db.export({ prettyJson: true, progressCallback });
      download(blob, "my_smthmind_data.json", "application/json");
    } catch (error) {
      console.error("" + error);
    }
  };
});

function progressCallback({ totalRows, completedRows }) {
  console.log(`Progress: ${completedRows} of ${totalRows} rows completed`);
}
