import {Router} from "express";
import AuthController from "../controllers/AuthController";
import {checkJwt} from "../middlewares/checkJwt";

const router = Router();

//Register route
router.post("/register", AuthController.register);
//Login route
router.post("/login", AuthController.login);

export default router;
