//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const items = new Map();
const workItems = new Map();
const completedItems = new Map();
global.lists = {}; // Global object to store lists

// Initial items
items.set('1', 'Buy Food');
items.set('2', 'Cook Food');
items.set('3', 'Eat Food');

// Home route handler
app.get("/", function (req, res) {
  const day = date.getDate();
  const itemList = Array.from(items, ([uid, text]) => ({ uid, text }));
  res.render("list-map", { listTitle: day, newListItems: itemList });
});

// Item addition handler
app.post("/", function (req, res) {
  const itemText = req.body.newItem;
  const listName = req.body.listName;
  const uid = Date.now().toString();

  if (listName === "Work") {
    workItems.set(uid, itemText);
    res.redirect("/work");
  } else {
    items.set(uid, itemText);
    res.redirect("/");
  }
});

// Work list route handler
app.get("/work", function (req, res) {
  const itemList = Array.from(workItems, ([uid, text]) => ({ uid, text }));
  res.render("list-map", { listTitle: "Work List", newListItems: itemList });
});

// Item deletion handler
app.post("/delete", function (req, res) {
  const uidToDelete = req.body.uid;
  const listName = req.body.listName;

  if (listName === "Work") {
    workItems.delete(uidToDelete);
    res.redirect("/work");
  } else {
    items.delete(uidToDelete);
    res.redirect("/");
  }
});

// Edit route handler
app.get("/edit/:uid", function (req, res) {
  const uidToEdit = req.params.uid;
  const listName = req.query.list;
  let item;

  if (listName === "Work") {
    item = workItems.get(uidToEdit);
  } else {
    item = items.get(uidToEdit);
  }

  res.render("edit", { listName, uidToEdit, item });
});

// Edit item handler
app.post("/edit/:uid", function (req, res) {
  const uidToEdit = req.params.uid;
  const listName = req.body.listName;
  const editedText = req.body.editedText;

  if (listName === "Work") {
    workItems.set(uidToEdit, editedText);
    res.redirect("/work");
  } else {
    items.set(uidToEdit, editedText);
    res.redirect("/");
  }
});

// Completed items route handler
app.get("/completed", function (req, res) {
  const completedList = Array.from(completedItems, ([uid, text]) => ({ uid, text }));
  res.render("completed", { completedList });
});

// Add new list route handler
app.post("/addList", function (req, res) {
  const newListName = req.body.newListName;
  global.lists[newListName] = new Map();
  res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Server started on port", PORT);
});
