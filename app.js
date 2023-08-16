//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema );

const Item1 = new Item ({
  name: "Welcome to your todo list"
});

const Item2 = new Item ({
  name: "Click on + to add new items"
});

const Item3 = new Item ({
  name: "<-- You can also delete"
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema );

app.get("/", function(req, res) {
  Item.find({})
    .then(foundItems => {
      if (foundItems.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        return foundItems;
      }
    })
    .then(items => {
      res.render("list", { listTitle: "Today", newListItems: items });
    })
    .catch(err => {
      console.log(err);
    });
});

app.post("/", function(req, res){
  const listName = req.body.list;
  const item = new Item ({
    name: req.body.newItem
  });

  if (listName === 'Today') {
    itemName.save();
    res.redirect('/');
  } else {
    List.findOne({name: listName})
    .then(foundItems => {
      foundItems.items.push(item);
      foundItems.save();
      res.redirect('/'+listName)
    })
  }
});

app.post('/delete', function(req, res){
  const checkbox = req.body.checkbox
  const listName = req.body.listName
  if (listName === 'Today') {
    Item.findByIdAndRemove(checkbox)
    .then(removedItem => {
      console.log('Item removed:', removedItem);
      res.redirect('/');
    })
    .catch(err => {
      console.error('Error removing item:', err);
      res.redirect('/');
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkbox}}})
    .then(foundItems => {
      console.log(foundItems)
      res.redirect('/'+listName)
    })
    .catch(err => {
      console.error( err);
    });
  }
});

app.get("/:customName", function(req,res){
  const customName = _.capitalize(req.params.customName);
  List.findOne({ name: customName })
  .then(foundList => {
    if (foundList) {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    } else {
      const list = new List ({
        name: customName,
        items: defaultItems
      });
      list.save();  
      res.redirect('/'+customName)  
    }
  })
  .catch(err => {
    console.error('Error finding list:', err);
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
