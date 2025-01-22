const router = require("express").Router();
const list = require("../controllers/listController");
const user = require("../controllers/userController");

router.post("/create", user.ensureAuth, list.createList);
router.delete("/delete/:list_id", user.ensureAuth, list.deleteList);
router.put("/edit/:list_id", user.ensureAuth, list.updateList);
router.get("/all", list.getAll);
module.exports = router;
