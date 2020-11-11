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
			message: "List User",
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
			res.status(404).json("User not found");
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
			res.status(409).json("email already in use");
			return;
		}
		const result = {
			error: false,
			message: "User Created",
			data: user,
		};
		res.status(200).json(result);
	};

	static editUser = async (req: Request, res: Response) => {
		//Get the ID from the url
		const id = req.params.id;

		//Get values from the body
		const {username, role} = req.body;

		let user;
		//Try to find user on database
		try {
			user = await User.findOneOrFail(id);
		} catch (error) {
			//If not found, send a 404 response
			res.status(404).json("User not found");
			return;
		}

		//Validate the new values on model
		user.username = username;
		user.role = role;
		const errors = await validate(user);
		if (errors.length > 0) {
			res.status(400).json(errors);
			return;
		}

		//Try to safe, if fails, that means username already in use
		try {
			await User.save(user);
		} catch (e) {
			res.status(409).json("username already in use");
			return;
		}
		//After all send a 204 (no content, but accepted) response
		res.status(204).json("User updated");
	};

	static deleteUser = async (req: Request, res: Response) => {
		//Get the ID from the url
		const id = req.params.id;

		let user: User;
		try {
			user = await User.findOneOrFail(id);
		} catch (error) {
			res.status(404).json("User not found");
			return;
		}
		User.delete(id);

		//After all send a 204 (no content, but accepted) response
		res.status(204).json("User deleted");
	};
}

export default UserController;
