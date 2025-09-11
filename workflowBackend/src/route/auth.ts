import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Login (Session + JWT)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: true }, (err:any , user:any, info:any) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });
    
    // Login with session
    req.logIn(user, (err) => {
      if (err) return next(err);

      // Create JWT token
      const token = jwt.sign(
  {
    employeeId: user._id,
    managerId: user.jobInfo?.managerId || null,
    email: user.email,
    role: user.role,
    department: user.jobInfo?.departmentId || null,
  },
  process.env.JWT_SECRET || "secretkey",
  { expiresIn: "1h" }
);

      return res.json({
        message: "Login successful",
  user: {
    employeeId: user._id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    managerId:user.jobInfo?.managerId || null,
    department: user.jobInfo?.departmentId || null
  },ok:true,
        token,
      });
    });
  })(req, res, next);
});

// Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Error logging out" });
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/get",(req,res)=>{
const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    res.json({
      message: "Secure route",
      user: decoded, // this will include { id, role } from when you signed the token
    });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
});
export default router;
