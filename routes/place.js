const express = require('express');

const Place = require('../models/place');

const routeAuthenticationGuard = require('../middleware/route-guard');

const multer = require('multer');
const cloudinary = require('cloudinary');
const multerStorageCloudinary = require('multer-storage-cloudinary');

const placeRouter = new express.Router();

const storage = new multerStorageCloudinary.CloudinaryStorage({
  cloudinary: cloudinary.v2
});
const upload = multer({ storage });

placeRouter.get('/list', (req, res, next) => {
  Place.find()
    .populate('creator')
    .sort({ creationDate: -1 })
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
    const place = await (
      await Place.findById(id).populate('owner suggestions')
    ).populated({
      path: 'suggestions',
      populate: {
        path: 'user',
        model: 'User'
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

placeRouter.post('/', routeAuthenticationGuard, async (req, res, next) => {
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

  Place.create({
    owner: req.user._id,
    name,
    category,
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
  })
    .then(place => {
      res.json({ place });
    })
    .catch(error => {
      next(error);
    });
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

placeRouter.patch('/:id', routeAuthenticationGuard, (req, res, next) => {
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
      name,
      category,
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
