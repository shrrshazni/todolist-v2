const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const port = 3000;
// const date = require(__dirname + "/date.js");

const app = express();

main().catch((err) => console.log(err));

async function main() {
    await mongoose.connect(
        "mongodb+srv://shrrshazni:Calle21strt@cluster0.rembern.mongodb.net/todolistDB"
    );

    const itemSchema = {
        name: String,
    };

    const Item = mongoose.model("Item", itemSchema);

    const item1 = new Item({
        name: "Welcome to out todolist",
    });

    const item2 = new Item({
        name: "Hit + button to add new item",
    });

    const item3 = new Item({
        name: "<-- Hit this to delete an item",
    });

    const defaultItems = [item1, item2, item3];

    const listSchema = {
        name: String,
        items: [itemSchema],
    };

    const List = mongoose.model("List", listSchema);

    //express app

    app.set("view engine", "ejs");

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static("public"));

    app.get("/", async function (req, res) {
        const findItems = await Item.find({});
        if (findItems.length === 0) {
            const result = Item.insertMany(defaultItems);
            if (result) {
                console.log("Successfully added items");
            } else {
                console.log("There is an error");
            }
        } else {
            res.render("list", { listTitle: "Today", newListItems: findItems });
        }
    });

    app.post("/", async function (req, res) {
        const itemName = req.body.newItem;
        const listName = req.body.list;

        const item = new Item({
            name: itemName,
        });

        if (listName === "Today") {
            item.save();
            res.redirect("/");
        } else {
            const checkList1 = await List.findOne({ name: listName });
            checkList1.items.push(item);
            checkList1.save();
            res.redirect("/" + listName);
        }
    });

    app.post("/delete", async function (req, res) {
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;

        if (listName === "Today") {
            const checkResult = await Item.findByIdAndRemove(checkedItemId);

            if (checkResult) {
                console.log("Successfully removed an item");
                res.redirect("/");
            }
        } else {
            const checkList = await List.findOneAndUpdate(
                { name: listName },
                { $pull: { items: { _id: checkedItemId } } }
            );
            if (checkList) {
                res.redirect("/" + listName);
            }
        }
    });

    app.get("/:customListName", async function (req, res) {
        const customListName = _.capitalize(req.params.customListName);

        const checkList = await List.findOne({ name: customListName });

        if (!checkList) {
            const list = new List({
                name: customListName,
                items: defaultItems,
            });

            list.save();

            res.redirect("/" + customListName);
        } else {
            res.render("list", {
                listTitle: checkList.name,
                newListItems: checkList.items,
            });
        }
    });

    app.post("/work", function (req, res) {
        let item = req.body.newItem;
        workItems.push(item);
        res.redirect("/work");
    });

    app.get("/about", function (req, res) {
        res.render("about");
    });

    app.listen(port, function () {
        console.log("Server is up & running on port 3000.");
    });
}
