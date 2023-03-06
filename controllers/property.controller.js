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
  const {
    _end,
    _order,
    _start,
    _sort,
    title_like = "",
    propertyType = "",
  } = request.query;

  const query = {};

  if (propertyType !== "") {
    query.propertyType = propertyType;
  }

  if (title_like) {
    query.title = { $regex: title_like, $options: "i" };
  }

  try {
    const count = await Property.countDocuments({ query });

    const properties = await Property.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });

    response.header("x-total-count", count);
    response.header("Access-Control-Expose-Headers", "x-total-count");

    response.status(200).json(properties);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
}

async function getPropertyDetail(request, response) {
  const { id } = request.params

  const propertyExists = await Property.findOne({ _id: id }).populate("creator")

  if(propertyExists) {
    response.status(200).json(propertyExists)
  } else {
    response.status(404).json({ message: "Property not found" })
  }
 }

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

async function updateProperty(request, response) { 
  try {
    const { id } = request.params
    const { title, description, propertyType, location, price, photo } = request.body

    const photoUrl = await cloudinary.uploader.upload(photo)

    await Property.findByIdAndUpdate({ _id: id }, {
      title,
      description,
      propertyType,
      location,
      price,
      photo: photoUrl.url || photo
    })

    response.status(200).json({ message: "Property updated successfully! "})
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
}

async function deleteProperty(request, response) { 
  try {
    const { id } = request.params

    const propertyToDelete = await Property.findById({ _id: id }).populate("creator")

    if(!propertyToDelete) throw new Error("Property  not found!")

    const session = await mongoose.startSession();
    session.startTransaction();

    propertyToDelete.remove({ session })
    propertyToDelete.creator.allProperties.pull(propertyToDelete)
    
    await propertyToDelete.creator.save({ session })
    await session.commitTransaction()

    response.status(200).json({ message: "Property deleted successfully" })
  } catch (error) {
    
  }
}


export {
  getAllProperties,
  getPropertyDetail,
  createProperty,
  updateProperty,
  deleteProperty,
}