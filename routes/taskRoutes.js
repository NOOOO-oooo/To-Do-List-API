const router = require("express").Router();
const user = require("../controllers/userController");
const task = require("../controllers/taskController");
const { upload } = require("../taskPicMulter");

router.post("/create", upload.single("picture"), task.createTask);
router.put("/edit/desc/:task_id", task.editTaskDescription);

router.put("/edit/pic/:task_id", upload.single("picture"), task.editPic);
router.put("/edit/stat/:task_id", task.markAsDone);
router.put("/delete/pic/:task_id", task.deletePic);

router.delete("/delete/:task_id", task.deleteTask);

module.exports = router;
