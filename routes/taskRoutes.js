const router = require("express").Router();
const user = require("../controllers/userController");
const task = require("../controllers/taskController");
const { upload } = require("../taskPicMulter");

router.post(
   "/create",
   upload.single("picture"),
   user.ensureAuth,
   task.createTask
);
router.put("/edit/desc/:task_id", user.ensureAuth, task.editTaskDescription);

router.put(
   "/edit/pic/:task_id",
   user.ensureAuth,
   upload.single("picture"),
   task.editPic
);
router.put("/edit/stat/:task_id", user.ensureAuth, task.markAsDone);
router.put("/delete/pic/:task_id", user.ensureAuth, task.deletePic);

router.delete("/delete/:task_id", user.ensureAuth, task.deleteTask);

module.exports = router;
