const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { date } = require("joi");

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      const dir = "taskPics";
      if (!fs.existsSync(dir)) {
         fs.mkdirSync(dir);
      }

      cb(null, dir);
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
   },
});

exports.upload = multer({ storage: storage });
