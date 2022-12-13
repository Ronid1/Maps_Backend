const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description:
      "The Empire State Building is a 102-story Art Deco skyscraper in Midtown Manhattan, New York City",
    location: {
      lat: 40.7484,
      lng: -73.9857,
    },
    address: "20 W 34th St., New York, NY 10001, United States",
    creator: "u1",
    tag: "t1",
  },
];

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

  const { title, description, address, creator, tag } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    creator,
    tag,
  });
  try {
    await newPlace.save();
  } catch {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  res.status(201).json({ place: newPlace });
}

async function updatePlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed", 422));

  const placeId = req.params.pid;
  const { title, description, tag } = req.body;
  let placeToUpdate;
  try {
    placeToUpdate = await Place.findById(placeId);
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }
  const index = DUMMY_PLACES.findIndex((place) => place.id === placeId);
  placeToUpdate.title = title;
  placeToUpdate.description = description;
  placeToUpdate.tag = tag;

  try {
    placeToUpdate.save();
  } catch (error) {
    return next(new HttpError("Something went wrong", 500));
  }

  res.status(200).json({ place: placeToUpdate.toObject({ getters: true }) });
}

async function deletePlace(req, res, next) {
  const placeId = req.params.pid;
  let placeToDelete;
  try {
    placeToDelete = await Place.findById(placeId);
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!placeToDelete) return next(new HttpError("no such place found", 404));

  try {
    await placeToDelete.remove();
  } catch {
    return next(new HttpError("Something went wrong", 500));
  }

  res.status(200).json({ message: "Deleted" });
}

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.getPlaceByTagId = getPlaceByTagId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
