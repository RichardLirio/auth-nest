import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class UserOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 256 })
  name: string;

  @Column({ length: 256, unique: true })
  email: string;

  @Column({ length: 256 })
  password: string;

  @Column({ default: "user" })
  role: "user" | "admin";

  @Column({ type: "timestamp", nullable: true })
  lastLogin?: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
