import {Request, Response} from "express";
import {getRepository} from "typeorm";
import {validate} from "class-validator";

import {User} from "../entity/User";

class UserController {
	//
	static listAll = async (req: Request, res: Response) => {
		//Get users from database
		const users = await User.find({
			select: ["id", "fullname", "email", "sex"], //limit response
		});

		const result = {
			error: false,
			message: "List All User",
			data: users,
		};
		//Send the users object
		res.json(result);
	};

	static infoUser = async (req: Request, res: Response) => {
		//Get the ID from the url
		const infoUser = res.locals.infoUser;
		const result = {
			error: false,
			message: "Info User",
			data: infoUser,
		};
		res.status(200).json(result);
	};

	static getOneById = async (req: Request, res: Response) => {
		//Get the ID from the url
		const id: number = req.params.id;

		try {
			//Get the user from database
			const user = await User.findOneOrFail(id, {
				select: ["id", "fullname", "email", "sex"],
			});
			const result = {
				error: false,
				message: "Detail User",
				data: user,
			};
			res.status(200).json(result);
		} catch (error) {
			const result = {
				error: false,
				message: "User not found",
				data: [],
			};
			res.status(404).json(result);
		}
	};

	static newUser = async (req: Request, res: Response) => {
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
			res.status(400).json(errors);
			return;
		}

		//Hash the password, to securely store on DB
		user.hashPassword();

		try {
			await User.save(user);
		} catch (e) {
			const result = {
				error: true,
				message: "Email already in use",
				data: [],
			};
			res.status(400).json(result);
			return;
		}
		const result = {
			error: false,
			message: "User Created",
			data: user,
		};
		res.status(200).json(result);
	};
}

export default UserController;
