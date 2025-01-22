const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { date } = require("joi");

const filefilter = function (req, file, cb) {
   if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      cb(null, true);
   } else {
      cb(null, false);
   }
};

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      const dir = "profilePics";

      if (!fs.existsSync(dir)) {
         fs.mkdirSync(dir);
      }

      cb(null, dir);
   },
   filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
   },
});

exports.upload = multer({
   storage: storage,
   fileFilter: filefilter,
});
