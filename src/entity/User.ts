import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	Unique,
	CreateDateColumn,
	UpdateDateColumn,
	BaseEntity,
} from "typeorm";
import {Length, IsNotEmpty} from "class-validator";
import * as bcrypt from "bcryptjs";

@Entity({
	name: "user",
})
@Unique(["email"])
export class User extends BaseEntity {
	//

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@Length(4, 100)
	fullname: string;

	@Column()
	@Length(4, 100)
	email: string;

	@Column()
	@Length(4, 100)
	password: string;

	@Column()
	@Length(1)
	sex: string;

	hashPassword() {
		this.password = bcrypt.hashSync(this.password, 8);
	}

	checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
		return bcrypt.compareSync(unencryptedPassword, this.password);
	}
}
