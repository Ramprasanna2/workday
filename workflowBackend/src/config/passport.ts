import { PassportStatic } from "passport";
import { Strategy as LocalStrategy} from "passport-local";
import { Employee } from "../model/model"; // Assuming you have an IEmployee interface for your model
import bcrypt from "bcrypt"

export default function(passport: PassportStatic) {
  passport.use("local",
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
       
        const user = await Employee.findOne({ email });
        if (!user) return done(null, false, { message: "No user found" });

        const isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch) {
          console.log("pssword faailes");
          return done(null, false, { message: "Invalid password" });
        }
        console.log("doen")
        return done(null, user);
      } catch (err) {
        console.log("error")
        return done(err);
      }
    })
  );

  passport.serializeUser((user: typeof Employee.prototype, done) => done(null, user._id));
  passport.deserializeUser(async (id:string, done) => {
    try {
      const user = await Employee.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}