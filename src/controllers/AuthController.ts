require("dotenv").config();

import {Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {validate} from "class-validator";

import {User} from "../entity/User";
const jwtSecret = process.env.JWT_SECRET;

class AuthController {
	static register = async (req: Request, res: Response) => {
		//Get parameters from the body
		let {fullname, email, password, sex} = req.body;
		let user = new User();
		user.fullname = fullname;
		user.sex = sex;
		user.email = email;
		user.password = password;

		//Validate if the parameters are ok
		const errors = await validate(user);
		if (errors.length > 0) {
			const result = {
				error: true,
				message: errors,
				data: [],
			};
			res.status(400).json(result);
			return;
		}

		//Hash the password, to securely store on DB
		user.hashPassword();

		try {
			await User.save(user);
			const token = jwt.sign({userId: user.id, email: user.email}, jwtSecret, {
				expiresIn: "24h",
			});

			const result = {
				error: false,
				message: "User Created",
				data: {
					token: token,
					user: user,
				},
			};
			res.status(200).json(result);
		} catch (e) {
			const result = {
				error: true,
				message: "Email already in use",
				data: [],
			};
			res.status(409).json(result);
			return;
		}
	};

	static login = async (req: Request, res: Response) => {
		//Check if email and password are set
		let {email, password} = req.body;
		if (!(email && password)) {
			const result = {
				error: true,
				message: "Parameter Missing",
				data: [],
			};
			res.status(400).json(result);
		}

		let user: User;
		try {
			// Get user from database
			user = await User.findOneOrFail({where: {email}});
		} catch (error) {
			const result = {
				error: true,
				message: "Email Not Found",
				data: [],
			};
			res.status(400).json(result);
		}

		//Check if encrypted password match
		if (!user.checkIfUnencryptedPasswordIsValid(password)) {
			const result = {
				error: true,
				message: "Password Incorrect",
				data: [],
			};
			res.status(400).json(result);
			return;
		}

		//Sing JWT, valid for 24 hour
		const token = jwt.sign({userId: user.id, email: user.email}, jwtSecret, {
			expiresIn: "24h",
		});

		//Send the jwt in the response
		const result = {
			error: false,
			message: "Login Success",
			data: {
				token: token,
				user: user,
			},
		};
		res.status(200).json(result);
	};
}

export default AuthController;
