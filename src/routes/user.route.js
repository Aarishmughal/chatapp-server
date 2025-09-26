const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// Standard Auth Routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// User Routes
router.use(authController.protect);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/update-me", userController.updateUser);
router.delete("/delete-me", userController.deleteUser);

router.use(authController.protect, authController.restrictTo("admin"));
router
    .route("/")
    .post(userController.createUser)
    .get(userController.getAllUsers);
router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
