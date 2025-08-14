import { Inngest } from "inngest";
import { User } from "../models.js/User";

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

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdate,
    syncUserDeletion
];