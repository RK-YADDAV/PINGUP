import { Inngest } from "inngest";
import User  from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

//inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-User-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const {id, first_name, last_name, email_addresses} = event.data;
    let username = email_addresses[0].email_address.split('@')[0];

    const user= await User.findOne({ username });
    if(user){
        username= username + Math.floor(Math.random() * 10000);
    }
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      username,
      profile_picture: image_url
    };
    await User.create(userData);
  }
);
//inngest function to update user data in the database
const syncUserUpdate = inngest.createFunction(
  { id: "update-User-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses } = event.data;
    const updateUserData = {
      full_name: first_name + " " + last_name,
      email: email_addresses[0].email_address,
      profile_picture: image_url
    };
    await User.findByIdAndUpdate(id, updateUserData);
  }
);

//Inngest function to delete user data from the database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-User-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

//inngest function to send Reminder when a new connection request is added
const sendConnectionRequestReminder = inngest.createFunction(
  { id: "send-connection-request-reminder" },
  { event: "app/conneection-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    await step.run("send-connection-request-mail", async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
      const subject = `👋 New Connection Request`
      const body = 
      <div style="font-family: Arial, sans-serif; padding:20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981;">here</a> to accept or reject the request.</p>
        <br/>
        <p>Thanks,<br/>PingUp - Stay connected</p>
      </div>

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      });
    })
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run("send-connection-request-reminder", async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
      if(connection.status === "accepted"){
        return {message: "already accepted"}
      }
      const subject = `⏰ Reminder: Connection Request`
      const body = 
      <div style="font-family: Arial, sans-serif; padding:20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>This is a gentle reminder about the connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}.</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981;">here</a> to accept or reject the request.</p>
        <br/>
        <p>Thanks,<br/>PingUp - Stay connected</p>
      </div>

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      });
      return {message: "Reminder sent"}
    });
  }
);


// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdate,
    syncUserDeletion,
    sendConnectionRequestReminder
];