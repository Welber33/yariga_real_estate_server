import User from '../mongodb/models/user.js'

async function getAllUsers(request, response) { }

async function createUser(request, response) {
  try {
    const { name, email, avatar } = request.body;

    const userExists = await User.findOne({ email })

    if (userExists) return response.status(200).json(userExists);

    const newUser = await User.create({
      name,
      email,
      avatar,
    });

    return response.status(200).json(newUser);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }

}

async function getUserInfoByID(request, response) { }

export {
  getAllUsers,
  createUser,
  getUserInfoByID,
}