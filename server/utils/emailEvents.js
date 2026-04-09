import sendEmail from "./sendEmail.js";

export const sendOwnerRequestToAdmin = async (adminEmail, ownerName) => {
    await sendEmail({
        to: adminEmail,
        subject: "New Owner Request",
        text: `A new user (${ownerName}) has requested to become an owner. Please verify.`,
    });
};
export const sendRoomAddedToAdmin = async (adminEmail, roomTitle) => {
    await sendEmail({
        to: adminEmail,
        subject: "New Room Added",
        text: `A new room "${roomTitle}" has been added and is waiting for verification.`,
    });
};
export const sendOwnerVerifiedMail = async (ownerEmail) => {
    await sendEmail({
        to: ownerEmail,
        subject: "Owner Verified",
        text: "Congratulations! Your owner account has been verified. You can now add rooms.",
    });
};
export const sendRoomVerifiedMail = async (ownerEmail, roomTitle) => {
    await sendEmail({
        to: ownerEmail,
        subject: "Room Verified",
        text: `Your room "${roomTitle}" has been approved and is now live.`,
    });
};
export const sendInterestMailToOwner = async (ownerEmail, roomTitle, userName) => {
    await sendEmail({
        to: ownerEmail,
        subject: "New Interested User",
        text: `${userName} is interested in your room "${roomTitle}". Check your dashboard.`,
    });
};
export const sendInterestConfirmedMailToUser = async (
    userEmail,
    userName,
    roomTitle,
    ownerName
) => {
    await sendEmail({
        to: userEmail,
        subject: "Your Interest Has Been Accepted 🎉",
        text: `Hi ${userName},

Good news! Your interest in the room "${roomTitle}" has been accepted by ${ownerName}.

Please visit your account/dashboard on RentMeRoom to view more details and proceed further.

Thank you for using RentMeRoom!`,
    });
};