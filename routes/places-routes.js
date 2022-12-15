const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controllor");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", placesControllers.getplaces);
router.get("/:pid", placesControllers.getPlaceById);
router.get("/user/:uid", placesControllers.getPlaceByUserId);
router.get("/tag/:tid", placesControllers.getPlaceByTagId);
router.use(checkAuth);
router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
);
router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
