import User from "../mongodb/models/user.js";

async function getAllUsers(request, response) {
  try {
    const users = await User.find({}).limit(request.query._end);

    response.status(200).json(users);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

async function createUser(request, response) {
  try {
    const { name, email, avatar } = request.body;

    const userExists = await User.findOne({ email });

    if (userExists) return response.status(200).json(userExists);

    const newUser = await User.create({
      name,
      email,
      avatar,
    });

    response.status(200).json(newUser);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

async function getUserInfoByID(request, response) {
  try {
    const { id } = request.params;

    const user = await User.findOne({ _id: id }).populate("allProperties");

    if (user) {
      response.status(200).json(user);
    } else {
      response.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

export {
  getAllUsers,
  createUser,
  getUserInfoByID
};