const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Tag = require("../models/tag");

async function getTags(req, res, next) {
  let tags;
  try {
    tags = await Tag.find({});
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  res.json({ tags: tags.map((tag) => tag.toObject({ getters: true })) });
}

async function getTagById(req, res, next) {
  const tagId = req.params.id;
  let tag;

  try {
    tag = await Tag.findById(tagId);
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!tag)
    return next(new HttpError("Could not find tag with provided id", 404));
  res.json({ tag: tag.toObject({ getters: true }) });
}

async function createTag(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed", 422));

  const { name, color, places } = req.body;
  const newTag = new Tag({
    name,
    color,
    places,
  });

  try {
    await newTag.save();
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  res.status(201).json({ tag: newTag.toObject({ getters: true }) });
}

async function editTag(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed", 422));

  const tagId = req.params.id;
  const { name, color, places } = req.body;

  let tagToUpdate;
  try {
    tagToUpdate = await Tag.findById(tagId);
    tagToUpdate.name = name;
    tagToUpdate.color = color;
    tagToUpdate.places = places;
    tagToUpdate.save();
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  res.status(200).json({ tag: tagToUpdate.toObject({ getters: true }) });
}

async function deleteTag(req, res, next) {
  const tagId = req.params.id;
  let tagToDelete;
  try {
    tagToDelete = await Tag.findById(tagId);
    await tagToDelete.remove();
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!tagToDelete) return next(new HttpError("no such tag found", 404));

  res.status(200).json({ message: "Deleted" });
}

exports.getTags = getTags;
exports.getTagById = getTagById;
exports.createTag = createTag;
exports.editTag = editTag;
exports.deleteTag = deleteTag;
