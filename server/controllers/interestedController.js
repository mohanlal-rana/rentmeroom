import Interested from "../models/interestedMOdel.js"
import Room from "../models/roomModel.js"

export const markInterested=async(req,res)=>{
  try {
    const {roomId,message}=req.body
    const room=await Room.findById(roomId)
    if(!room){
      return res.status(404).json({success:false,message:"no room is found"})
    }
    const alreadyInterested=await Interested.findOne({user:req.user._id,room:roomId})
    if(alreadyInterested){
      return res.status(400).json({success:false,message:"you have already marked interest for this room"})
    }
    const interested=new Interested({
      user:req.user._id,
      room:roomId,
      message
    })
    await interested.save()
    res.status(200).json({success:true,message:"interest marked successfully",interested})
  } catch (error) {
        console.error("Error marking interest:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to mark interest",
      error: error.message,
    });
  }
}
export const getInterestedRooms=async(req,res)=>{
  try {
    const interestedRooms=await Interested.find({user:req.user._id}).populate("room")
    res.status(200).json({success:true,message:"interested rooms fetched successfully",interestedRooms})
  } catch (error) {
        console.error("Error fetching interested rooms:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch interested rooms",
      error: error.message,
    });
  }
}