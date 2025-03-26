import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../modules/message.model.js";
import user from "../modules/user.model.js";
export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInuserId = req.user._id;
    const filteredUsers = await user
      .find({
        _id: { $ne: loggedInuserId },
      })
      .select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getuserForSidebar", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const message = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in get messsage controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id; // Now spelled correctly
    const senderId = req.user._id; // Already an ObjectId

    let imageUrl;
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadedResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId, // Now matches your corrected schema
      text,
      image: imageUrl,
    });

    await newMessage.save();

    //socket io integration
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in get sendMessage controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
