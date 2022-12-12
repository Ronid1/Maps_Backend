const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

let DUMMY_TAGS = [
  {
    id: "t1",
    name: "Restaurants",
    color: "#8c0a06",
  },
  {
    id: "t2",
    name: "Parks",
    color: "#033303",
  },
];

function getTags(req, res, next) {
  res.json({ tags: DUMMY_TAGS });
}

function getTagById(req, res, next) {
  const tagId = req.params.id;
  const tag = DUMMY_TAGS.find((t) => {
    return t.id === tagId;
  });
  if (!tag)
    return next(new HttpError("Could not find tag with provided id", 404));
  res.json({ tag });
}

function createTag(req, res, next){
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return next(new HttpError("Invalid inputs passed", 422));
  
    const { name, color } = req.body;  
    const newTag = {
      id: uuid(),
      name,
      color,
    };
    DUMMY_TAGS.push(newTag);
  
    res.status(201).json({ tag: newTag });
}

function editTag(req, res, next){
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return next(new HttpError("Invalid inputs passed", 422));
  
    const tagId = req.params.id;
    const { name, color } = req.body;
    const tagToUpdate = { ...DUMMY_TAGS.find((t) => t.id === tagId) };
    const index = DUMMY_TAGS.findIndex((t) => t.id === tagId);
    tagToUpdate.name = name;
    tagToUpdate.color = color;
  
    DUMMY_TAGS[index] = tagToUpdate;
  
    res.status(200).json({ tag: tagToUpdate });
}

function deleteTag(req, res, next){
    const tagId = req.params.id;
    const tagToDelete = DUMMY_TAGS.find((t) => t.id === tagId);
    if (!tagToDelete) return next(new HttpError("no such tag found", 404));
  
    DUMMY_TAGS = DUMMY_TAGS.findIndex((t) => t !== tagToDelete);
  
    res.status(200).json({ message: "Deleted" });
}


exports.getTags = getTags
exports.getTagById = getTagById
exports.createTag = createTag
exports.editTag = editTag
exports.deleteTag = deleteTag
