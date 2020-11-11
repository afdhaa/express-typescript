import {Router} from "express";
import UserController from "../controllers/UserController";
import {checkJwt} from "../middlewares/checkJwt";
// import { checkRole } from '../middlewares/checkRole';

const router = Router();

//Get all users
router.get("/", [checkJwt], UserController.listAll);

// Get one user
router.get("/:id([0-9]+)", [checkJwt], UserController.getOneById);

//Create a new user
router.post("/", [checkJwt], UserController.newUser);

//Info User
router.get("/infouser", [checkJwt], UserController.infoUser);

export default router;
