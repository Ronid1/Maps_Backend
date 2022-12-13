const express = require("express");
const { check } = require("express-validator");
const tagsControllers = require("../controllers/tags-controllor");

const router = express.Router();

router.get("/", tagsControllers.getTags);
router.get("/:id", tagsControllers.getTagById);
router.post(
  "/",
  [check("name").not().isEmpty(), check("color").trim().isHexColor()],
  tagsControllers.createTag
);
router.patch(
  "/:id",
  [check("name").not().isEmpty(), check("color").trim().isHexColor()],
  tagsControllers.editTag
);
router.delete("/:id", tagsControllers.deleteTag);

module.exports = router;
