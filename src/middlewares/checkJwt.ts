require("dotenv").config();

import {Request, Response, NextFunction} from "express";
import {User} from "../entity/User";
import * as jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
	//Get the jwt token from the head
	let token: string = <string>req.headers["authorization"];
	let jwtPayload;

	//Try to validate the token and get data
	try {
		jwtPayload = <any>jwt.verify(token.replace("Bearer ", ""), jwtSecret);
		res.locals.jwtPayload = jwtPayload;
		res.locals.infoUser = await User.findOneOrFail({
			select: ["id", "fullname", "email", "sex"],
			where: {email: jwtPayload.email},
		});
		// console.log(jos);
	} catch (error) {
		const result = {
			error: false,
			message: "Unauthorized",
			data: [],
		};
		res.status(401).json(result);
		return;
	}

	//Call the next middleware or controller
	next();
};
