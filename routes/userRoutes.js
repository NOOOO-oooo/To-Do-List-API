const router = require("express").Router();
const user = require("../controllers/userController");
const { upload } = require("../ProfilePicMulter");
router.post("/signup", upload.single("picture"), user.signup);
router.get("/signin", user.signin);
router.put("/edit/password", user.ensureAuth, user.editPassword);
router.put("/edit/password", user.ensureAuth, user.changeName);
router.put(
   "/edit/pic",
   user.ensureAuth,
   upload.single("picture"),
   user.editPic
);
router.put("/edit/Deletepic", user.ensureAuth, user.deletePic);
module.exports = router;
