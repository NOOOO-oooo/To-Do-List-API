const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const joi = require("joi");
const fs = require("fs");

const signupSchema = joi.object({
   email: joi.string().email().required(),
   password: joi.string().min(8).required(),
   name: joi.string().required(),
   picture: joi.string(),
});

const passwordSchema = joi.object({
   email: joi.string().email().required(),
   oldPassword: joi.string().min(8).required(),
   newPassword: joi.string().min(8).required(),
});

exports.signup = async (req, res) => {
   try {
      const { error, value } = signupSchema.validate(req.body, {
         abortEarly: false,
      });
      if (error) {
         return res.status(401).json({ error: error.details.message });
      }
      console.log(req.file);
      const profilePicture = req.file ? req.file.filename : undefined;
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const createUser = await prisma.users.create({
         data: {
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name,
            picture: profilePicture,
            refresh_token: "",
         },
      });

      return res.status(200).json(createUser);
   } catch (error) {
      if (req.file) {
         fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: error.message });
   }
};

exports.signin = async (req, res) => {
   try {
      const validemail = await prisma.users.findUnique({
         where: {
            email: req.body.email,
         },
      });
      if (!validemail) {
         return res.status(400).json({ error: "Invalid email or password" });
      }
      const validPassword = await bcrypt.compare(
         req.body.password,
         validemail.password
      );
      if (!validPassword) {
         return res.status(400).json({ error: "Invalid email or password" });
      }
      const accessToken = await jwt.sign(
         {
            user_id: validemail.user_id,
         },
         process.env.accessToken_secret,
         { subject: "signIn", expiresIn: "1h" }
      );
      const refreshToken = await jwt.sign(
         {
            user_id: validemail.user_id,
         },
         process.env.refreshToken_secret,
         { subject: "refresh", expiresIn: "6h" }
      );
      const pushRefToken = await prisma.users.update({
         where: { user_id: validemail.user_id },
         data: {
            refresh_token: refreshToken,
         },
      });
      return res
         .status(200)
         .json({ message: "Signed In successfully", accessToken });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.editPassword = async (req, res) => {
   try {
      const { error } = passwordSchema.validate(req.body, {
         abortEarly: false,
      });
      if (error) {
         return res.status(401).json({ error: error.message });
      }
      const email = await prisma.users.findUnique({
         where: {
            email: req.body.email,
         },
      });
      const oldPassword = req.body.oldPassword;
      const oldPasswordValid = await bcrypt.compare(
         oldPassword,
         email.password
      );
      if (!oldPasswordValid) {
         return res.status(401).json({ error: "old Password is Invalid" });
      }
      const newPassword = await bcrypt.hash(req.body.newPassword, 10);
      const edit = await prisma.users.update({
         where: {
            email: req.body.email,
         },
         data: {
            password: newPassword,
         },
      });

      return res.status(200).json({ message: "Password updated successfully" });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.changeName = async (req, res) => {
   const headerAccessToken = req.headers.authorization;

   const decodedAccessToken = jwt.verify(
      headerAccessToken,
      process.env.accessToken_secret
   );
   const userId = decodedAccessToken.user_id;
   try {
      const name = await prisma.users.update({
         where: {
            user_id: userId,
         },
         data: {
            name: req.body.name,
         },
      });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.editPic = async (req, res) => {
   const headerAccessToken = req.headers.authorization;

   const decodedAccessToken = jwt.verify(
      headerAccessToken,
      process.env.accessToken_secret
   );
   const userId = decodedAccessToken.user_id;
   try {
      const profilePicture = req.file.filename;
      if (!profilePicture) {
         return res
            .status(400)
            .json({ message: "Field is empty, please upload the image" });
      }
      const edit = await prisma.users.update({
         where: {
            user_id: userId,
         },
         data: {
            picture: profilePicture,
         },
      });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.deletePic = async (req, res) => {
   const headerAccessToken = req.headers.authorization;

   const decodedAccessToken = jwt.verify(
      headerAccessToken,
      process.env.accessToken_secret
   );
   const userId = decodedAccessToken.user_id;
   try {
      const user = await prisma.users.findUnique({
         where: {
            user_id: userId,
         },
      });
      if (!user) {
         return res.status(404).json({ message: "User Not found" });
      }
      if (user.picture) {
         const filePath = path.join(__dirname, "profilePics", user.picture);
         fs.unlink(filePath, (error) => {
            if (error) {
               console.log(`Error deleting file of path: ${filePath}`);
            } else {
               console.log(`Deleted pic path: ${filePath}`);
            }
         });
      }
      const fromDb = await prisma.users.update({
         where: {
            user_id: userId,
         },
         data: {
            picture: " ",
         },
      });
      return res.status(200).json({ message: "Profile Picture Deleted!" });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

// Check if access token is invalid or expired. if so then(based on validity of the refresh token) generate a new one.
// Throw it in the authorization header(does not work in postman).
// In a real work env. this would keep the access until the refresh token expires, after that they'll have to sign in again.
exports.ensureAuth = async (req, res, next) => {
   const headerAccessToken = req.headers.authorization;

   const decodedAccessToken = jwt.verify(
      headerAccessToken,
      process.env.accessToken_secret
   );
   const userId = decodedAccessToken.user_id;

   if (!headerAccessToken) {
      return res.status(401).json({ message: "Access Token Not Found" });
   }
   try {
      if (decodedAccessToken) next();
   } catch (error) {
      if (
         error instanceof jwt.TokenExpiredError ||
         error instanceof jwt.JsonWebTokenError
      ) {
         try {
            const user = await prisma.users.findUnique({
               where: {
                  user_id: userId,
               },
            });
            jwt.verify(user.refresh_token, process.env.refreshToken_secret);
            // New accessToken
            const newAccessToken = jwt.sign(
               {
                  user_id: user,
               },
               process.env.accessToken_secret,
               { subject: "signIn", expiresIn: "1h" }
            );
            // in a real world environment, this would set the accessToken in the auth header.
            // res.setHeader("authorization", newAccessToken);
            next();
         } catch (refTokenError) {
            if (refTokenError instanceof jwt.TokenExpiredError) {
               return res
                  .status(401)
                  .json({ refTokenError: "refresh Token Expired" });
            }
         }
      }
   }
};
