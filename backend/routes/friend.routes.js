const express = require("express");
const router = express.Router();
const { friendController } = require("../controllers");
const { authenticate, friendValidation } = require("../middleware");

router.use(authenticate);

router.get("/", friendController.getFriends);
router.get("/pending", friendController.getPendingRequests);
router.post("/request", friendValidation.request, friendController.sendRequest);
router.put(
  "/respond/:requesterId",
  friendValidation.respond,
  friendController.respondRequest
);
router.delete("/:userId", friendController.unfriend);

module.exports = router;
