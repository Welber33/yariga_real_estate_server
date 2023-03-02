import User from "../mongodb/models/user.js";
import Property from "../mongodb/models/property.js"

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function getAllProperties(request, response) {
  try {
    const properties = await Property.find({}).limit(request.query._end)

    response.status(200).json(properties)
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}

async function getPropertyDetail(request, response) { }

async function createProperty(request, response) {
  try {
    const {
      title,
      description,
      propertyType,
      location,
      price,
      photo,
      email,
    } = request.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findOne({ email }).session(session);

    if (!user) throw new Error("User not found");

    const photoUrl = await cloudinary.uploader.upload(photo);

    const newProperty = await Property.create({
      title,
      description,
      propertyType,
      location,
      price,
      photo: photoUrl.url,
      creator: user._id,
    });

    user.allProperties.push(newProperty._id);
    await user.save({ session });

    await session.commitTransaction();

    response.status(200).json({ message: "Property created successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
}

async function updateProperty(request, response) { }

async function deleteProperty(request, response) { }


export {
  getAllProperties,
  getPropertyDetail,
  createProperty,
  updateProperty,
  deleteProperty,
}