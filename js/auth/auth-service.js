import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword
} from "../../src/firebase/auth-service.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { firebaseAuth } from "../../src/firebase/auth-service.js";
import { firestore } from "../../src/firebase/firebase-config.js";

const STUDENT_ROLE = "STUDENT";
const ADMIN_ROLE = "ADMIN";

class AuthService {
  constructor() {
    this.currentUser = null;
    this.firebaseReady = false;

    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        this.currentUser = null;
        this.firebaseReady = true;
        return;
      }

      try {
        const userDoc = await getDoc(
          doc(firestore, "users", firebaseUser.uid)
        );

        if (userDoc.exists()) {
          const data = userDoc.data();

          this.currentUser = {
            id: firebaseUser.uid,
            name: data.name || firebaseUser.displayName || "",
            email: firebaseUser.email || data.email || "",
            role: data.role || STUDENT_ROLE,
            profileImage: data.profileImage || "",
            createdAt: data.createdAt || null
          };
        } else {
          this.currentUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            role: STUDENT_ROLE,
            profileImage: "",
            createdAt: null
          };
        }
      } catch (error) {
        console.error("Failed to load Firebase user profile:", error);
        this.currentUser = null;
      }

      this.firebaseReady = true;
    });
  }

  validateStudentEmail(email) {
    if (!email || typeof email !== "string") return false;

    return /^2[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      .test(email.trim());
  }

  validateAdminEmail(email) {
    if (!email || typeof email !== "string") return false;

    return /^3[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      .test(email.trim());
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.currentUser?.role === ADMIN_ROLE;
  }

  isStudent() {
    return this.currentUser?.role === STUDENT_ROLE;
  }

  async registerStudent({ name, email, password }) {
    if (!name || name.trim().length < 2) {
      throw new Error("Please enter your full name.");
    }

    if (!this.validateStudentEmail(email)) {
      throw new Error(
        'Student email must start with the digit "2" (e.g. 21student@college.edu).'
      );
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        cleanEmail,
        password
      );

      const user = credential.user;

      const profile = {
        name: name.trim(),
        email: cleanEmail,
        role: STUDENT_ROLE,
        profileImage: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(firestore, "users", user.uid), profile);

      this.currentUser = {
        id: user.uid,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        profileImage: profile.profileImage,
        createdAt: profile.createdAt
      };

      return this.currentUser;
    } catch (error) {
      console.error("Student registration failed:", error);

      if (error.code === "auth/email-already-in-use") {
        throw new Error("An account with this student email already exists.");
      }

      if (error.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      }

      if (error.code === "auth/weak-password") {
        throw new Error("Password must be at least 6 characters.");
      }

      throw new Error(error.message || "Student registration failed.");
    }
  }

  async registerAdmin({ name, email, password }) {
    if (!name || name.trim().length < 2) {
      throw new Error("Please enter administrator name.");
    }

    if (!this.validateAdminEmail(email)) {
      throw new Error(
        'Admin official email must start with the digit "3" (e.g. 3001admin@college.edu).'
      );
    }

    if (!password || password.length < 6) {
      throw new Error("Admin password must be at least 6 characters.");
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        cleanEmail,
        password
      );

      const user = credential.user;

      const profile = {
        name: name.trim(),
        email: cleanEmail,
        role: ADMIN_ROLE,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(firestore, "users", user.uid), profile);

      this.currentUser = {
        id: user.uid,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        profileImage: profile.profileImage,
        createdAt: profile.createdAt
      };

      return this.currentUser;
    } catch (error) {
      console.error("Admin registration failed:", error);

      if (error.code === "auth/email-already-in-use") {
        throw new Error("An account with this administrator email already exists.");
      }

      if (error.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      }

      if (error.code === "auth/weak-password") {
        throw new Error("Password must be at least 6 characters.");
      }

      throw new Error(error.message || "Admin registration failed.");
    }
  }

  async login({ email, password, expectedRole }) {
    if (!email) {
      throw new Error("Please enter your email address.");
    }

    if (!password) {
      throw new Error("Please enter your password.");
    }

    const cleanEmail = email.trim().toLowerCase();

    if (expectedRole === STUDENT_ROLE && !cleanEmail.startsWith("2")) {
      throw new Error('Student email addresses must start with the digit "2".');
    }

    if (expectedRole === ADMIN_ROLE && !cleanEmail.startsWith("3")) {
      throw new Error(
        'Administrator email addresses must start with the digit "3".'
      );
    }

    try {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        cleanEmail,
        password
      );

      const user = credential.user;

      const userDoc = await getDoc(
        doc(firestore, "users", user.uid)
      );

      if (!userDoc.exists()) {
        await signOut(firebaseAuth);
        throw new Error(
          "User profile was not found in the database."
        );
      }

      const data = userDoc.data();

      if (expectedRole && data.role !== expectedRole) {
        await signOut(firebaseAuth);
        throw new Error(
          `This account is not registered as an ${expectedRole}.`
        );
      }

      this.currentUser = {
        id: user.uid,
        name: data.name || "",
        email: user.email || data.email || "",
        role: data.role,
        profileImage: data.profileImage || "",
        createdAt: data.createdAt || null
      };

      return this.currentUser;
    } catch (error) {
      console.error("Login failed:", error);

      if (
        error.message &&
        (
          error.message.includes("not registered") ||
          error.message.includes("profile was not found")
        )
      ) {
        throw error;
      }

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        throw new Error("Invalid email or password.");
      }

      if (error.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      }

      throw new Error(error.message || "Login failed.");
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    const user = firebaseAuth.currentUser;

    if (!user || user.uid !== userId) {
      throw new Error("You must be logged in to change your password.");
    }

    try {
      await updatePassword(user, newPassword);
      return true;
    } catch (error) {
      console.error("Password change failed:", error);

      if (error.code === "auth/requires-recent-login") {
        throw new Error(
          "For security, please log in again before changing your password."
        );
      }

      throw new Error(error.message || "Unable to change password.");
    }
  }

  async updateProfileImage(userId, imageUrl) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    await updateDoc(
      doc(firestore, "users", userId),
      {
        profileImage: imageUrl || ""
      }
    );

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser.profileImage = imageUrl || "";
    }

    return this.currentUser;
  }

  async logout() {
    await signOut(firebaseAuth);
    this.currentUser = null;
  }
}

export const auth = new AuthService();
