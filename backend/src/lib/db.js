import mongose from "mongoose";
export const connectionDB = async () => {
  try {
    const con = await mongose.connect(process.env.MONGODB_URI);
    console.log("DB is Connected", con.connection.host);
  } catch (error) {
    console.log("MONGOSE connection error", error);
  }
};
