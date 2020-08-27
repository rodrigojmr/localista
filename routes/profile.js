'use strict';

const express = require('express');
const User = require('../models/user');

const routeAuthenticationGuard = require('../middleware/route-guard');

const fileUploader = require('../cloudinary-config');
const bcrypt = require('bcrypt');

const profileRouter = new express.Router();

profileRouter.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  console.log('req.params: ', req.params);
  try {
    const user = await User.findById(id)
      .select('username name avatar email locality supports info')
      .populate('supports')
      .populate({
        path: 'supports',
        populate: {
          path: 'place',
          model: 'Place',
          select: '_id name category address_components images'
        }
      });
    if (user) {
      console.log('user: ', user);
      res.json({ user });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

profileRouter.patch('/:id', fileUploader.single('avatar'), async (req, res, next) => {
  const { name, username, password, gender, birthday, privateAddress, email } = req.body;
  console.log('req.body: ', req.body);
  const id = req.params.id;
  let url;
  if (req.file) {
    url = req.file.path;
  }

  const locality = privateAddress.find(
    component =>
      component.types.includes('locality') ||
      component.types.includes('administrative_area_level_1')
  ).short_name;
  try {
    if (password.length > 1 && password.length < 8) {
      throw new Error('Password is too short.');
    } else if (password.length >= 8) {
      const hashAndSalt = await bcrypt.hash(password, 10);
      const user = await User.findByIdAndUpdate(
        id,
        {
          passwordHashAndSalt: hashAndSalt
        },
        { new: true }
      );
      user.save();
    }
    const user = await User.findByIdAndUpdate(
      id,
      {
        user: req.user._id,
        name,
        username,
        gender,
        birthday,
        privateAddress,
        locality,
        email,
        avatar: url
      },
      { new: true }
    );
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

profileRouter.delete('/:id', routeAuthenticationGuard, async (req, res, next) => {
  const id = req.params.id;

  User.findOneAndDelete({ _id: id, creator: req.user._id })
    .then(() => {
      res.json({});
    })
    .catch(error => {
      next(error);
    });
});

module.exports = profileRouter;
