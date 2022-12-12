const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");

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
  },
];

function getPlaceById(req, res, next) {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place)
    return next(new HttpError("Could not find place with provided id", 404));
  res.json({ place });
}

function getPlaceByUserId(req, res, next) {
  const userId = req.params.uid;
  console.log(DUMMY_PLACES);
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });
  if (!places.length)
    return next(
      new HttpError("Could not find places with provided user id", 404)
    );
  res.json({ places });
}

async function createPlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed", 422));

  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(newPlace);
  res.status(201).json({ place: newPlace });
}

function updatePlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed", 422));

  const placeId = req.params.pid;
  const { title, description } = req.body;
  const placeToUpdate = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const index = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  placeToUpdate.title = title;
  placeToUpdate.description = description;

  DUMMY_PLACES[index] = placeToUpdate;

  res.status(200).json({ place: placeToUpdate });
}

function deletePlace(req, res, next) {
  const placeId = req.params.pid;
  const placeToDelete = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!placeToDelete) return next(new HttpError("no such place found", 404));

  DUMMY_PLACES = DUMMY_PLACES.findIndex((p) => p !== placeToDelete);

  res.status(200).json({ message: "Deleted" });
}

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
