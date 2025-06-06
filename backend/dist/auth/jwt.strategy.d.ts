import { Repository } from 'typeorm';
import { Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private userRepository;
    constructor(userRepository: Repository<User>);
    validate(payload: any): Promise<Omit<User, "password" | "hashPassword" | "validatePassword" | "toResponseObject">>;
}
export {};
