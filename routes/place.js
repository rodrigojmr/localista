'use strict';

const express = require('express');
const Place = require('../models/place');

const routeAuthenticationGuard = require('../middleware/route-guard');

const fileUploader = require('../cloudinary-config');
const placeImages = fileUploader.array('images');

const placeRouter = new express.Router();

placeRouter.get('/all', async (req, res, next) => {
  try {
    const places = Place.find({}).populate('owner');
    res.json({ places });
  } catch (error) {
    next(error);
  }
});

placeRouter.get('/nearby', (req, res, next) => {
  const { neLat, neLng, swLat, swLng } = req.query;

  Place.find({})
    .where('location.coordinates.0')
    .lt(neLat)
    .gte(swLat)
    .where('location.coordinates.1')
    .gte(swLng)
    .lt(neLng)

    // .populate('creator')
    // .sort({ creationDate: -1 })
    .then(places => {
      res.json({ places });
    })
    .catch(error => {
      next(error);
    });
});

placeRouter.get('/:id', async (req, res, next) => {
  const id = req.params.id;

  try {
    const place = await Place.findById(id)
      .populate('owner supports')
      .populate({
        path: 'supports',
        populate: {
          path: 'creator',
          model: 'User',
          select: { _id: 1, username: 1, name: 1, avatar: 1 }
        }
      });
    if (place) {
      res.json({ place });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

placeRouter.post('/', placeImages, async (req, res, next) => {
  const {
    name,
    place_id,
    category,
    formatted_address,
    address_components,
    openDate,
    openTime,
    closeTime,
    weekDayOpen,
    weekDayClose,
    phoneNumber,
    email,
    website,
    instagram,
    location,
    about
  } = req.body;

  try {
    let images;
    if (!req.files) {
      images = '';
    } else {
      images = req.files.map(image => image.path);
    }
    const place = await Place.create({
      owner: req.user._id,
      name,
      category,
      openDate,
      schedule: {
        from: weekDayOpen,
        to: weekDayClose,
        time: {
          openTime,
          closeTime
        }
      },
      contacts: {
        phoneNumber,
        email,
        instagram,
        website
      },
      about,
      formatted_address,
      address_components,
      place_id,
      location: {
        coordinates: [location.lat, location.lng]
      },
      images
    });
    res.json({ place });
  } catch (error) {
    next(error);
  }
});

placeRouter.delete('/:id', routeAuthenticationGuard, async (req, res, next) => {
  const id = req.params.id;

  Place.findOneAndDelete({ _id: id, creator: req.user._id })
    .then(() => {
      res.json({});
    })
    .catch(error => {
      next(error);
    });
});

placeRouter.patch('/:id', (req, res, next) => {
  const {
    name,
    category,
    openDate,
    address,
    areaName,
    weekDayFrom,
    weekDayTo,
    openTime,
    closeTime,
    phoneNumber,
    email,
    latitude,
    longitude
  } = req.body;

  const id = req.params.id;

  Place.findOneAndUpdate(
    { _id: id, creator: req.user._id },
    {
      owner: req.user._id,
      name,
      category,
      openDate,
      schedule: {
        from: weekDayFrom,
        to: weekDayTo,
        time: {
          openTime,
          closeTime
        }
      },
      contacts: {
        phoneNumber,
        email
      },
      address,
      areaName,
      location: {
        coordinates: [latitude, longitude]
      }
    },
    { new: true }
  )
    .then(post => {
      res.json({ post });
    })
    .catch(error => {
      next(error);
    });
});

module.exports = placeRouter;
