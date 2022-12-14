const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const Tag = require("../models/tag");

async function getplaces(req, res, next) {
  let places;
  try {
    places = await Place.find({});
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
}

async function getPlaceById(req, res, next) {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!place)
    return next(new HttpError("Could not find place with provided id", 404));

  res.json({ place: place.toObject({ getters: true }) });
}

async function getPlaceByUserId(req, res, next) {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }
  if (!places.length)
    return next(
      new HttpError("Could not find places with provided user id", 404)
    );
  res.json({ place: places.map((place) => place.toObject({ getters: true })) });
}

async function getPlaceByTagId(req, res, next) {
  const tagId = req.params.tid;
  let places;
  try {
    places = await Place.find({ tag: tagId });
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!places.length)
    return next(
      new HttpError("Could not find places with provided tag id", 404)
    );
  res.json({ place: places.map((place) => place.toObject({ getters: true })) });
}

async function createPlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed", 422));

  const { title, description, address, creator, tags } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  // Check creator is a user in system
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }
  if (!user) return next(new HttpError("Invalide creator", 404));

  // Check tags excist in system
  let validTags = [];
  if (tags) {
    for (let tag of tags) {
      try {
        let tagObj = await Tag.findById(tag);
        validTags.push(tagObj);
        if (!tagObj) return next(new HttpError("Invalide tag", 404));
      } catch (err) {
        return next(
          new HttpError("Creating place failed, please try again1", 500)
        );
      }
    }
  }

  const newPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    creator,
    tags: validTags,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session });
    user.places.push(newPlace);
    await user.save({ session });

    if (validTags[0]) {
      validTags.forEach(async (tag) => {
        tag.places.push(newPlace);
        await tag.save({ session });
      });
    }
    await session.commitTransaction();
  } catch {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  res.status(201).json({ place: newPlace.toObject({ getters: true }) });
}

//TODO
async function updatePlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed", 422));

  const placeId = req.params.pid;
  const { title, description, tags } = req.body;

  //TODO: chack valid tags & remove location from unused tags
  let placeToUpdate;
  try {
    placeToUpdate = await Place.findById(placeId);
    placeToUpdate.title = title;
    placeToUpdate.description = description;
    placeToUpdate.tags = tags;
    placeToUpdate.save();
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  res.status(200).json({ place: placeToUpdate.toObject({ getters: true }) });
}

async function deletePlace(req, res, next) {
  const placeId = req.params.pid;
  let placeToDelete;

  try {
    placeToDelete = await Place.findById(placeId).populate("creator tags");
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!placeToDelete) return next(new HttpError("no such place found", 404));

  try {
    const session = await mongoose.mongoose.startSession();
    session.startTransaction();
    await placeToDelete.remove({ session });
    //remove from creator
    placeToDelete.creator.places.pull(placeToDelete);
    await placeToDelete.creator.save({ session });
    //remove from tags
    for (let tag of placeToDelete.tags){
      tag.places.pull(placeToDelete);
      await tag.save({ session });
    }

    await session.commitTransaction();
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }
  res.status(200).json({ message: "Deleted" });
}

exports.getplaces = getplaces;
exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.getPlaceByTagId = getPlaceByTagId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
